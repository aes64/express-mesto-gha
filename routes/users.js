const router = require('express').Router();

const {
  getUsers,
  getUserById,
  createNewUser,
  updateAvatar,
  updateUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.post('/', createNewUser);
router.patch('/me/avatar', updateAvatar);
router.patch('/me', updateUser);
module.exports = router;
