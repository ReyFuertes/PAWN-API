var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');

var profile = {
  update: function(req, res, next) {
    var payload = {
      guid: req.body.guid,
      address: req.body.address,
      contact: req.body.contact,
      fullname: req.body.fullname,
      school: req.body.school,
      username: req.body.username,
      email: req.body.email
    }

    dac.query(`UPDATE students JOIN users ON students.user_id = users.id
                SET address = ?, contact = ?, fullname = ?, school = ?, users.username = ?,
                users.email = ?, students.email = ? WHERE students.guid = ?`, [payload.address, payload.contact, payload.fullname, payload.school, payload.username, payload.email, payload.email, payload.guid], function(err, data) {

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
  detail: function(req, res, next) {
    var payload = {
      guid: req.body.guid || ''
    }

    dac.query(`SELECT students.guid, fullname, users.username, students.email, school, address, contact, user_id, students.image FROM students
                INNER JOIN users ON users.id = students.user_id WHERE users.guid = ?`, [payload.guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('categories', data));
      return;

    });
  }
}

module.exports = profile;