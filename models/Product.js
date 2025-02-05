const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  description: String,
  sizes: { type: [String], default: ['S', 'M', 'L'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);