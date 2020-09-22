const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const pendingUserSchema = mongoose.Schema(
    {
        email: { type: String, required: true, unique: true},
        pseudo: { type: String, required: true, unique: true},
        validation_code: { type: Number, required: true},
        token: { type: String, required: true, unique: true},
        accepted: { type: Boolean, required: true},
        nom: { type: String, required: true},
        prenom: { type: String, required: true},
        imageUrl: { type: String, required: true},
    }
);

pendingUserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('PendingUser', pendingUserSchema);