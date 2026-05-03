const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Passport config
require('./config/passport')(passport);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/safi-store')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Middleware
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Session
app.use(session({
    secret: 'safiSecret',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// Global variables (important for EJS)
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Home route
app.get('/', (req, res) => {
    res.redirect('/products');
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/products', require('./routes/products'));

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

