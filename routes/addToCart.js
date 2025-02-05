const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingProduct = user.cart.find(item => item.productId.toString() === productId && item.size === size);

    if (existingProduct) {
      existingProduct.quantity += quantity || 1;
    } else {
      user.cart.push({ productId, quantity: quantity || 1, size });
    }

    await user.save();
    res.json({ message: 'Product added to cart', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;