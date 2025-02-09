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
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;