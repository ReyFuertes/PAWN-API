var dac = require("../db/dac");
var renewal = require("../models/renewal");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var renewals = {
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
      `SELECT (SELECT COUNT(renewal_id) FROM renewals) AS count, 
        renewals.renewal_id AS id, 
        renewals.renewal_date AS renewalDate, 
        renewals.renewal_pawn_ticket AS renewalPawnTicket, 
        renewals.renewal_amount AS renewalAmount, 
        renewals.renewal_total_amount AS renewalTotalAmount, 
        renewals.interest, 
        renewals.difference, 
        renewals.remarks, 
        renewals.created, 
        renewals.modified,
        renewals.pawn_id AS pawnId,

        accounts.account_id, 
        accounts.id_number AS idNumber, 
        CONCAT(accounts.firstname, ',', accounts.lastname) AS fullname, 
        accounts.contact_number AS phoneNumber, 
        accounts.birthday, 
        accounts.valid_id AS validId, 
        accounts.valid_id_number AS validIdNumber, 
        accounts.address,

        pawns.pawn_ticket_number AS pawnTicketNumber, 
        pawns.pawn_date_granted AS pawnDateGranted, 
        pawns.pawn_maturity_date AS pawnMaturityDate, 
        pawns.pawn_expiry_date AS pawnExpiryDate, 
        pawns.pawn_interest AS pawnInterest, 
        pawns.pawn_amount AS pawnAmount, 
        pawns.pawn_total_amount AS pawnTotalAmount, 

        items.item_id, 
        items.sku AS sku,
        items.item_name AS itemName, 
        items.item_type AS itemType, 
        items.grams, 
        items.karat, 
        items.description

       FROM renewals
       
      LEFT JOIN pawns ON pawns.pawn_id = renewals.pawn_id
      LEFT JOIN accounts ON accounts.account_id = pawns.account_id
      LEFT JOIN items ON items.item_id = pawns.item_id
      ORDER BY pawns.created DESC 
      ${queryString}`, 
       [], function(err, data) {
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
        res.json({ success: true, totalCount: totalCount, renewals: data });
        return;
      }
    );
  },
  new: (req, res) => {
    renewal.renewal_date = req.body.renewalDate || null;
    renewal.renewal_amount = req.body.renewalAmount || '';
    renewal.renewal_total_amount = req.body.renewalTotalAmount || '';
    renewal.interest = req.body.interest || '';
    renewal.difference = req.body.difference || '';
    renewal.remarks = req.body.remarks || '';
    renewal.pawn_id = req.body.pawnId || '';
    renewal.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || "";

    console.log(renewal);
    dac.query(
      `INSERT INTO renewals (renewal_date, renewal_amount, renewal_total_amount, interest, difference, remarks, pawn_id, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        renewal.renewal_date,
        renewal.renewal_amount,
        renewal.renewal_total_amount,
        renewal.interest,
        renewal.difference,
        renewal.remarks,
        renewal.pawn_id,
        renewal.created
      ],
      function(err, data) {
        //catch error
        console.log(err);
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated renewals
        renewals.list(req, res);
      }
    );
  },
  update: (req, res) => {
    renewal.renewal_id = req.params.id || 0;
    renewal.renewal_date = req.body.renewal_date || null;
    renewal.renewal_pawn_ticket = req.body.renewal_pawn_ticket || '';
    renewal.pawn_id = req.body.pawn_id || 0;
    renewal.renewal_amount = req.body.renewal_amount || 0;
    renewal.renewal_total_amount = req.body.renewal_total_amount || 0;
    renewal.interest = req.body.interest || 0;
    renewal.difference = req.body.difference || 0;
    renewal.remarks = req.body.remarks || '';
    renewal.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(
      `UPDATE renewals SET renewal_date = ?, renewal_pawn_ticket = ?, pawn_id = ?, renewal_amount = ?, renewal_total_amount = ?, interest = ?, difference = ?, remarks = ?, modified  = ? 
       WHERE renewal_id`,
      [
        renewal.renewal_date,
        renewal.renewal_pawn_ticket,
        renewal.pawn_id,
        renewal.renewal_amount,
        renewal.renewal_total_amount,
        renewal.interest,
        renewal.difference,
        renewal.remarks,
        renewal.modified,
        renewal.renewal_id
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated renewals
        renewals.list(req, res);
      }
    );
  },
  delete: (req, res) => {
    renewals.renewal_id = req.params.id || 0;

    dac.query(
      `DELETE FROM renewals WHERE renewal_id = ?`,
      [renewals.renewal_id],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        //get updated renewals
        renewals.list(req, res);
      }
    );
  }
};

module.exports = renewals;
