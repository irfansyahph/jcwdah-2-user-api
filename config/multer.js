const multer = require('multer');
const fs = require('fs');

module.exports = {
    uploader: (directory, fileNamePrefix) => {
        // Lokasi penyimpanan file secar default
        let defaultDir = './public';

        // diskStorage = untuk menyimpan file kedalam directory default yang dituju
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                // untuk menentukan alamat destinasi penyimpanan
                const alamatDirektori = directory ? defaultDir + directory : defaultDir;

                // Melakukan pengecekan direktori
                if (fs.existsSync(alamatDirektori)) {
                    // jika alamatDirektori ada, maka direktori akan digunakan
                    console.log("Directory ada ✅");
                    cb(null, alamatDirektori);
                } else {
                    // jika alamatDirektori tidak ada,maka directory akan dibuat terlebih dahulu
                    fs.mkdir(alamatDirektori, { recursive: true }, (error) => cb(error, alamatDirektori));
                    console.log("Directory sudah dibuat ✅")
                }
            },
            filename: (req, file, cb) => {
                // untuk mendapatkan tipe datanya
                let ext = file.originalname.split('.');

                // membuat nama file yang baru
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1];
                // eksekusi nama file
                cb(null, filename);
            }
        });

        const fileFilter = (req, file, cb) => {
            // extension file yang diperbolehkan untuk disimpan
            const extFilter = /\.(jpg|png|gif|pdf|txt)/

            if (!file.originalname.match(extFilter)) {
                return cb(new Error('Your file type are denied ❌'), false)
            }
            cb(null, true)
        };

        return multer({ storage, fileFilter });
    }
}