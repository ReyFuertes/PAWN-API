var dac = require("../db/dac");
var account = require("../models/account");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();
router = express.Router();

var accounts = {
  getOne: (req, res) => {
    var id = req.query.id;
    dac.query(`SELECT account_id AS id, id_number AS idNumber, firstname AS firstName, lastname AS lastName, CONCAT(firstname, ',', lastname) AS fullname, 
                  contact_number AS phoneNumber, birthday, valid_id AS validId, valid_id_number AS validIdNumber, address 
                FROM accounts 
                WHERE account_id = ?
                `, 
             [id], function(err, data) {
   
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({ success: true, account: data });
        return;
      }
    );
  },
  search: (req, res) => {
    var searchTerm = req.query.term;

    dac.query(`SELECT (SELECT COUNT(account_id) AS count FROM accounts) AS count, 
                  account_id AS id, id_number AS idNumber, 
                  CONCAT(firstname, ',', lastname) AS fullname, 
                  contact_number AS phoneNumber, birthday, valid_id AS validId, 
                  valid_id_number AS validIdNumber, address 
                FROM accounts 
                WHERE 
                  id_number LIKE ? OR
                  firstname LIKE ? OR
                  lastname LIKE ? OR
                  contact_number LIKE ? OR
                  valid_id_number LIKE ? OR
                  address LIKE ?
                ORDER BY id DESC
                `, 
             [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,
              `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`], function(err, data) {
   
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
  edit: (req, res) => {
    var params = getParams(req);
    dac.query(
      `SELECT account_id AS id, 
                id_number AS idNumber, 
                firstName, 
                lastName,
                contact_number AS phoneNumber, 
                birthday AS birthDate, 
                valid_id AS validId, 
                valid_id_number AS validIdNumber, 
                address
               FROM accounts 
               WHERE account_id = ?`,
      [params[0].value],
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
  list: (req, res) => {
    var params = req.query.params || [];
    var param = [];
    var querystringArr,
      queryString = "LIMIT 10 offset 0";

    if (params && params.length > 0) {
      querystringArr = params.split("&");

      querystringArr.forEach(item => {
        var obj = { key: item.split("=")[0], value: item.split("=")[1] };
        param.push(obj);
      });

      queryString =
        param[0].value && param[1].value
          ? ` LIMIT ${param[0].value} offset ${param[1].value}`
          : "LIMIT 10 offset 0";
    }

    dac.query(
      `SELECT (SELECT COUNT(account_id) AS count FROM accounts) AS count, 
                  account_id AS id, 
                  id_number AS idNumber, 
                  CONCAT(firstname, ',', lastname) AS fullname, 
                  contact_number AS phoneNumber, 
                  birthday, 
                  valid_id AS validId, 
                  valid_id_number AS validIdNumber, 
                  address
               FROM accounts 
               ORDER by id DESC 
               ${queryString}`,
      [],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        var totalCount = data[0].count;
        data.forEach(row => {
          delete row.count;
        });

        res.status(200);
        res.json({ success: true, totalCount: totalCount, accounts: data });
        return;
      }
    );
  },
  new: (req, res) => {
    account.id_number = req.body.idNumber || "";
    account.firstname = req.body.firstName || "";
    account.lastname = req.body.lastName || "";
    account.contact_number = req.body.phoneNumber || "";
    account.birthday = dateFormat(req.body.birthDate, "mm/dd/yyyy") || "";
    account.valid_id = req.body.validId || "";
    account.valid_id_number = req.body.validIdNumber || "";
    account.address = req.body.address || "";
    account.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || "";

    dac.query(
      `INSERT INTO accounts (id_number, firstname, lastname, contact_number, birthday, valid_id, valid_id_number, address, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id_number,
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
    account.id_number = req.params.id_number || "";
    account.firstname = req.body.firstname || "";
    account.lastname = req.body.lastname || "";
    account.contact_number = req.body.contact_number || "";
    account.birthday = dateFormat(req.body.birthday, "yyyy-mm-dd") || "";
    account.valid_id = req.body.valid_id || "";
    account.valid_id_number = req.body.valid_id_number || "";
    account.address = req.body.address || "";
    account.modified = dateFormat(now, "yyyy-mm-dd") || "";

    dac.query(
      `UPDATE accounts SET id_number = ?, firstname = ?, lastname = ?, contact_number = ?, birthday = ?, valid_id = ?, valid_id_number = ?, address = ?, modified = ? 
            WHERE account_id = ?`,
      [
        account.account_id,
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

    dac.query(
      `DELETE FROM accounts WHERE account_id = ?`,
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

function getParams(req) {
  var params = req.query.params || [];
  var param = [];
  var querystringArr;

  if (params && params.length > 0) {
    querystringArr = params.split("&");

    querystringArr.forEach(item => {
      var obj = { key: item.split("=")[0], value: item.split("=")[1] };
      param.push(obj);
    });
  }
  return param;
}

module.exports = accounts;
