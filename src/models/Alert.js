// src/models/Alert.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  isActive: { // Agar aap isko frontend se control karna chahen
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);