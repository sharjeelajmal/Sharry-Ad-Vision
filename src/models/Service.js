import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  quantity: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: '',
    trim: true
    // Removed URL validation completely
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  orderIndex: { // NEW FIELD FOR DRAG & DROP ORDER
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add text index for searching
serviceSchema.index({
  title: 'text',
  description: 'text',
  category: 'text'
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

export default Service;