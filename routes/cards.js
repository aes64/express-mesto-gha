const router = require('express').Router();

const {
  getCards,
  deleteCard,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCard);
router.patch('/:cardId/likes', likeCard);
router.patch('/:cardId/likes', dislikeCard);

module.exports = router;
