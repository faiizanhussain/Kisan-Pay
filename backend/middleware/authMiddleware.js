// Since no token authentication is needed, we can simply move forward without checking token
export const authenticate = (req, res, next) => {
    console.log('No token authentication, proceeding with request.');
    next();
};

// Since role-based checks can be done in the frontend (without JWT), we will skip this in middleware for simplicity
// If needed, you can implement a role check here based on user input from the frontend
export const adminMiddleware = (req, res, next) => {
    next();
};
