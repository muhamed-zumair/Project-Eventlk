const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db'); 

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback" 
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            // 1. Check if user already exists based on their email
            // Note: Using exact casing "Users" to match your schema
            const existingUser = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);

            if (existingUser.rows.length > 0) {
                // LOG IN: User found, return their profile
                return done(null, existingUser.rows[0]);
            } else {
                // SIGN UP: Extract first and last name from Google Profile
                const firstName = profile.name?.givenName || profile.displayName.split(' ')[0];
                const lastName = profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ') || '';

                // Insert into your specific "Users" table
                const newUserQuery = `
                    INSERT INTO "Users" (id, first_name, last_name, email, role) 
                    VALUES (gen_random_uuid(), $1, $2, $3, 'Attendee') 
                    RETURNING *
                `;
                const values = [firstName, lastName, email];
                
                const newUser = await pool.query(newUserQuery, values);
                sendWelcomeEmail(profile.emails[0].value, profile.name.givenName);
                
                return done(null, newUser.rows[0]);
            }
        } catch (error) {
            console.error("Database Error in Passport:", error);
            return done(error, false);
        }
    }));

    // SESSION MANAGEMENT
    passport.serializeUser((user, done) => {
        done(null, user.id); // user.id is your UUID
    });

    passport.deserializeUser(async (id, done) => {
        try {
            // Fetching by UUID
            const user = await pool.query('SELECT * FROM "Users" WHERE id = $1', [id]);
            done(null, user.rows[0]);
        } catch (error) {
            done(error, null);
        }
    });
};