var mysql_pool = require('../db/mysql_con');
var express = require('express');
var router = express.Router();
var cors = require('cors');

router.get('/', function (req, res, next) {
   res.send('<div><h1>Welcome to Pawn API.</h1><p>Author: John Hitler!</p></div>');
});


module.exports = router;
