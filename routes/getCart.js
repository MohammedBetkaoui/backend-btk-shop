const express = require('express');
const userAuth = require('../middleware/userAuth');
const User = require('../models/User');

const router = express.Router();

router.get('/', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'cart.productId',
        select: 'id name new_price image'
      });

    const formattedCart = user.cart.map(item => ({
      productId: item.productId.id,
      size: item.size,
      quantity: item.quantity,
      price: item.productId.new_price,
      name: item.productId.name,
      image: item.productId.image
    }));

    res.json({ cart: formattedCart });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

module.exports = router;