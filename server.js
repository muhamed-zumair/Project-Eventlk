const express = require('express');
const app=express();

app.use(express.json());

const authRoutes = require('../src/routes/authRoutes');

app.use('/api/auth' , authRoutes);

const PORT = 5000;

app.listen(PORT,() =>{
    console.log("EventtLK Backend Server is running!");
})


