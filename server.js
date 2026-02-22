const express = require('express');
const app=express();

app.use(express.json());

const authRoutes = require('../src/routes/authRoutes');
const contactRoutes = require('../src/routes/contactRoutes');

app.use('/api/auth' , authRoutes);
app.use('/api', contactRoutes);

const PORT = 5000;

app.listen(PORT,() =>{
    console.log("EventtLK Backend Server is running!");
})


