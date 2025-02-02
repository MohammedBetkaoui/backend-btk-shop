const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Routes
const addProductRoute = require('./routes/AddProduct');
const removeProductRoute = require('./routes/RemoveProduct');
const editProductRoute = require('./routes/editProduct');  

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
app.use('/addproduct', addProductRoute);
app.use('/removeproduct', removeProductRoute);
app.use('/editproduct', editProductRoute);  // Utiliser la route pour modifier un produit

// Route de test
app.get('/', (req, res) => {
  res.send('Le serveur Express fonctionne correctement');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
