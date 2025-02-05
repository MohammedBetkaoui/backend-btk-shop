const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product');

const router = express.Router();

// Configuration améliorée de Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-commerce',
    format: (req, file) => {
      const validFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const ext = file.originalname.split('.').pop().toLowerCase();
      return validFormats.includes(ext) ? ext : 'jpg';
    },
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `product_${timestamp}_${Math.floor(Math.random() * 1000)}`;
    },
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(file.originalname.split('.').pop().toLowerCase());
    
    if (mimeType && extName) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les formats d\'image (JPEG, JPG, PNG, GIF, WEBP) sont autorisés'));
    }
  }
});

// Middleware de gestion d'erreurs pour Multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false, 
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'La taille de l\'image ne doit pas dépasser 5MB' 
        : 'Erreur lors de l\'upload de l\'image'
    });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// Route pour ajouter un produit
router.post('/', 
  upload.single('image'),
  handleUploadErrors,
  async (req, res) => {
    try {
      // Validation des champs obligatoires
      const requiredFields = ['name', 'category', 'new_price', 'old_price'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ 
            success: false, 
            message: `Le champ '${field}' est obligatoire` 
          });
        }
      }

      // Génération d'ID sécurisée
      const lastProduct = await Product.findOne().sort({ id: -1 });
      const newId = lastProduct ? lastProduct.id + 1 : 1;

      // Vérification de l'unicité du nom
      const existingProduct = await Product.findOne({ name: req.body.name });
      if (existingProduct) {
        return res.status(409).json({ 
          success: false, 
          message: 'Un produit avec ce nom existe déjà' 
        });
      }

      const product = new Product({
        id: newId,
        name: req.body.name,
        image: req.file.path, // Chemin Cloudinary
        category: req.body.category,
        new_price: parseFloat(req.body.new_price),
        old_price: parseFloat(req.body.old_price),
        description: req.body.description || '',
        sizes: req.body.sizes ? JSON.parse(req.body.sizes) : ['S', 'M', 'L'] // Gestion des tailles
      });

      await product.save();
      
      res.status(201).json({ 
        success: true, 
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          prices: {
            new: product.new_price,
            old: product.old_price
          },
          sizes: product.sizes
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit :', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  }
);

module.exports = router;