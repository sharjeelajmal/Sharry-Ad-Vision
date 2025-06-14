// src/models/Stat.js
import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: String, // Storing as string as per your existing data ("4123", "112306")
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.models.Stat || mongoose.model('Stat', statSchema);