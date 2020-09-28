const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('response with a resource\n');
});

router.post('/', (req, res, next) => {
  console.log(req.body);
  res.send('response with a resource\n');
});

module.exports = router;
