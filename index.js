const port = 4000;

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect('mongodb+srv://mohammedbetkaoui:27032002@cluster0.e51v8.mongodb.net/E-commerce')
  .then(() => console.log('Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Configuration du stockage des images avec Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload/images'); // Répertoire de destination
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); // Nom du fichier
  }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10 Mo
  });
// Servir les images statiques
app.use('/images', express.static('upload/images'));

// Route pour l'upload d'images
app.post('/upload', upload.single('product'), (req, res) => {
    if (!req.file) {
      console.log('Aucun fichier reçu');
      return res.status(400).json({ success: 0, message: 'Aucun fichier reçu' });
    }
    console.log('Fichier reçu :', req.file);
    res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
  });
// Route de test
app.get('/', (req, res) => {
  res.send('Le serveur Express fonctionne correctement');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  res.status(500).json({ success: 0, message: 'Erreur interne du serveur' });
});

const Product =mongoose.model('Product',{
  id:{  
        type: Number,
        required: true,
      },
  name:{
    type: String,
    required: true,
  },
  image:{
    type: String,
    required: true,
    },
  
  category:{
    type: String,
    required: true,
  },   
  new_price:{
    type: Number,
    required: true,
  },
  old_price:{
    type: Number,
    required: true,
  } ,
  date:{
    type: Date,
    default: Date.now,  
    required: true,
  },
  avilable:{
    type: Boolean,
    required: true,
    default: true,
  },
   
  
})

app.post('/addproduct',async(req,res)=>{
  let products =await Product.find({});
  let id;
  if(products.length>0){
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }else{
    id = 1;
  }
  const product = new Product({
    id:id,
    name:req.body.name,
    image:req.body.image,
    category:req.body.category,
    new_price:req.body.new_price,
    old_price:req.body.old_price,
   
    });
    console.log(product);

   await product.save();
   console.log('Product added successfully');
     res.json({
      success:true,
      name:req.body.name,
    });
  })
  
app.get('/products', async(req, res) => {
  try {
    const products = await Product.find({});
    return res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
  }
})
app.post('/removeproduct', async(req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error removing product:', error);
    return res.status(500).json({ success: false, message: 'Error removing product' });
  }
});

// Démarrer le serveur
app.listen(port, (error) => {
  if (!error) {
    console.log(`Serveur démarré sur le port ${port}`);
  } else {
    console.error('Erreur lors du démarrage du serveur :', error);
  }
});