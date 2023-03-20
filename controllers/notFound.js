const errors = require('../utils/constants');

module.exports.checkWay = (req, res) => {
  res.status(errors.NOT_FOUND).send({
    message: 'Несуществующая страница',
  });
};
