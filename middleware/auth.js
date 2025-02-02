// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    req.adminId = decoded.id; // Ajoute l'ID de l'admin à la requête
    next();
  } catch (error) {
    console.error('Erreur de vérification du token :', error);
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

module.exports = auth;