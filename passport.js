const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {

    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await User.findOne({ username });

        if (!user) return done(null, false, { message: 'No user found' });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) return done(null, user);
        else return done(null, false, { message: 'Wrong password' });
    }));

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => done(null, user));
    });
};