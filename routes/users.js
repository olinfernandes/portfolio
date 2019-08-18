const express = require("express");
const router = express.Router();
const { User, Ops } = require("../bin/models");

/* GET users listing. */
router.get("/", (req, res, next) => {
  Ops.find((err, response) => {
    console.log(err, response);
    res.json(response);
  });
});

router.post("/", (req, res, next) => {
  console.log(req.body);
  res.send('response with a resource\n');
})

module.exports = router;
