const { db, dbQuery } = require("../config/database");
const { uploader } = require("../config/multer");
const fs = require('fs');

module.exports = {
    getProducts: async (req, res) => {
        try {
            console.log(req.query.produk_id)
            let sqlGetProducts = `Select * from produk ${req.query.produk_id ? `WHERE produk_id=${req.query.produk_id}` : ""};`;
            let sqlGetStok = `Select * from stok;`;

            let getProducts = await dbQuery(sqlGetProducts);
            let getStok = await dbQuery(sqlGetStok);
            console.log(getProducts)

            let newData = getProducts.map((value, index) => {
                value.stok = [];
                getStok.forEach((val, idx) => {
                    if (value.produk_id == val.produk_id) {
                        value.stok.push(val)
                    }
                });

                return value;
            })

            res.status(200).send(newData)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    getProdukNStok: async (req, res) => {
        try {
            let sqlGetProdukNStok = `SELECT stok.stok_id, stok.produk_id, stok.gudang_id, SUM(stok.jumlah_stok) as stok, produk.nama_produk, produk.kategori, produk.deskripsi_produk, produk.harga_jual, produk.galeri_produk, gudang.nama_gudang from stok
            JOIN produk on stok.produk_id = produk.produk_id
            JOIN gudang on stok.gudang_id = gudang.gudang_id
            WHERE produk.produk_id=${req.query.produk_id}
            GROUP BY produk.produk_id;`;

            sqlGetProdukNStok = await dbQuery(sqlGetProdukNStok)

            res.status(200).send(sqlGetProdukNStok)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addProduct: async (req, res) => {
        const upload = uploader('/images', 'IMG').fields([{ name: 'images' }]);
        upload(req, res, async (error) => {
            try {
                // console.log(req.body.data)
                // console.log(req.file.stok)
                let { nama_produk, kategori, deskripsi_produk, harga_modal, harga_jual, jumlah_terjual, jumlah_stok, gudang_id } = JSON.parse(req.body.data)
                const filePath = req.files.images ? `/images/${req.files.images[0].filename}` : null;

                let sqlProduct = `INSERT INTO produk values (null, '${nama_produk}','${kategori}','${deskripsi_produk}',${harga_modal},${harga_jual},'http://localhost:2025${filePath}',${jumlah_terjual});`
                // sqlProduct = await dbQuery(sqlProduct)
                // console.log(sqlProduct)
                let insertProduct = await dbQuery(sqlProduct)
                console.log(insertProduct)
                // console.log(req.body)
                if (insertProduct.insertId) {
                    let sqlStok = `INSERT INTO stok values (null,${insertProduct.insertId}, ${gudang_id}, ${jumlah_stok});`
                    await dbQuery(sqlStok)
                }
                res.status(200).send({ message: "Add Product Success ✅" })
            } catch (error) {
                fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
                console.log(error);
                res.status(500).send(error);
            }
        })
    },
    searchProduct: async (req, res) => {
        try {
            let searchProduct = `SELECT produk.* from produk WHERE nama_produk LIKE "%${req.params.search}%" OR kategori LIKE "%${req.params.search}%";`
            const search = await dbQuery(searchProduct)

            res.status(200).send(search)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    sortProduk: async (req, res) => {
        try {
            let sqlsortProduk = `SELECT * FROM produk ORDER BY ${req.params.column} ${req.params.sort};`
            const sortProduk = await dbQuery(sqlsortProduk)

            res.status(200).send(sortProduk)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
    // sortDescProduk: async (req, res) => {
    //     try {
    //         let sortDescProduk = `SELECT * FROM produk ORDER BY nama_produk desc;`
    //         const descProduk = await dbQuery(sortDescProduk)

    //         res.status(200).send(descProduk)
    //     } catch (error) {
    //         console.log(error)
    //         res.status(500).send(error)
    //     }
    // }
}