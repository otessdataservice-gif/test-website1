const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are all required');
  }
  if (name.length < 2) {
    throw new ApiError(400, 'Name must be at least 2 characters');
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'That email address is already registered');
  }

  // The model hashes the password in a pre-save hook.
  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    data: { user: publicUser(user), token: signToken(user) },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // password has select:false on the schema, so ask for it explicitly.
  const user = await User.findOne({ email }).select('+password');

  // Same message either way so the endpoint does not confirm which emails exist.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    success: true,
    data: { user: publicUser(user), token: signToken(user) },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

module.exports = { register, login, getMe };
