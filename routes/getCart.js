const express = require('express');
const userAuth = require('../middleware/userAuth');
const User = require('../models/User');

const router = express.Router();

router.get('/', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('cart.productId');

    const formattedCart = user.cart.map(item => ({
      productId: item.productId.id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.new_price,
      size: item.size,
      quantity: item.quantity
    }));

    res.json({ 
      success: true,
      cart: formattedCart 
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;