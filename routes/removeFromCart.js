const express = require('express');
const userAuth = require('../middleware/userAuth');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

router.delete('/', userAuth, async (req, res) => {
  try {
    const { productId: numericId, size } = req.body;
    const userId = req.user._id;

    const product = await Product.findOne({ id: numericId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.cart = user.cart.filter(item => 
      !(item.productId.equals(product._id) && item.size === size)
    );

    await user.save();
    
    res.json({ 
      success: true,
      message: 'Produit retiré du panier',
      cart: user.cart 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});

module.exports = router;