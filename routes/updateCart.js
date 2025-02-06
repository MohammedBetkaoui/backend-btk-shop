const express = require('express');
const userAuth = require('../middleware/userAuth');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

router.put('/', userAuth, async (req, res) => {
  try {
    const { productId: numericId, quantity, size } = req.body;
    const userId = req.user._id;

    const product = await Product.findOne({ id: numericId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const user = await User.findById(userId);
    const cartItem = user.cart.find(item => 
      item.productId.equals(product._id) && item.size === size
    );

    if (cartItem) {
      cartItem.quantity = quantity;
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;