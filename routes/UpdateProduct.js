const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

router.put('/:id', auth, async (req, res) => {
    try {
        const numericId = parseInt(req.params.id);
        const updates = req.body;

        // Vérifier si une nouvelle image est fournie
        if (updates.image && updates.image.startsWith('data:image')) {
            const uploadedResponse = await cloudinary.uploader.upload(updates.image, {
                folder: 'e-commerce',
            });
            updates.image = uploadedResponse.secure_url;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { id: numericId },
            updates,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Produit non trouvé' });
        }

        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Erreur de mise à jour:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur',
            error: error.message 
        });
    }
});

module.exports = router;