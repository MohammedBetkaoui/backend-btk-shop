
const User = require('../models/User');
const express = require('express');


const router = express.Router();






    router.get('/', async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  module.exports = router;



