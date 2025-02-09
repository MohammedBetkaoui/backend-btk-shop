const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // récupérer le token depuis Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Accès refusé' });

    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Token invalide' });
    }
};