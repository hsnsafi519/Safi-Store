const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { ensureAuth } = require('../middleware/auth');
const multer = require('multer');

// Multer config (image upload)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // no mkdir here
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});
const upload = multer({ storage });

// GET all products + search + pagination
router.get('/', ensureAuth, async (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const query = {
        title: { $regex: search, $options: 'i' }
    };

    const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Product.countDocuments(query);

    res.render('index', {
        products,
        search,
        current: page,
        pages: Math.ceil(count / limit)
    });
});

// Create form
router.get('/create', ensureAuth, (req, res) => {
    res.render('products/create');
});

// Create product
router.post('/', ensureAuth, upload.single('image'), async (req, res) => {

    // Core logic: attaching logged-in user to product
    await Product.create({
        ...req.body,
        image: req.file.filename,
        user: req.user._id
    });

    req.flash('success', 'Product created');
    res.redirect('/products');
});

router.get('/:id', ensureAuth, async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/show', { product });
});

// Edit form
router.get('/:id/edit', ensureAuth, async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product });
});

// Update
router.put('/:id', ensureAuth, upload.single('image'), async (req, res) => {
    let data = { ...req.body };

    if (req.file) data.image = req.file.filename;

    await Product.findByIdAndUpdate(req.params.id, data);

    req.flash('success', 'Updated');
    res.redirect('/products');
});

// Delete
router.delete('/:id', ensureAuth, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);

    req.flash('success', 'Deleted');
    res.redirect('/products');
});

module.exports = router;