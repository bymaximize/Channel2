import { Router } from 'express';
import {
  getArticles, liveSearch, getArticle,
  createArticle, updateArticle, deleteArticle,
  toggleLike, toggleBookmark, addComment, deleteComment
} from '../controllers/articles.js';
import { protect, softAuth } from '../middleware/auth.js';

const router = Router();

router.get('/search',                    liveSearch);
router.get('/',          softAuth,       getArticles);
router.post('/',         protect,        createArticle);
router.get('/:id',       softAuth,       getArticle);
router.put('/:id',       protect,        updateArticle);
router.delete('/:id',    protect,        deleteArticle);
router.post('/:id/like',     protect,    toggleLike);
router.post('/:id/bookmark', protect,    toggleBookmark);
router.post('/:id/comments', protect,    addComment);
router.delete('/:id/comments/:cid', protect, deleteComment);

export default router;
