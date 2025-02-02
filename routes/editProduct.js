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
// Route pour modifier un produit
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
  
      product.name = name;
      product.description = description;
      product.price = price;
      product.category = category;
      if (req.file) {
        product.image = req.file.path;
      }
  
      await product.save();
      res.json({ success: true, message: 'Produit mis à jour', product });
    } catch (error) {
      console.error('Erreur lors de la modification du produit :', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
  });
  
  module.exports = router;
  