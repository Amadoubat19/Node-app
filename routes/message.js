const express = require('express');

const auth = require('../middlewares/auth');

const msgCtl = require('../controllers/messages');

const router = express.Router();

router.delete('/delete/:id', auth.authentificate, msgCtl.delete);

router.patch('/modify/:id', auth.authentificate, msgCtl.modify);

router.get('/message/:id', auth.authentificate, msgCtl.get);

module.exports = router;