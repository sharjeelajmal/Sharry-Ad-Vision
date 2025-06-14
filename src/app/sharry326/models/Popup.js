import mongoose from 'mongoose';

const popupSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

popupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Popup = mongoose.models.Popup || mongoose.model('Popup', popupSchema);
export default Popup;