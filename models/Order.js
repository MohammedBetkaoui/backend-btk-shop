const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  products: [{
    productId: { type: Number, required: true },
    name: { type: String, required: true },       
    image: { type: String, required: true },      
    price: { type: Number, required: true },      
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);