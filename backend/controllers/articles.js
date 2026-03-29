import xss     from 'xss';
import Article from '../models/Article.js';

const CATS = ['news','sports','tech','finance','media','culture','gaming','travel','latest'];

// GET /api/articles
export const getArticles = async (req, res) => {
  try {
    const { category, tag, search, sort = 'newest', page = 1, limit = 12 } = req.query;
    const q = {};

    if (category && category !== 'all' && CATS.includes(category)) q.category = category;
    if (tag)    q.tags = { $regex: tag, $options: 'i' };
    if (search) q.$or = [
      { title: { $regex: xss(search), $options: 'i' } },
      { body:  { $regex: xss(search), $options: 'i' } },
      { tags:  { $regex: xss(search), $options: 'i' } }
    ];

    const sortMap = { newest: { createdAt: -1 }, views: { views: -1 }, likes: { likeCount: -1, createdAt: -1 }, trending: { views: -1, createdAt: -1 } };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const skip    = (Number(page) - 1) * Number(limit);
    const total   = await Article.countDocuments(q);
    const articles = await Article.find(q).sort(sortOpt).skip(skip).limit(Number(limit))
      .select('title slug summary image category tags authorName views likes readTime featured trending createdAt');

    const featured  = await Article.findOne({ featured: true }).sort({ createdAt: -1 })
      .select('title slug summary image category authorName views likes readTime createdAt');
    const trending  = await Article.find({ trending: true }).limit(5).sort({ views: -1 })
      .select('title slug image category readTime views');
    const allTags   = await Article.distinct('tags');

    res.json({ success: true, articles, featured, trending, allTags,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch articles.' });
  }
};

// GET /api/articles/search?q=
export const liveSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, results: [] });
    const results = await Article.find({
      $or: [{ title: { $regex: xss(q), $options: 'i' } }, { tags: { $regex: xss(q), $options: 'i' } }]
    }).limit(6).select('title slug category readTime image');
    res.json({ success: true, results });
  } catch { res.json({ success: true, results: [] }); }
};

// GET /api/articles/:id
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('comments.author', 'username avatar');

    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });

    const related = await Article.find({
      category: article.category, _id: { $ne: article._id }
    }).limit(4).sort({ createdAt: -1 }).select('title slug summary image category readTime views');

    res.json({ success: true, article, related });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed.' });
  }
};

// POST /api/articles
export const createArticle = async (req, res) => {
  try {
    const { title, body, image, category, tags, featured } = req.body;
    if (!title?.trim() || !body?.trim())
      return res.status(400).json({ success: false, message: 'Title and body required.' });

    const tagsArr = tags
      ? (Array.isArray(tags) ? tags : tags.split(',').map(t => xss(t.trim())).filter(Boolean))
      : [];

    const article = await Article.create({
      title:      xss(title.trim()),
      body:       xss(body),
      image:      xss(image || ''),
      category:   category || 'news',
      tags:       tagsArr,
      featured:   !!featured,
      author:     req.user.id,
      authorName: req.user.username
    });

    res.status(201).json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create.' });
  }
};

// PUT /api/articles/:id
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not your article.' });

    const allowed = ['title','body','image','category','tags','featured','trending'];
    allowed.forEach(k => { if (req.body[k] !== undefined) article[k] = req.body[k]; });
    await article.save();
    res.json({ success: true, article });
  } catch { res.status(500).json({ success: false, message: 'Update failed.' }); }
};

// DELETE /api/articles/:id
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not your article.' });
    await article.deleteOne();
    res.json({ success: true, message: 'Deleted.' });
  } catch { res.status(500).json({ success: false, message: 'Delete failed.' }); }
};

// POST /api/articles/:id/like
export const toggleLike = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });
    const uid = req.user.id;
    const liked = article.likes.some(id => id.toString() === uid);
    liked ? article.likes.pull(uid) : article.likes.push(uid);
    await article.save();
    res.json({ success: true, liked: !liked, count: article.likes.length });
  } catch { res.status(500).json({ success: false, message: 'Failed.' }); }
};

// POST /api/articles/:id/bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });
    const uid = req.user.id;
    const bm  = article.bookmarks.some(id => id.toString() === uid);
    bm ? article.bookmarks.pull(uid) : article.bookmarks.push(uid);
    await article.save();
    res.json({ success: true, bookmarked: !bm });
  } catch { res.status(500).json({ success: false, message: 'Failed.' }); }
};

// POST /api/articles/:id/comments
export const addComment = async (req, res) => {
  try {
    const text = xss(req.body.text?.trim());
    if (!text) return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });
    article.comments.push({ author: req.user.id, username: req.user.username, text });
    await article.save();
    const comment = article.comments[article.comments.length - 1];
    res.status(201).json({ success: true, comment });
  } catch { res.status(500).json({ success: false, message: 'Failed.' }); }
};

// DELETE /api/articles/:id/comments/:cid
export const deleteComment = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Not found.' });
    const comment = article.comments.id(req.params.cid);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not your comment.' });
    comment.deleteOne();
    await article.save();
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: 'Failed.' }); }
};
