const multer = require('multer');

const MYMES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/PNG': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const type = MYMES[file.mimetype];
        const name = file.originalname.split(' ').join('_');
        callback(null, name + Date.now() + type); 
    }
});

module.exports = multer({storage}).single('image');