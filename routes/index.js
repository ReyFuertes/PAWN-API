var express = require('express');
var router = express.Router();
var cors = require('cors');

/**
 * accounts 
 */
var accounts = require('./accounts_routes.js');
router.get('/accounts/list', accounts.list);
router.post('/accounts/new', accounts.new);
router.patch('/accounts/update/:id', accounts.update);
router.delete('/accounts/delete/:id', accounts.delete);

/**
 * items 
 */
var items = require('./items_routes.js');
router.get('/items/list', items.list);
router.post('/items/new', items.new);
router.patch('/items/update/:id', items.update);
router.delete('/items/delete/:id', items.delete);

/**
 * pawns 
 */
var pawns = require('./pawns_routes.js');
router.get('/pawns/list', pawns.list);
router.post('/pawns/new', pawns.new);
router.patch('/pawns/update/:id', pawns.update);
router.delete('/pawns/delete/:id', pawns.delete);

/**
 * renewals 
 */
var renewals = require('./renewals_routes.js');
router.get('/renewals/list', renewals.list);
router.post('/renewals/new', renewals.new);
router.patch('/renewals/update/:id', renewals.update);
router.delete('/renewals/delete/:id', renewals.delete);

/**
 * redemptions 
 */
var redemptions = require('./redemptions_routes.js');
router.get('/redemptions/list', redemptions.list);
router.post('/redemptions/new', redemptions.new);
router.patch('/redemptions/update/:id', redemptions.update);
router.delete('/redemptions/delete/:id', redemptions.delete);


// router.get('/authenticate', function(req, res) {
//   var data = ({'token':'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIiwiY3R5IjoiSldUIn0..MxsVtuJN0QhYAdveffzkTQ.vjTkjm19bSUGFqqykHPUkg32zGULXgVyBOSRTLdTp4wYz1Xnm-hmbSWYGACYO-6LNcLckpZ5Rn4z1nrPQ1WeeuVbHZf52aXjaJxRyMhEW4jpKbb8qY5gd7Q119csc2KwmRlsRq7ii_OxD9vhiKC7eTtTjFgDI-sG5A7--Njw8CAy5EiF3BYBvMxcjLHQlYhBiUzYqCTg-8VjaaXvccNfnRtTBDyMs1GcUEKvMJvTmHY.o1_NJPIb2xRR-W7qOsPVyQ','refreshToken':'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIiwiY3R5IjoiSldUIn0..MxsVtuJN0QhYAdveffzkTQ.vjTkjm19bSUGFqqykHPUkg32zGULXgVyBOSRTLdTp4wYz1Xnm-hmbSWYGACYO-6LNcLckpZ5Rn4z1nrPQ1WeeuVbHZf52aXjaJxRyMhEW4jpKbb8qY5gd7Q119csc2KwmRlsRq7ii_OxD9vhiKC7eTtTjFgDI-sG5A7--Njw8CAy5EiF3BYBvMxcjLHQlYhBiUzYqCTg-8VjaaXvccNfnRtTBDyMs1GcUEKvMJvTmHY.o1_NJPIb2xRR-W7qOsPVyQ'});
//       res.status(200).send(data);
// });

router.get('/', function (req, res, next) {
   res.send('<div><h1>Welcome to Pawn API.</h1><p>Author: John Hitler!</p></div>');
});


module.exports = router;
