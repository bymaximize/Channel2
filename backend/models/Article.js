import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text:     { type: String, required: true, maxlength: 500 }
}, { timestamps: true });

const articleSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true, maxlength: 200 },
  slug:       { type: String, unique: true, lowercase: true },
  body:       { type: String, required: true },
  summary:    { type: String, maxlength: 300 },
  image:      { type: String, default: '' },
  category: {
    type: String,
    enum: ['news','sports','tech','finance','media','culture','gaming','travel','latest'],
    default: 'news'
  },
  tags:       [{ type: String, trim: true, maxlength: 30 }],
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  views:      { type: Number, default: 0 },
  likes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:   [commentSchema],
  featured:   { type: Boolean, default: false },
  readTime:   { type: Number, default: 1 },
  trending:   { type: Boolean, default: false }
}, { timestamps: true });

// Auto slug + readTime
articleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  if (this.isModified('body')) {
    const words = this.body.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
    if (!this.summary) this.summary = this.body.slice(0, 200);
  }
  next();
});

articleSchema.virtual('likeCount').get(function () { return this.likes.length; });
articleSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Article', articleSchema);
