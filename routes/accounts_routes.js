var express = require("express"),
  router = express.Router();

router.get('', function(req, res) {
  res.send('accounts');
});

router.get('/new', function(req, res) {
  res.send('new');
});


router.get('edit/:id', function(req, res) {
  res.send('accounts');
});


router.get('update/:id', function(req, res) {
  res.send('accounts');
});


router.get('delete/:id', function(req, res) {
  res.send('accounts');
});


module.exports = router;
