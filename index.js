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
const port = 4000;

// Configuration WebSocket
const io = new Server(server, {
  cors: {
    origin: "https://btk-shop-admin.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: "https://btk-shop-admin.vercel.app",
  credentials: true
}));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce', {
  serverSelectionTimeoutMS: 30000,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur MongoDB:', err));

// Événements WebSocket
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('get-users', async () => {
    try {
      const users = await User.find({});
      socket.emit('users-list', users);
    } catch (error) {
      socket.emit('users-error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Routes
app.use('/login', loginRoute);
app.use('/addproduct', auth, addProductRoute);
app.use('/removeproduct', removeProductRoute);
app.use('/register', registerRoute);
app.use('/userlogin', userLoginRoute);

// Route produits
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Route utilisateurs
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs' });
  }
});

// Nouvelle route suppression utilisateur
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    const users = await User.find({});
    io.emit('users-updated', users);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur serveur' });
});

server.listen(port, () => {
  console.log(`Serveur actif sur le port ${port}`);
});