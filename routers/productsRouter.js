const express = require('express');
const { productsController } = require('../controllers')
const router = express.Router()

router.get('/get', productsController.getProducts)
router.get('/getAll', productsController.getProdukNStok)
router.post('/add', productsController.addProduct)
router.get('/search/:search', productsController.searchProduct)
router.get('/sort/:column/:sort', productsController.sortProduk)

module.exports = router