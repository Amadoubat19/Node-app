const jwt = require('jsonwebtoken');

exports.authentificate = (req, res, next) => {
    try {
        const bearer = req.headers.authorization;
        const userId = jwt.decode(bearer, 'SECRET_TOKEN').userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else {
        next();
        }      
    } catch {
        res.status(401).json({
            error: new Error('Invalid request')
        })
    }
}