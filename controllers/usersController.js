const { db, dbQuery } = require('../config/database')
const Crypto = require('crypto')
const { createToken } = require("../config/token");
const { transporter } = require("../config/nodemailer")

module.exports = {
    getData: (req, res) => {
        db.query(`Select * from users WHERE users.user_id =${req.query.user_id};`, (err, results) => {
            if (err) {
                res.status(500).send(err)
            }

            res.status(200).send(results)
        })

    },
    register: async (req, res) => {
        try {
            let hashPassword = Crypto.createHmac("sha256", "key_password").update(req.body.password).digest("hex")
            let insertScript = `INSERT INTO users value (null, '${req.body.username}','${req.body.email}','${hashPassword}',${req.body.no_telepon},'Unverified','user');`

            let insertSQL = await dbQuery(insertScript);

            let results = await dbQuery(`Select * from users where user_id = ${insertSQL.insertId};`);

            if (results.length > 0) {
                let { user_id, username, email, no_telepon, user_role, user_status } = results[0];
                let token = createToken({ user_id, username, email, no_telepon, user_role, user_status });

                // konfigurasi email
                await transporter.sendMail({
                    from: `Admin Wcommerce API`,
                    to: "irfansyahputrahadiyat@gmail.com",
                    subject: "Konfirmasi Register",
                    html: `<div>
                    <h4>Berikut link verifikasi email anda</h4>
                    <a href='http://localhost:3000/verification/${token}'>Klik, Verifikasi Email</a>
                    </div>`
                })
                res.status(200).send({ message: "Register success ✅\nPeriksa Email Anda", success: true })
            } else {
                res.status(500).send({ message: "Register failed ❌" })
            }
        } catch (err) {
            console.log(err)
            res.status(500).send(err)

        }
    },
    login: (req, res) => {
        let hashPassword = Crypto.createHmac("sha256", "key_password").update(req.body.password).digest("hex")
        let loginScript = `Select * from users WHERE email='${req.body.email}' AND password ='${hashPassword}';`

        db.query(loginScript, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            if (results.length > 0) {
                let { user_id, username, email, no_telepon, user_role, user_status } = results[0]
                let token = createToken({ user_id, username, email, no_telepon, user_role, user_status })
                console.log(token)

                res.status(200).send({
                    messages: "Login Success ✅", loginData: {
                        user_id,
                        username,
                        email,
                        no_telepon,
                        user_role,
                        user_status,
                        token
                    }
                })
            } else {
                res.status(401).send({ messages: "User not found ❌" })
            }
        })
    },
    keepLogin: (req, res) => {
        console.log(req.dataUser)
        let loginScript = `Select * from users WHERE user_id=${req.dataUser.user_id} ;`

        db.query(loginScript, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }

            if (results.length > 0) {
                let { user_id, username, email, no_telepon, user_role, user_status } = results[0];
                let token = createToken({ user_id, username, email, no_telepon, user_role, user_status });
                res.status(200).send({
                    messages: "Login Success ✅", loginData: {
                        user_id,
                        username,
                        email,
                        no_telepon,
                        user_role,
                        user_status,
                        token
                    }
                });
            } else {
                res.status(401).send({ messages: "User not found ❌" });
            }

        })
    },
    accountVerification: async (req, res) => {
        try {
            console.log("Output Token", req.dataUser)
            let updateScript = `UPDATE users set user_status='Verified' WHERE user_id=${req.dataUser.user_id};`

            let updateSQL = await dbQuery(updateScript);

            res.status(200).send({ message: "Account Verified ✅", success: true })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    getAddress: async (req, res) => {
        try {
            let getAddress = `SELECT * FROM warehouse.address
            WHERE user_id = ${db.escape(req.dataUser.user_id)};`

            getAddress = await dbQuery(getAddress)

            res.status(200).send(getAddress)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addAddress: async (req, res) => {
        try {
            let addAddress = `INSERT INTO address values (null, ${db.escape(req.body.user_id)}, 
            '${db.escape(req.body.alamat)}', '${db.escape(req.body.kota)}', ${db.escape(req.body.kode_pos)});`

            addAddress = await dbQuery(addAddress)

            if (addAddress.insertId) {
                res.status(200).send({ message: "Add address success ✅", success: true })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}