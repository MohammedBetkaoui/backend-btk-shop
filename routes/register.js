const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const User = await User.find({});
    const id = User.length > 0 ? User[User.length - 1].id + 1 : 1;

    const newUser = new User({ id,username, email, password });
    await newUser.save();

    // Générer un token JWT
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'votre_secret_jwt', {
      expiresIn: '7d'
    });

    res.status(201).json({ success: true, token, user: { id: newUser.id, username, email } });
  } catch (error) {
    console.error('Erreur lors de l’inscription :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
