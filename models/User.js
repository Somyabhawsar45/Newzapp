const mongoose = require('mongoose');

const ArticleSchema = {
  title: String,
  description: String,
  url: String,
  urlToImage: String,
  publishedAt: String,
  source: { name: String },
  category: String,
};

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  savedArticles: [ArticleSchema],
  readHistory: [{ ...ArticleSchema, readAt: Date }],
  savedArticles: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);