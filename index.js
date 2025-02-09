const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

const User = require('./models/User');
const auth = require('./middleware/auth');

// Routes
const addProductRoute = require('./routes/AddProduct');
const removeProductRoute = require('./routes/RemoveProduct');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const userLoginRoute = require('./routes/userLogin');
const addToCartRoute = require('./routes/addToCart');
const getCartRoute = require('./routes/getCart');
const removeFromCartRoute = require('./routes/removeFromCart');
const updateCartRoute = require('./routes/updateCart');
const getUserCartRoute = require('./routes/getUserCart');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const orderRoute = require('./routes/order');





dotenv.config();

const app = express();
const port = process.env.PORT || 4000; // Use environment variable for port

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
app.use('/removeproduct', removeProductRoute);
app.use('/register', registerRoute);
app.use('/userlogin', userLoginRoute);
app.use('/cart', addToCartRoute);
app.use('/cart', getCartRoute);
app.use('/cart', updateCartRoute);
app.use('/cart/remove', removeFromCartRoute);
app.use('/admin/users/cart', getUserCartRoute);
app.use('/products', productsRoutes);
app.use('/users',auth, usersRoutes);
app.use('/order', orderRoute);



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Remplacez par l'URL de votre frontend
    methods: ["GET", "POST"],
  },
});

// Écouter les connexions des clients
io.on('connection', (socket) => {
  console.log('Un client est connecté:', socket.id);

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log('Un client est déconnecté:', socket.id);
  });
});

// Démarrer le serveur
// server.listen(4000, () => {
//   console.log('Serveur démarré sur le port 4000');
// });



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