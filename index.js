const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Middleware
app.use(express.json());
app.use(cors());

// Connexion à MongoDB avec un délai d'attente augmenté
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce', {
  serverSelectionTimeoutMS: 30000, // 30 secondes
})
  .then(() => console.log('Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dr285qsky',
  api_key: process.env.CLOUDINARY_API_KEY || '941595523261627',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ovLhMgw92fdWSB9kaQauOhYdIsE',
});

// Configuration du stockage des images avec Multer et Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-commerce', // Dossier dans Cloudinary
    format: async (req, file) => file.mimetype.split('/')[1], // Conserve le format original (jpg, png, etc.)
    public_id: (req, file) => `product_${Date.now()}`, // Nom unique basé sur l'horodatage
  },
});

// Autoriser uniquement les types d'images
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/; // Types MIME acceptés
    const mimeType = fileTypes.test(file.mimetype); // Vérifie le type MIME
    const extName = fileTypes.test(file.originalname.toLowerCase()); // Vérifie l'extension du fichier
    if (mimeType && extName) {
      cb(null, true); // Accepter le fichier
    } else {
      cb(new Error('Seuls les types d\'images (JPEG, PNG, GIF, etc.) sont autorisés')); // Rejeter
    }
  },
});

// Route pour l'upload d'images
app.post('/upload', upload.single('product'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: 'Aucun fichier reçu' });
    }

    // URL publique de l'image stockée sur Cloudinary
    const imageUrl = req.file.path;

    res.json({
      success: 1,
      image_url: imageUrl,
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload :', error);
    res.status(500).json({ success: 0, message: error.message });
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('Le serveur Express fonctionne correctement');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  res.status(500).json({ success: 0, message: 'Erreur interne du serveur' });
});

// Modèle de produit
const Product = mongoose.model('Product', {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  description: { type: String, required: true }, // Ajout de la description
  date: { type: Date, default: Date.now, required: true },
  avilable: { type: Boolean, required: true, default: true },
});

// Route pour ajouter un produit
app.post('/addproduct', upload.single('image'), async (req, res) => {
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

// Route pour récupérer tous les produits
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Route pour supprimer un produit
app.post('/addproduct', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucune image reçue' });
    }

    console.log('Données reçues :', req.body); // Affiche les données reçues

    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.file.path,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      description: req.body.description, // Assurez-vous que cette ligne est présente
    });

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

// Démarrer le serveur
app.listen(port, (error) => {
  if (!error) {
    console.log(`Serveur démarré sur le port ${port}`);
  } else {
    console.error('Erreur lors du démarrage du serveur :', error);
  }
});