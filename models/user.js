const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema(
    {
        email: { type: String, required: true, unique: true},
        firstname: { type: String, required: true},
        lastname: { type: String, required: true},
        city: { type: String},
        password: { type: String, required: true},
        imageUrl: { type: String, required: true},
        birthDate: { type: Date, required: true }
    }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);