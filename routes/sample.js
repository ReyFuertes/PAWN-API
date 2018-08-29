var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');

var categories = {
   getCategoryWOMajoring: function (req, res) {
      dac.query(`SELECT id, guid, name, description FROM categories WHERE ismajoring = 0 ORDER BY id DESC`, [], function (err, data) {

         if (err) {
            res.status(401);
            res.json(messages.ErrorResponse);
            return;
         }
         res.status(200);
         res.json(messages.SuccessReponse('categories', data));
         return;
      });
   },
   getCategoryByMajoring: function (req, res) {
      dac.query(`SELECT id, guid, name, description, IF(ismajoring = 1, "yes", "no") AS ismajoring 
                 FROM categories ORDER BY id DESC`, [], function (err, data) {

            if (err) {
               res.status(401);
               res.json(messages.ErrorResponse);
               return;
            }
            res.status(200);
            res.json(messages.SuccessReponse('categories', data));
            return;
         });
   },
   getCategories: function (req, res) {

      dac.query(`SELECT id, guid, name, time_limit, description FROM categories WHERE ismajoring = 1
                 ORDER BY id DESC`, [], function (err, data) {

            if (err) {
               res.status(401);
               res.json(messages.ErrorResponse);
               return;
            }
            res.status(200);
            res.json(messages.SuccessReponse('categories', data));
            return;
         });

   },
   createCategory: function (req, res) {
      var values = {
         guid: helpersFn.createGuid('CT'),
         name: req.body.name || '',
         description: req.body.description || '',
         ismajoring: ((req.body.ismajoring === true) ? 1 : 0) || 0
      };

      //insert new category
      dac.query(`INSERT INTO categories (guid, name, description, ismajoring) VALUES (?, ?, ?, ?)`,
         [values.guid, values.name, values.description, values.ismajoring],
         function (err, data) {

            if (err) {
               res.status(401);
               res.json(messages.ErrorResponse);
               return;
            }

            //get updated categories
            categories.getCategories(req, res);

         });

   },
   updateCategory: function (req, res) {
      var values = {
         guid: req.body.guid || '',
         name: req.body.name || '',
         description: req.body.description || '',
         ismajoring: ((req.body.ismajoring === true) ? 1 : 0) || 0
      };

      //update new category
      dac.query(`UPDATE categories SET guid = ?, name = ?, description = ?, ismajoring = ? WHERE guid = ?`,
         [values.guid, values.name, values.description, values.ismajoring, values.guid],
         function (err, data) {

            if (err) {
               res.status(401);
               res.json(messages.ErrorResponse);
               return;
            }

            //get updated categories
            categories.getCategories(req, res);

         });

   },
   deleteCategory: function (req, res) {
      var guid = req.params.guid || '';

      dac.query(`DELETE FROM categories WHERE guid = ?`, [guid],
         function (err, data) {

            if (err) {
               res.status(401);
               res.json(messages.ErrorResponse);
               return;
            }
            //get updated categories
            categories.getCategories(req, res);

         });
   }
}

module.exports = categories;