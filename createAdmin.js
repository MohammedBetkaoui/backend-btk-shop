const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); // Assurez-vous que le chemin est correct

// Connexion à MongoDB
mongoose.connect('mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce', {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Fonction pour créer un administrateur
const createAdmin = async () => {
  const username = 'betkaoui.mohammed'; // Nom d'utilisateur de l'admin
  const password = '27Mars2002'; // Mot de passe de l'admin

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer un nouvel admin
  const admin = new Admin({
    username,
    password: hashedPassword,
  });

  // Enregistrer l'admin dans la base de données
  await admin.save();
  console.log('Administrateur créé avec succès :', admin);
};

// Exécuter la fonction
createAdmin().then(() => mongoose.connection.close());