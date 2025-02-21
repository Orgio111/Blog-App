const jwt = require('jwt-simple');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Unauthorized');

    try {
        const decoded = jwt.decode(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).send('Forbidden');
    }
};
