// src/models/Media.js
import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  filetype: {
    type: String, // 'image' ya 'video'
    required: true,
  },
}, { timestamps: true });

const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);

export default Media;