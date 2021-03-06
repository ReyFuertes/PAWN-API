var dac = require("../db/dac");
var account = require("../models/account");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var accounts = {
  print: (req, res) => {
    var params = req.query;
    dac.query(`SELECT account_id AS id, 
                  id_number AS idNumber, 
                  CONCAT(firstname, ',', lastname) AS fullname, 
                  phone_number AS phoneNumber, 
                  mobile_number AS mobileNumber,
                  birthday, 
                  valid_id AS validId, 
                  valid_id_number AS validIdNumber, 
                  address,
                  DATE_FORMAT(created, '%m/%e/%Y') AS created
              FROM accounts 
              WHERE created BETWEEN '${dateFormat(params.from, 'yyyy-mm-dd')}' AND '${dateFormat(params.to, 'yyyy-mm-dd')}'
              ORDER by account_id DESC`,
      [],
      function(err, data) {
        if (err) {
          console.log(err);
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
  getOne: (req, res) => {
    var id = req.query.id;
    dac.query(`SELECT account_id AS id, id_number AS idNumber, firstname AS firstName, lastname AS lastName, CONCAT(firstname, ',', lastname) AS fullname,            phone_number AS phoneNumber, mobile_number AS mobileNumber,
                  contact_number AS phoneNumber, birthday AS birthDate, valid_id AS validId, valid_id_number AS validIdNumber, address 
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
                  account_id AS id, 
                  id_number AS idNumber, 
                  CONCAT(firstname, ',', lastname) AS fullname, 
                  middlename AS middleName, 
                  contact_number AS contactNumber, 
                  phone_number AS phoneNumber, 
                  mobile_number AS mobileNumber,
                  birthday, valid_id AS validId, 
                  valid_id_number AS validIdNumber, address 
                FROM accounts 
                WHERE 
                  id_number LIKE ? OR
                  firstname LIKE ? OR
                  lastname LIKE ? OR
                  middlename LIKE ? OR
                  contact_number LIKE ? OR
                  valid_id_number LIKE ? OR
                  address LIKE ?
                ORDER BY id DESC
                `, 
             [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,
              `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`], function(err, data) {
   
        if (err) {
          res.status(401);
          console.log(err);
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
                firstname AS firstName, 
                lastname AS lastName,
                middlename AS middleName, 
                contact_number AS phoneNumber, 
                phone_number AS phoneNumber, 
                mobile_number AS mobileNumber,
                birthday AS birthDate, 
                valid_id AS validId, 
                valid_id_number AS validIdNumber, 
                address,
                image
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
        res.json({ success: true, accounts: data[0] });
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
      `SELECT (SELECT COUNT(account_id) FROM accounts) AS count, 
                  account_id AS id, 
                  id_number AS idNumber, 
                  CONCAT(firstname, ',', lastname) AS fullname, 
                  middlename AS middleName, 
                  contact_number AS phoneNumber, 
                  phone_number AS phoneNumber, 
                  mobile_number AS mobileNumber,
                  birthday, 
                  valid_id AS validId, 
                  valid_id_number AS validIdNumber, 
                  address,
                  image,
                  DATE_FORMAT(created, '%m/%e/%Y') AS created
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

        var totalCount = 0;
        if(data.length > 0) {
          totalCount = data[0].count;
          data.forEach(row => {
            delete row.count;
          });
        }

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
    account.image = req.body.image;

    account.phone_number  = req.body.phoneNumber || "";
    account.mobile_number = req.body.phoneNumber || "";
    account.middlename = req.body.middleName || "";

    dac.query(
      `INSERT INTO accounts (id_number, firstname, lastname, middlename, phone_number, mobile_number, birthday, valid_id, valid_id_number, address, image, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id_number, account.firstname,account.lastname, account.middlename, account.phone_number, account.mobile_number, account.birthday, account.valid_id,
        account.valid_id_number, account.address, account.image, account.created
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
    account.id_number = req.body.idNumber || "";
    account.firstname = req.body.firstName || "";
    account.lastname = req.body.lastName || "";
    account.contact_number = req.body.phoneNumber || "";
    account.birthday = dateFormat(req.body.birthDate, "mm/dd/yyyy") || "";
    account.valid_id = req.body.validId || "";
    account.valid_id_number = req.body.validIdNumber || "";
    account.address = req.body.address || "";
    account.image = req.body.image;
    account.modified = dateFormat(now, "yyyy-mm-dd") || "";
 
    account.phone_number  = req.body.phoneNumber || "";
    account.mobile_number = req.body.phoneNumber || "";
    account.middlename = req.body.middleName || "";

    dac.query(
      `UPDATE accounts SET id_number = ?, firstname = ?, lastname = ?, middlename = ?, phone_number = ?, mobile_number  = ?, birthday = ?, valid_id = ?, valid_id_number = ?, address = ?, image = ?, modified = ? 
            WHERE account_id = ?`,
      [
        account.id_number,
        account.firstname,
        account.lastname,
        account.middlename,
        account.phone_number ,
        account.mobile_number,
        account.birthday,
        account.valid_id,
        account.valid_id_number,
        account.address,
        account.image,
        account.modified,
        account.account_id
      ],
      function(err, data) {
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
