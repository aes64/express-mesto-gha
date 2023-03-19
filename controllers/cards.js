const mongoose = require('mongoose');
const Card = require('../models/card');
const errors = require('../utils/constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(errors.INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка сервера' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный запрос',
        });
      }
      return res.status(errors.INTERNAL_SERVER_ERROR).send({
        message: 'Произошла ошибка сервера',
      });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(() => res.send({ message: 'Карточка удалена' }))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(errors.NOT_FOUND).send({
          message: 'Карточка не найдена',
        });
      }
      return res.status(errors.INTERNAL_SERVER_ERROR).send({
        message: 'Произошла ошибка сервера',
      });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.send({ card }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный запрос',
        });
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(errors.NOT_FOUND).send({
          message: 'Карточка не найдена',
        });
      } else {
        res.status(errors.INTERNAL_SERVER_ERROR).send({
          message: 'Произошла ошибка сервера',
        });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.send({ card }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный запрос',
        });
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(errors.NOT_FOUND).send({
          message: 'Карточка не найдена',
        });
      }
      return res.status(errors.INTERNAL_SERVER_ERROR).send({
        message: 'Произошла ошибка сервера',
      });
    });
};
