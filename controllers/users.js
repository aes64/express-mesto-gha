const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
      if (error instanceof mongoose.Error.CastError) {
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

module.exports.getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        res.status(401).send('Пользователь не найден');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'super-strong-secret',
        { expiresIn: '7d' },
      );
      return res.send(token);
    })
    .catch(next);
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201)
      .send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      }))
    .catch((error) => {
      if (error.code === 11000) {
        res.status(errors.ALREADY_EXSIST).send({ message: 'Почта уже используется' });
      } else if (error instanceof mongoose.Error.ValidationError) {
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
      } else {
        res.status(errors.INTERNAL_SERVER_ERROR).send({
          message: 'Произошла ошибка сервера',
        });
      }
    });
};
