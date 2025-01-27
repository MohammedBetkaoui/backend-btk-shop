const port = 4000;

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Connexion à MongoDB avec un délai d'attente augmenté
mongoose.connect('mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce', {
  serverSelectionTimeoutMS: 30000, // 30 secondes
})
  .then(() => console.log('Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Modèle de produit
const Product = mongoose.model('Product', {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  avilable: { type: Boolean, required: true, default: true },
});

// Route pour récupérer tous les produits (sans l'image)
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).select('-image');
    return res.json({ products });
  } catch (error) {
    console.error('Error :', error);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
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