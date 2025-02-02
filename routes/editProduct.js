const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product'); // Assurez-vous que ce chemin est correct

const router = express.Router();

// Configuration de Multer pour l'upload d'image
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-commerce',
    format: async (req, file) => file.mimetype.split('/')[1],
    public_id: (req, file) => `product_${Date.now()}`,
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/;
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(file.originalname.toLowerCase());
    if (mimeType && extName) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les types d\'images (JPEG, PNG, GIF, etc.) sont autorisés'));
    }
  },
});

// Route pour modifier un produit
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;

    // Recherche du produit existant
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Si une nouvelle image est reçue, supprimer l'ancienne image de Cloudinary
    if (req.file) {
      const imageUrl = product.image;
      const publicId = imageUrl.split('/').pop().split('.')[0]; // Extraire l'ID public de l'URL

      // Supprimer l'ancienne image de Cloudinary
      await cloudinary.uploader.destroy(`e-commerce/${publicId}`);

      // Mettre à jour le chemin de l'image avec la nouvelle
      product.image = req.file.path;
    }

    // Mettre à jour les autres informations du produit
    product.name = req.body.name || product.name;
    product.category = req.body.category || product.category;
    product.new_price = req.body.new_price || product.new_price;
    product.old_price = req.body.old_price || product.old_price;
    product.description = req.body.description || product.description;

    // Sauvegarder les modifications
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    console.error('Erreur lors de la modification du produit :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
