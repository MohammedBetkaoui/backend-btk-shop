const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const auth = require('./middleware/auth');

// Routes
const addProductRoute = require('./routes/AddProduct');
const removeProductRoute = require('./routes/RemoveProduct');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const userLoginRoute = require('./routes/userLogin');

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Configuration des origines autorisées
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'https://btk-shop-admin.vercel.app',
      'https://btk-shop.vercel.app',
      'http://localhost:3000'
    ];

// Middleware CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Configuration WebSocket
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce', {
  serverSelectionTimeoutMS: 30000,
})
.then(() => console.log('Connecté à MongoDB avec succès'))
.catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Middleware de vérification d'origine
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Événements WebSocket
io.on('connection', (socket) => {
  console.log(`Client connecté: ${socket.id}`);

  // Gestion des utilisateurs
  socket.on('get-users', async () => {
    try {
      const users = await User.find({}).select('-password');
      socket.emit('users-list', users);
    } catch (error) {
      socket.emit('users-error', error.message);
    }
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`Client déconnecté: ${socket.id}`);
  });
});

// Routes existantes
app.use('/login', loginRoute);
app.use('/addproduct', auth, addProductRoute);
app.use('/removeproduct', removeProductRoute);
app.use('/register', registerRoute);
app.use('/userlogin', userLoginRoute);

// Route produits
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.header('Access-Control-Allow-Origin', req.headers.origin || allowedOrigins[0]);
    return res.json({ products });
  } catch (error) {
    console.error('Erreur de récupération des produits:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route utilisateurs
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.header('Access-Control-Allow-Origin', req.headers.origin || allowedOrigins[0]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur de récupération des utilisateurs' });
  }
});

// Suppression d'utilisateur
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    const users = await User.find({}).select('-password');
    io.emit('users-updated', users);
    res.header('Access-Control-Allow-Origin', req.headers.origin || allowedOrigins[0]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur de suppression' });
  }
});
app.get('/', (req, res) => {
  res.send('Le serveur Express fonctionne correctement');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
  console.log(`Origines autorisées: ${allowedOrigins.join(', ')}`);
});
