const express = require('express');
const auth = require('../middleware/auth');
const { User, Product } = require('../models/Product');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'cart.productId',
        model: 'Product',
        select: 'id name new_price image' // Sélectionner les champs nécessaires
      });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Formater la réponse pour le frontend
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