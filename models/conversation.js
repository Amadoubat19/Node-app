const mongoose = require('mongoose');

const conv = mongoose.Schema({
    name: {type: String, required: true},
    messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
})

module.exports = mongoose.model('Conversation', conv);