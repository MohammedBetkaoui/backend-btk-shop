const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  products: [{
    productId: { type: Number, required: true },
    name: { type: String, required: true },       // Ajouté
    image: { type: String, required: true },      // Ajouté
    price: { type: Number, required: true },      // Ajouté
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
  }],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);