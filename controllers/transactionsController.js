const { db, dbQuery } = require("../config/database")
const { uploader } = require("../config/multer");
const fs = require('fs');

module.exports = {
    getCart: async (req, res) => {
        try {
            let selectCart = `SELECT cart.*, cart_produk.*, produk.nama_produk, produk.harga_jual,produk.galeri_produk from cart
            JOIN cart_produk on cart.cart_id = cart_produk.cart_id
            JOIN produk on cart_produk.produk_id = produk.produk_id
            WHERE user_id = ${db.escape(req.dataUser.user_id)} AND is_checkout = false;`

            selectCart = await dbQuery(selectCart)

            res.status(200).send(selectCart)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addCart: async (req, res) => {
        try {
            // search cart yg available
            let sqlSelectCart = `SELECT * from cart WHERE user_id = ${db.escape(req.body.user_id)} AND is_checkout = 0`
            let selectCart = await dbQuery(sqlSelectCart)
            // kalau kosong buat baru
            if (selectCart.length === 0) {
                let sqlCart = `INSERT INTO cart (user_id) values (${db.escape(req.body.user_id)});`
                selectCart = await dbQuery(sqlCart)
                if (selectCart.insertId) {
                    let sqlCartProduk = `INSERT INTO cart_produk values(${selectCart.insertId},
                        ${db.escape(req.body.produk_id)}, ${db.escape(req.body.qty)},${db.escape(req.body.harga_jual)})`
                    await dbQuery(sqlCartProduk)
                }
            } else {
                if (selectCart[0].cart_id) {
                    let sqlCartProduk = `INSERT INTO cart_produk values(${selectCart[0].cart_id},
                        ${db.escape(req.body.produk_id)}, ${db.escape(req.body.qty)},${db.escape(req.body.harga_jual)})`
                    await dbQuery(sqlCartProduk)
                }
            }
            res.status(200).send({ message: "Add Cart Success ✅", success: true })
            // res.status(200).send(selectCart)

            // console.log(addCart)
            // let addCart = `INSERT INTO cart values (null, ${db.escape(req.body.user_id)}, 
            // ${db.escape(req.body.produk_id)}, ${db.escape(req.body.qty)});`
            // await dbQuery(addCart)

            // res.status(200).send({ message: "Add to cart success ✅", success: true })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    removeProduk: async (req, res) => {
        try {
            let removeProduk = `DELETE FROM cart_produk WHERE cart_id=${db.escape(req.params.cart_id)} AND produk_id=${db.escape(req.params.produk_id)}`
            await dbQuery(removeProduk)

            res.status(200).send(removeProduk)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    updateCart: async (req, res) => {
        try {
            let updateCart = `UPDATE cart_produk set qty=${db.escape(req.body.qty)} WHERE cart_id=${db.escape(req.body.cart_id)} AND produk_id=${db.escape(req.body.produk_id)};`
            const update = await dbQuery(updateCart)

            res.status(200).send(update)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },

    getHistori: async (req, res) => {
        try {
            let sqlHistory = `SELECT cart.cart_id, cart.user_id,  cart_produk.produk_id, cart.address_id, cart_produk.qty, cart.ongkos_kirim, cart_produk.harga_jual,produk.nama_produk,produk.galeri_produk, status_history.nama_status, status_history.timestamp from cart
            JOIN cart_produk on cart.cart_id = cart_produk.cart_id
            JOIN produk on cart_produk.produk_id = produk.produk_id
            JOIN status_history on cart.cart_id = status_history.cart_id;;`

            sqlHistory = await dbQuery(sqlHistory)

            res.status(200).send(sqlHistory)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    getPayment: async (req, res) => {
        try {
            let sqlPayment = `SELECT cart.ongkos_kirim, cart_produk.qty, cart_produk.harga_jual, SUM(cart_produk.harga_jual * cart_produk.qty) + SUM(cart.ongkos_kirim) AS total_pembayaran from cart
            JOIN cart_produk on cart.cart_id = cart_produk.cart_id;`
            let getPayment = await dbQuery(sqlPayment)

            res.status(200).send(getPayment)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addBuktiPembayaran: async (req, res) => {
        const upload = uploader('/images', 'IMG').fields([{ name: 'images' }]);
        upload(req, res, async (error) => {
            try {
                let { user_id } = JSON.parse(req.body.data)
                const filePath = req.files.images ? `/images/${req.files.images[0].filename}` : null;
                let sqlBuktiPembayaran = `INSERT INTO bukti_pembayaran values(null,${user_id},'http://localhost:2025${filePath}');`
                let buktiPembayaran = await dbQuery(sqlBuktiPembayaran)

                res.status(200).send({ message: "Add Product Success ✅", buktiPembayaran })
            } catch (error) {
                fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
                console.log(error)
                res.status(500).send(error)
            }
        })
    },
    updateCheckout: async (req, res) => {
        try {
            let cart_id = `${db.escape(req.body.cart_id)}`
            let sqlUpdate = `UPDATE cart set address_id=1,ongkos_kirim=${db.escape(req.body.ongkos_kirim)},is_checkout=1 WHERE cart_id = ${cart_id};`
            let update = await dbQuery(sqlUpdate)

            let sqlHistori = `INSERT INTO status_history (cart_id,nama_status) values (${cart_id},"Menunggu Pembayaran")`
            await dbQuery(sqlHistori)
            res.status(200).send({ message: "Update success✅", success: true })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}