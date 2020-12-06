const mongoose = require('mongoose');

const message = mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
})

module.exports = mongoose.model('Message', message);