const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Product = require('../models/Product'); // Assurez-vous que le modèle est défini

const router = express.Router();

// Configuration de Multer pour l'upload d'image
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-commerce', // Dossier dans Cloudinary
    format: async (req, file) => file.mimetype.split('/')[1], // Conserve le format original
    public_id: (req, file) => `product_${Date.now()}`, // Nom unique basé sur l'horodatage
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

// Route pour ajouter un produit
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucune image reçue' });
    }

    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.file.path,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      description: req.body.description, // Ajout de la description
    });

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
