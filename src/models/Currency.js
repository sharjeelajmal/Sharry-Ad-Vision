// models/Currency.js
import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Currency code must be 3 uppercase letters'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  symbol: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Ensure PKR rate is always 1
currencySchema.pre('save', function(next) {
  if (this.code === 'PKR') {
    this.rate = 1;
  }
  next();
});

export default mongoose.models.Currency || 
       mongoose.model('Currency', currencySchema);