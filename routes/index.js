const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: `Olin's Portfolio` });
});

module.exports = router;
