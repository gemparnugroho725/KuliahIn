const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findUserByGoogleId, createUser } = require('../data/store');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'DEMO_CLIENT_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'DEMO_CLIENT_SECRET',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = findUserByGoogleId(profile.id);
                if (!user) {
                    user = createUser({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value || '',
                        avatar: profile.photos?.[0]?.value || '',
                        preferences: {
                            notifJadwal: true,
                            notifDeadline: true,
                            notifBrowser: false,
                        },
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const { findUserById } = require('../data/store');
    const user = findUserById(id);
    done(null, user || false);
});

module.exports = passport;
