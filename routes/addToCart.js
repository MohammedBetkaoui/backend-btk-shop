const express = require('express');
const auth = require('../middleware/auth');
const { User, Product } = require('../models/Product');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { productId: numericId, quantity, size } = req.body;
    const userId = req.user._id;

    // Trouver le produit par ID numérique
    const product = await Product.findOne({ id: numericId });
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Utiliser l'ObjectId réel du produit
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
    
    // Renvoyer les données formatées pour le frontend
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