const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const router = express.Router();

const authCtl = require('../controllers/auth');

router.post('/login', authCtl.login);

router.post('/validate', authCtl.validate);

router.post('/register', authCtl.register);

router.post('/accept_user', authCtl.accept_user);

router.get('/get-pseudo', authMiddleWare.authentificate, authCtl.getPseudo);

module.exports = router;