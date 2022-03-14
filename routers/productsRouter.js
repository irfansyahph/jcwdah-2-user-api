const express = require('express');
const { productsController } = require('../controllers')
const router = express.Router()

router.get('/get', productsController.getProducts)
router.get('/getAll', productsController.getProdukNStok)
router.post('/add', productsController.addProduct)

module.exports = router