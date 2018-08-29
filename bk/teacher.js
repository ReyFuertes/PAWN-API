var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');

var teachers = {
  getTeachers: function(req, res, next) {
    dac.query(`SELECT guid, name, address, contact, email, status FROM teachers ORDER BY id DESC`, [], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('teachers', results));
      return;
    });

  },
  createTeacher: function(req, res, next) {
    var payload = {
      guid: helpersFn.createGuid('TH') || '',
      name: req.body.name || '',
      address: req.body.address || '',
      contact: req.body.contact || '',
      email: req.body.email || '',
      status: 0
    };

    dac.query(`INSERT INTO teachers (guid, name, address, contact, email, status) VALUES (?, ?, ?, ?, ?, ?)`, [payload.guid, payload.name, payload.address, payload.contact, payload.email, payload.status], function(err, data) {
      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      teachers.getTeachers(req, res);
    });

  },
  updateTeacher: function(req, res, next) {
    var payload = {
      guid: req.body.guid || '',
      name: req.body.name || '',
      address: req.body.address || '',
      contact: req.body.contact || '',
      email: req.body.email || ''
    };

    dac.query(`UPDATE teachers SET guid = ?, name = ?, address = ?, contact = ?, email = ? WHERE guid = ?`, [payload.guid, payload.name, payload.address, payload.contact, payload.email, payload.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      teachers.getTeachers(req, res);
    });
  },
  deleteTeacher: function(req, res, next) {
    var payload = {
      guid: req.params.guid
    }

    dac.query('DELETE FROM teachers WHERE guid = ?', [payload.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      
      teachers.getTeachers(req, res);
    });
  }
}

module.exports = teachers;