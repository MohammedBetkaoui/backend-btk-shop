const express = require('express');
const userAuth = require('../middleware/userAuth');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

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

router.put('/:id/status', auth, async (req, res) => {
  try {
      const order = await Order.findByIdAndUpdate(
          req.params.id,
          { status: req.body.status },
          { new: true }
      );
      
      if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
      res.json({ success: true, order });
  } catch (error) {
      res.status(500).json({ message: 'Erreur de mise à jour' });
  }
});

router.get('/stats',auth, async (req, res) => {
  try {
      const users = await User.find({});
      const usersWithStats = await Promise.all(users.map(async (user) => {
          const orders = await Order.find({ userId: user._id });
          const statusCounts = orders.reduce((acc, order) => {
              acc[order.status] = (acc[order.status] || 0) + 1;
              return acc;
          }, {});
          
          return {
              ...user.toObject(),
              totalOrders: orders.length,
              statusCounts
          };
      }));
      
      res.json(usersWithStats);
  } catch (error) {
      res.status(500).json({ message: 'Erreur de récupération' });
  }
});

// Route pour récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
      const orders = await Order.find({})
          .populate('userId', 'username email')
          .sort({ createdAt: -1 });
      res.json({ success: true, orders });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;