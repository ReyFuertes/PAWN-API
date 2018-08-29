var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');

var majorings = {
  getMajoring: function(req, res, next) {

    dac.query(`SELECT majorings.id, majorings.guid, majorings.name, majorings.description, categories.name AS category 
                FROM majorings 
                LEFT JOIN categories ON categories.id = majorings.category_id 
                ORDER BY majorings.id DESC`, [], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('majorings', results));
      return;
    });

  },
  createMajoring: function(req, res, next) {
    var payload = {
      guid: createGuid('MJ'),
      name: req.body.name || '',
      category_id: req.body.category_id || '',
      description: req.body.description || ''
    };

    dac.query(`INSERT INTO majorings (guid, name, description, category_id) VALUES (?, ?, ?, ?)`, [payload.guid, payload.name, payload.description, payload.category_id], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated majorings
      categories.getCategories(req, res);

    });

  },
  updateMajoring: function(req, res, next) {
    var values = {
      guid: req.body.guid,
      name: req.body.name || '',
      category_id: req.body.category_id || '',
      description: req.body.description || ''
    };

    dac.query(`UPDATE majorings SET guid = ?, name = ?, description = ?, category_id = ? WHERE guid = ?`, [values.guid, values.name, values.description, values.category_id, values.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated majorings
      categories.getCategories(req, res);

    });

  },
  deleteMajoring: function(req, res, next) {
    var payload = {
      guid: req.params.guid
    }

    dac.query(`DELETE FROM majorings WHERE guid = ?`, [payload.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated majorings
      categories.getCategories(req, res);

    });
  }
}

module.exports = majorings;