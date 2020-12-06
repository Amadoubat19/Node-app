const express = require('express');

const auth = require('../middlewares/auth');

const convCtl = require('../controllers/conversation');

const router = express.Router();

router.post('/create', auth.authentificate, convCtl.create);

router.delete('/delete/:id', auth.authentificate, convCtl.delete);

router.post('/add', auth.authentificate, convCtl.addMessage);

router.get('/get/:id', auth.authentificate, convCtl.get)

router.get('/getAll', auth.authentificate, convCtl.getAll)

module.exports = router;