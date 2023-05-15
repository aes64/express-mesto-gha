const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const errors = require('../utils/constants');
const NotFoundError = require('../utils/error/NotFoundError');
const BadRequestError = require('../utils/error/BadRequestError');
const AlreadyExistError = require('../utils/error/AlreadyExistError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } const error = NotFoundError(errors.NOT_FOUND);
      return res.status(error.statusCode).send({ message: error.message });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new NotFoundError(errors.NOT_FOUND));
      } else {
        next(error);
      }
    });
};

module.exports.getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send(user);
      } const error = NotFoundError(errors.NOT_FOUND);
      return res.status(error.statusCode).send({ message: error.message });
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
      res.send({ email, password, token });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
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
    .catch((err) => {
      if (err.code === 11000) {
        const error = new AlreadyExistError(errors.ALREADY_EXIST);
        return res.status(error.statusCode).send({ message: error.message });
      }
      if (err instanceof mongoose.Error.ValidationError) {
        const error = new BadRequestError(errors.BAD_REQUEST);
        return res.status(error.statusCode).send({ message: error.message });
      }
      return next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
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
        next(new BadRequestError(errors.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user) {
        res.send({ data: user });
      }
      const error = NotFoundError(errors.NOT_FOUND);
      return res.status(error.statusCode).send({ message: error.message });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(errors.BAD_REQUEST));
      } else {
        next(error);
      }
    });
};
