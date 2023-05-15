const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/error/UnauthorizedError');
const errors = require('../utils/constants');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  let payload;
  try {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError(errors.UNAUTHORIZED);
    }
    const token = authorization.replace('Bearer ', '');
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    const error = new UnauthorizedError(errors.UNAUTHORIZED);
    return res.status(error.statusCode).send({ message: error.message });
  }
  req.user = payload;
  next();
  return null;
};
