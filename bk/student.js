var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');

var students = {
  isMajoring: function(req, res, next) {
    var payload = {
      isMajoring: req.body.isMajoring
    }

    dac.query(`SELECT majoring, fullname, email, school, address, contact FROM students`, [], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('ismajoring', results));
      return;
    });

  },
  getStudents: function(req, res, next) {
    dac.query(`SELECT guid, fullname, email, school, address, contact FROM students ORDER BY id DESC`, [], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('students', results));
      return;
    });

  },
  createStudent: function(req, res, next) {
    var payload = {
      guid: helpersFn.createGuid('ST'),
      fullname: req.body.fullname || '',
      email: req.body.email || '',
      school: req.body.school || '',
      address: req.body.address || '',
      contact: req.body.contact || '',
      status: 0
    };

    dac.query(`INSERT INTO students (guid, fullname, email, school, address, contact) VALUES (?, ?, ?, ?, ?, ?)`, [payload.guid, payload.fullname, payload.email, payload.school, payload.address, payload.contact], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated students
      students.getStudents(req, res);

    });
  },
  updateStudent: function(req, res, next) {
    var payload = {
      guid: req.body.guid,
      fullname: req.body.fullname || '',
      email: req.body.email || '',
      school: req.body.school || '',
      address: req.body.address || '',
      contact: req.body.contact || ''
    };

    dac.query(`UPDATE students SET guid = ?, fullname = ?, address = ?, email = ?, contact = ?, school =? WHERE guid = ?`, [payload.guid, payload.fullname, payload.address, payload.email, payload.contact, payload.school, payload.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated students
      students.getStudents(req, res);

    });

  },
  deleteStudent: function(req, res, next) {
    var payload = {
      guid: req.params.guid
    }

    dac.query(`DELETE FROM students WHERE guid = ?`, [payload.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated students
      students.getStudents(req, res);

    });
  }
}

module.exports = students;