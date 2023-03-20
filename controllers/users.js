const mongoose = require('mongoose');
const User = require('../models/user');
const errors = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(() => res.status(errors.INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка сервера' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        res.status(errors.NOT_FOUND).send({
          message: 'Пользователь не найден',
        });
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный запрос',
        });
      } else {
        res.status(errors.INTERNAL_SERVER_ERROR).send({
          message: 'Произошла ошибка сервера',
        });
      }
    });
};

module.exports.createNewUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ user }))
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

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(errors.NOT_FOUND).send({
          message: 'Некорректный ID пользователя',
        });
      }
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(errors.BAD_REQUEST).send({
          message: 'Переданы некорректные данные',
        });
      } else {
        res.status(errors.INTERNAL_SERVER_ERROR).send({
          message: 'Произошла ошибка сервера',
        });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(errors.BAD_REQUEST).send({
          message: 'Некорректный запрос',
        });
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(errors.NOT_FOUND).send({
          message: 'Пользователь не найден',
        });
      } else {
        res.status(errors.INTERNAL_SERVER_ERROR).send({
          message: 'Произошла ошибка сервера',
        });
      }
    });
};
