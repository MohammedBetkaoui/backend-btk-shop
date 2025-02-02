const express = require('express');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product'); // Assurez-vous que le modèle est défini

const router = express.Router();

// Route pour supprimer un produit
router.post('/', async (req, res) => {
  try {
    // Trouver le produit à supprimer
    const product = await Product.findOneAndDelete({ id: req.body.id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Extraire le public_id de l'image à partir de l'URL Cloudinary
    const imageUrl = product.image;
    const publicId = imageUrl.split('/').pop().split('.')[0]; // Récupère le public_id depuis l'URL

    // Supprimer l'image de Cloudinary
    await cloudinary.uploader.destroy(`e-commerce/${publicId}`, (error, result) => {
      if (error) {
        console.error('Erreur lors de la suppression de l\'image sur Cloudinary :', error);
      } else {
        console.log('Image supprimée de Cloudinary :', result);
      }
    });

    // Réponse de succès
    return res.json({ success: true, message: 'Produit et image supprimés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la suppression du produit' });
  }
});

module.exports = router;
