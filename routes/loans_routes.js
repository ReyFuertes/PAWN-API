var express = require('express'),
  router = express.Router();

router.get('', function(req, res) {
  res.send('loans');
});

router.get('/new', function(req, res) {
  res.send('new');
});

router.post('edit/:id', function(req, res) {
  res.send('accounts');
});

router.put('update/:id', function(req, res) {
  res.send('accounts');
});

router.delete('delete/:id', function(req, res) {
  res.send('accounts');
});

module.exports = router;
