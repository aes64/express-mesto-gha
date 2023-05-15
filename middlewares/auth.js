const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/error/UnauthorizedError');
const errors = require('../utils/constants');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.json(new UnauthorizedError(errors.UNAUTHORIZED));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    return res.json(new UnauthorizedError(errors.UNAUTHORIZED));
  }
  req.user = payload;
  next();
  return null;
};
