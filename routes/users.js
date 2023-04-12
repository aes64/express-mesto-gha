const router = require('express').Router();

const {
  getUsers,
  getUserById,
  updateAvatar,
  updateUser,
  getMe,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/users/me', getMe);
router.get('/:userId', getUserById);
router.patch('/me/avatar', updateAvatar);
router.patch('/me', updateUser);

module.exports = router;
