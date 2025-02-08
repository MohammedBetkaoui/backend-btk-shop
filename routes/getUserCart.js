// routes/getUserCart.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('cart.productId')
      .select('-password');

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const formattedCart = user.cart.map(item => ({
      productId: item.productId.id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.new_price,
      size: item.size,
      quantity: item.quantity
    }));

    res.json({ cart: formattedCart });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;