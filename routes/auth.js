const express = require('express');
const auth = require('../middlewares/auth');

const router = express.Router();

const authCtl = require('../controllers/auth');

router.post('/login', authCtl.login);

router.post('/validate', authCtl.validate);

router.post('/register', authCtl.register);

router.post('/accept_user', authCtl.accept_user);

router.post('/forget_password', authCtl.reset_pass);

router.get('/change_password/:token', authCtl.change_pass);

router.post('/password_changed', authCtl.pass_changed);

module.exports = router;