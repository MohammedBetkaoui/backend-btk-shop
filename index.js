const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Product = require('./models/Product');
const auth = require('./middleware/auth');

// Routes
const addProductRoute = require('./routes/AddProduct');
const removeProductRoute = require('./routes/RemoveProduct');
const loginRoute = require('./routes/login');

dotenv.config(); // Charger les variables d'environnement

const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce', {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dr285qsky',
  api_key: process.env.CLOUDINARY_API_KEY || '941595523261627',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ovLhMgw92fdWSB9kaQauOhYdIsE',
});

// Routes
app.use('/login', loginRoute);
app.use('/addproduct', auth, addProductRoute);
app.use('/removeproduct', auth, removeProductRoute);

// Route pour récupérer tous les produits
app.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('Le serveur Express fonctionne correctement');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});