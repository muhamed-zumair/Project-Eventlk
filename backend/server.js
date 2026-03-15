require('dotenv').config();
const express = require('express');
const app=express();
const session = require('express-session');
const passport = require('passport');
require('./src/config/passport')(passport); // Import the Passport configuration
const cors = require('cors');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: 'http://localhost:3000', // React app's URL
    credentials: true // Allow cookies to be sent
}));


app.use(express.json());
require('./src/config/db');//Importing the db connection

const authRoutes = require('./src/routes/authRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

app.use('/api/auth' , authRoutes);
app.use('/api', contactRoutes);

const PORT = 5000;

app.listen(PORT,() =>{
    console.log("EventtLK Backend Server is running!");
})

const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);

