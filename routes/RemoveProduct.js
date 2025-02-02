const express = require('express');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');

const router = express.Router();

// Route pour supprimer un produit
router.post('/', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const imageUrl = product.image;
    const publicId = imageUrl.split('/').pop().split('.')[0];

    await cloudinary.uploader.destroy(`e-commerce/${publicId}`);
    return res.json({ success: true, message: 'Produit et image supprimés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la suppression du produit' });
  }
});

module.exports = router;