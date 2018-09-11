var dac = require("../db/dac");
var response = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var accounts = {
  list: (req, res) => {
    dac.query(`SELECT account_id, firstname, lastname, contact_number, birthday, valid_id, valid_id_number, address, created FROM accounts`, [], function (err, data) {

      if (err) {
         res.status(401);
         res.json(messages.ErrorResponse);
         return;
      }
      res.status(200);
      res.json({'success': true, 'accounts': data});
      return;
   });
  },
  new: (req, res) => {
    var values = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      contact_number: req.body.contact_number,
      birthday: dateFormat(req.body.birthday, "yyyy-mm-dd"),
      valid_id: req.body.valid_id,
      valid_id_number: req.body.valid_id_number,
      address: req.body.address,
      created: dateFormat(now, "yyyy-mm-dd")
    };

    dac.query(
      `INSERT INTO accounts (firstname, lastname, contact_number, birthday, valid_id, valid_id_number, address, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        values.firstname,
        values.lastname,
        values.contact_number,
        values.birthday,
        values.valid_id,
        values.valid_id_number,
        values.address,
        values.created
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated accounts
        res.status(200);
        accounts.list(req, res);
      }
    );
  }
};

module.exports = accounts;
