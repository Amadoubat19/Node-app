const jwt = require('jsonwebtoken');

exports.authentificate = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        const bearer = auth.split(' ');
        console.log('bearer', bearer)
        jwt.verify(bearer, 'SECRET_TOKEN', function (error, decoded) {
            if(error) {
                return res.status(401).json({
                    error: "Invalid request" //new Error('Invalid request')
                });
            }
            const userId = decoded.userId;
            if (req.body.userId && req.body.userId !== userId) {
                console.log('if')
                throw 'Invalid user ID';
            } else {
                console.log('else')
                next();
            }
        });   
    } catch {
        console.log('catch')
        res.status(401).json({
            error: new Error('Invalid request')
        })
    }
}