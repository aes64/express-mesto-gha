const express = require('express');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const mongoose = require('mongoose');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorName = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();
mongoose.connect('mongodb://localhost:27017/mestodb', {
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/signin', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().min(2).pattern(errorName.REGEXPHTTP),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().min(2).pattern(errorName.REGEXPHTTP),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown(true),
}), createUser);
app.use(auth);
app.use('/cards', require('./routes/cards'));
app.use('/users', require('./routes/users'));

app.use(errors());
app.use('/', require('./routes/notFound'));

app.use((err, req, res) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
