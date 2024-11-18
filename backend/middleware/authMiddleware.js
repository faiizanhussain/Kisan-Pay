const authenticate = (req, res, next) => {
    // Since no token authentication is needed, we can simply move forward without checking token
    console.log('No token authentication, proceeding with request.');
    next();
};

const adminMiddleware = (req, res, next) => {
    // Since role-based checks can be done in the frontend (without JWT), we will skip this in middleware for simplicity
    // If needed, you can implement a role check here based on user input from the frontend
    next();
};

module.exports = { authenticate, adminMiddleware };
