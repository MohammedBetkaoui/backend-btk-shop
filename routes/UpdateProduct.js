const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

router.put('/updateproduct/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (req.body.image) {
            const uploadedResponse = await cloudinary.uploader.upload(req.body.image, {
                upload_preset: 'btk_shop',
            });
            updates.image = uploadedResponse.secure_url;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            updates,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;