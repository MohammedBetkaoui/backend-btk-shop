// routes/login.js
const express = require('express');
const router = express.Router();

// Données statiques pour le login
const STATIC_USERNAME = 'betkaoui.mohammed';
const STATIC_PASSWORD = '27Mars2002';

// Route pour gérer la connexion
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérification des identifiants
  if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
    return res.status(200).json({ success: true, message: 'Connexion réussie' });
  } else {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  }
});

module.exports = router;