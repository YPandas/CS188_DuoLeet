const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/oauth2/redirect/google`,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            //check if user already exists
            let user = await User.findOne({ googleId: profile.id});
            if (!user) {
                //create new user if doesn't exist
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); //done return control back to the authentication flow
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 