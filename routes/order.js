const express = require('express');
const userAuth = require('../middleware/userAuth');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

router.post('/', userAuth, async (req, res) => {
  const { products } = req.body;
  const userId = req.user._id;

  try {
    const totalAmount = products.reduce((total, item) => total + (item.price * item.quantity), 0);

    const order = new Order({
      userId,
      products,
      totalAmount,
    });

    await order.save();

    // Vider le panier de l'utilisateur
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    res.status(201).json({ 
      success: true, 
      order,
      message: 'Commande passée avec succès !' 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de la commande' 
    });
  }
});

module.exports = router;