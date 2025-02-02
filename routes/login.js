const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const router = express.Router();

// Route pour la connexion
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Récupérer l'admin correspondant au username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    // 2. Comparer le mot de passe fourni avec le mot de passe hashé
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    // 3. Générer un token JWT si les identifiants sont valides
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'votre_secret_jwt', {
      expiresIn: '1h', // Le token expire dans 1 heure
    });

    // 4. Réponse avec le token
    res.json({ success: true, token });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

module.exports = router;