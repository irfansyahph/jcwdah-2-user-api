const express = require('express');
const app = express();
const cors = require('cors');
const bearerToken = require("express-bearer-token");
const dotenv = require("dotenv"); // untuk mengamankan value konfigurasi middleware pada environtment
dotenv.config(); // menjalankan dotenv 
const PORT = 2025;

app.use(bearerToken());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const { db } = require('./config/database');

db.getConnection((err, connection) => {
    if (err) {
        console.log(`Error MySQL Connection`, err.message)
    }
    console.log(`Connected to MySQL Server:${connection.threadId}`)
})

app.get('/', (req, res) => {
    res.status(200).send(`<h2>Welcome to Bootcamp </h2>`)
})

const { usersRouter, productsRouter, transactionsRouter } = require('./routers')

app.use("/users", usersRouter)
app.use("/products", productsRouter)
app.use("/transactions", transactionsRouter)

app.listen(PORT, () => console.log('Bootcamp Running;', PORT))