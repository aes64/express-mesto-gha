const errors = require('../utils/constants');
const NotFoundError = require('../utils/error/NotFoundError');

module.exports.checkWay = (req, res) => {
  const error = new NotFoundError(errors.NOT_FOUND);
  return res.status(error.statusCode).send({ message: error.message });
};
