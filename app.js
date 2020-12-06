const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRouter = require('./routes/auth');
const convRouter = require('./routes/conversation');
const msgRouter = require('./routes/message');

mongoose.connect('mongodb+srv://tidiBarry19:1998Barry@cluster0-mdzbz.mongodb.net/test?retryWrites=true&w=majority',//'mongodb://mongo-image:27017/backend',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie ! Yesssssssssss!'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.set('view engine', 'ejs');


app.use('/auth', userRouter);
app.use('/conversation', convRouter);
app.use('/message', msgRouter);

app.use('/images', express.static(path.join(__dirname, 'images')));


app.all('*', (req, res, next) => {  
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;  
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.message);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        error: err.message
    });
});

module.exports = app;
