const jwt = require('jsonwebtoken');

exports.authentificate = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        const bearer = auth.split(' ');
        console.log('bearer', bearer)
        jwt.verify(bearer, 'SECRET_TOKEN', function (error, decoded) {
            if(error) {
                return res.status(401).json({
                    error: "Invalid request" 
                });
            }
            const userId = decoded.userId;
            if (req.body.userId && req.body.userId !== userId) {
                throw 'Invalid user ID';
            } else {
                next(userId);
            }
        });   
    } catch {
        console.log('catch')
        res.status(401).json({
            error: new Error('Invalid request')
        })
    }
}

exports.authAdmin = (userId, req, res, next) => {
    User.findOne({_id: userId})
    .then(user => {
        if(!user || !user.admin) {
            return res.status(401).json({ error: 'Vous ne pouvez effectuer cette opération !' });
        } else {
            next();
        }
    })
    .catch( error => res.status(500).json({error}))
}