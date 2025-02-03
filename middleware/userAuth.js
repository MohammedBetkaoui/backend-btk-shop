const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    req.userId = decoded.id; // Associer l'ID de l'utilisateur à la requête
    next();
  } catch (error) {
    console.error('Erreur de vérification du token :', error);
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

module.exports = userAuth;
