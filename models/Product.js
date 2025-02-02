const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  avilable: { type: Boolean, required: true, default: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
