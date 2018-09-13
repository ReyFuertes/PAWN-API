var dac = require("../db/dac");
var account = require("../models/account");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var accounts = {
  list: (req, res) => {
    dac.query(
      `SELECT account_id, firstname, lastname, contact_number, birthday, valid_id, valid_id_number, address, created FROM accounts`,
      [],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        res.status(200);
        res.json({ success: true, accounts: data });
        return;
      }
    );
  },
  new: (req, res) => {
    account.firstname = req.body.firstname || '';
    account.lastname = req.body.lastname || '';
    account.contact_number = req.body.contact_number || '';
    account.birthday = dateFormat(req.body.birthday, "yyyy-mm-dd") || '';
    account.valid_id = req.body.valid_id || '';
    account.valid_id_number = req.body.valid_id_number || '';
    account.address = req.body.address || '';
    account.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || '';

    dac.query(
      `INSERT INTO accounts (firstname, lastname, contact_number, birthday, valid_id, valid_id_number, address, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.firstname,
        account.lastname,
        account.contact_number,
        account.birthday,
        account.valid_id,
        account.valid_id_number,
        account.address,
        account.created
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
  },
  update: (req, res) => {
    account.account_id = req.params.id || 0;
    account.firstname = req.body.firstname || '';
    account.lastname = req.body.lastname || '';
    account.contact_number = req.body.contact_number || '';
    account.birthday = dateFormat(req.body.birthday, "yyyy-mm-dd") || '';
    account.valid_id = req.body.valid_id || '';
    account.valid_id_number = req.body.valid_id_number || '';
    account.address = req.body.address || '';
    account.modified = dateFormat(now, "yyyy-mm-dd") || '';

    dac.query(
      `UPDATE accounts SET firstname = ?, lastname = ?, contact_number = ?, birthday = ?, valid_id = ?, valid_id_number = ?, address = ?, modified = ? 
            WHERE account_id = ?`,
      [
        account.firstname,
        account.lastname,
        account.contact_number,
        account.birthday,
        account.valid_id,
        account.valid_id_number,
        account.address,
        account.created,
        account.account_id
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
  },
  delete: (req, res) => {
    account.account_id = req.params.id || 0;

    dac.query(`DELETE FROM accounts WHERE account_id = ?`,
      [account.account_id],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        //get updated accounts
        accounts.list(req, res);
      }
    );
  }
};

module.exports = accounts;
