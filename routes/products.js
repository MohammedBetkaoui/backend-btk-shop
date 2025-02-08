const Product = require('../models/Product');
const express = require('express');


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 }) // Tri par date de création
      .select('-__v'); // Exclure le champ version

    return res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

module.exports = router;