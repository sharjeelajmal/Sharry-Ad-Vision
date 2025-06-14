// src/models/Tab.js
import mongoose from 'mongoose';

const tabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Tab names unique honge
    trim: true,
  },
}, { timestamps: true });

export default mongoose.models.Tab || mongoose.model('Tab', tabSchema);