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
    set: v => parseFloat(v.toFixed(2)) // 2 decimal places ko ensure karta hai
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
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  orderIndex: { // Yeh pehle se tha drag & drop ke liye
    type: Number,
    default: 0,
  },
  
  // ▼▼▼ YEH DO NAYE FIELDS ADD KIYE GAYE HAIN ▼▼▼
  
  // Service ko hide/unhide karne ke liye
  isHidden: {
    type: Boolean,
    default: false, // Default mein service visible rahegi
  },
  
  // Service ID add karne ke liye
  serviceId: {
    type: String,
    trim: true,
    default: '', // Default mein ID khaali rahegi
  },
  
  // ▲▲▲ UPAR WALE DO NAYE FIELDS ADD KIYE GAYE HAIN ▲▲▲

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

// 'updatedAt' field ko save karne se pehle update karta hai
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Search ke liye text index
serviceSchema.index({
  title: 'text',
  description: 'text',
  category: 'text'
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

export default Service;