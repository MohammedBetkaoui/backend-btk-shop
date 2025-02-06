const express = require('express');
const userAuth = require('../middleware/userAuth');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

router.post('/', userAuth, async (req, res) => {
  try {
    const { productId: numericId, quantity, size } = req.body;
    const userId = req.user._id;

    const product = await Product.findOne({ id: numericId });
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const existingItem = user.cart.find(item => 
      item.productId.equals(product._id) && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({
        productId: product._id,
        quantity: quantity || 1,
        size
      });
    }

    await user.save();
    
    const populatedUser = await User.findById(userId).populate('cart.productId');
    const formattedCart = populatedUser.cart.map(item => ({
      productId: item.productId.id,
      size: item.size,
      quantity: item.quantity
    }));

    res.json({ 
      message: 'Produit ajouté au panier',
      cart: formattedCart
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

module.exports = router;