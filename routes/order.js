const express = require('express');
const userAuth = require('../middleware/userAuth');
const Order = require('../models/Order');
const User = require('../models/User');
const { io } = require('../index'); // Importez l'instance de Socket.IO

const router = express.Router();

router.post('/', userAuth, async (req, res) => {
  const { products } = req.body;
  const userId = req.user._id;

  try {
    const totalAmount = products.reduce((total, item) => total + (item.price * item.quantity), 0);

    const order = new Order({
      userId,
      products,
      totalAmount,
    });

    await order.save();

    // Vider le panier de l'utilisateur
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    // Envoyer une notification en temps réel
    io.emit('newOrder', {
      message: 'Nouvelle commande reçue !',
      orderId: order._id,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    });

    res.status(201).json({ 
      success: true, 
      order,
      message: 'Commande passée avec succès !' 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de la commande' 
    });
  }
});


// Route pour récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'username email');
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;