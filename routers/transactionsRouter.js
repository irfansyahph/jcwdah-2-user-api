const express = require("express");
const { readToken } = require("../config/token");
const { transactionsController } = require("../controllers")
const router = express.Router();

router.get("/get-cart", readToken, transactionsController.getCart);
router.post("/add-cart", transactionsController.addCart);
router.delete('/delete-cart/:cart_id/:produk_id', transactionsController.removeProduk);
router.patch("/update-cart", transactionsController.updateCart);
router.patch("/update-checkout", transactionsController.updateCheckout);
router.get("/get-histori", transactionsController.getHistori);
router.get("/get-payment", transactionsController.getPayment);
router.post("/add-bukti-pembayaran", transactionsController.addBuktiPembayaran);

module.exports = router;