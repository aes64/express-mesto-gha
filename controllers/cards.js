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

module.exports.deleteCard = async (req, res, next) => {
  try {
    const cardId = await Card.findOne({ _id: req.params.cardId });
    const cardOwner = req.user._id;
    if (cardId === null) {
      res.status(404).send({ message: 'Карточка не найдена' });
    } else if (cardId.owner.valueOf() === cardOwner) {
      const card = await Card.findByIdAndRemove(req.params.cardId);
      res.send(card);
    } else {
      res.status(403).send({ message: 'Нет прав' });
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).send({ message: 'Некорректный запрос' });
    } else {
      next(err);
    }
  }
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send({ card });
      } else {
        res.status(errors.NOT_FOUND).send({
          message: 'Нет карточки с таким ID',
        });
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный ID',
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
    .then((card) => {
      if (card) {
        res.send({ card });
      } else {
        res.status(errors.NOT_FOUND).send({
          message: 'Нет карточки с таким ID',
        });
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный ID',
        });
      } else {
        res.status(errors.INTERNAL_SERVER_ERROR).send({
          message: 'Произошла ошибка сервера',
        });
      }
    });
};
