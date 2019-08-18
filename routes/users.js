const express = require('express');
const router = express.Router();
const { User, Ops } = require('../bin/models');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
  Ops.find((err, response)=> {
  	if(err) res.status(500).send('Something went wrong!');
  	else res.json(response);
  	return next();
  });
});

module.exports = router;
