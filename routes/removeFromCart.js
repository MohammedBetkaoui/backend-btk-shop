const express = require('express');
const auth = require('../middleware/userAuth');
const User = require('../models/User');

const router = express.Router();

router.delete('/', auth, async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(item => !(item.productId.toString() === productId && item.size === size));

    await user.save();
    res.json({ message: 'Product removed from cart', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;