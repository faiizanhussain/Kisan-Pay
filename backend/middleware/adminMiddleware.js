const adminMiddleware = (req, res, next) => {
    // Check if the role is passed in the request body or query params
    const role = req.body.role || req.query.role;

    if (!role || role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
};

module.exports = adminMiddleware;
