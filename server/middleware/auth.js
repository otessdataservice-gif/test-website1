const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Verifies the bearer token and attaches the real user document to req.user.
 * The user id always comes from the signed token, never from the request body.
 */
async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Session expired, please log in again'
          : 'Not authorized, token is invalid';
      throw new ApiError(401, message);
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new ApiError(401, 'Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
