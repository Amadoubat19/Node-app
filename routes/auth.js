const express = require('express');

const router = express.Router();

const authCtl = require('../controllers/auth');

router.post('/login', authCtl.login);

router.post('/register', authCtl.register);

module.exports = router;