var dac = require("../db/dac");
var pawn = require("../models/pawn");
var item = require("../models/item");
var account = require("../models/account");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var pawns = {
  search: (req, res) => {
    dac.query(
      `SELECT pawns.pawn_id, pawns.pawn_ticket_number, pawns.date_loan_granted, pawns.maturity_date, pawns.expiry_date, pawns.interest, pawns.pawn_amount, pawns.pawn_total_amount, pawns.account_id, pawns.item_id, pawns.created,
              items.item_name, items.item_type, items.grams, items.karat, items.description, items.created, items.modified,
              accounts.account_id, accounts.firstname, accounts.lastname, accounts.contact_number, accounts.birthday, accounts.valid_id, accounts.valid_id_number, accounts.address, accounts.created
       FROM pawns
       LEFT JOIN items ON pawns.item_id = items.item_id
       LEFT JOIN accounts ON pawns.account_id = accounts.account_id`,
      [],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        res.status(200);
        res.json({ success: true, items: data });
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

    // items.item_name AS itemName, 
    // items.item_type AS itemType, 
    // items.grams, 
    // items.karat, 
    // items.description, 
    // items.modified,
    // accounts.firstname AS firstName, 
    // accounts.lastname AS lastName, 
    // accounts.contact_number AS contactNumber, 
    // accounts.birthday, 
    // accounts.address, 
    // accounts.valid_id AS validId, 
    // accounts.valid_id_number AS validIdNumber

    // LEFT JOIN items ON pawns.item_id = items.item_id
    // LEFT JOIN accounts ON pawns.account_id = accounts.account_id

    dac.query(
      `SELECT (SELECT COUNT(pawn_id) FROM pawns) AS count, 
          pawns.pawn_id, 
          pawns.pawn_ticket_number AS pawnTicketNumber, 
          pawns.pawn_date_granted AS pawnDateGranted, 
          pawns.pawn_maturity_date AS pawnMaturityDate, 
          pawns.pawn_expiry_date AS pawnExpiryDate, 
          pawns.pawn_interest AS pawnInterest, 
          pawns.pawn_amount AS pawnAmount, 
          pawns.pawn_total_amount AS pawnTotalAmount, 
          pawns.created
       FROM pawns
       
       ${queryString}`,
      [],
      function(err, data) {
        console.log(err);
        var totalCount = data[0].count;
        data.forEach(row => {
          delete row.count;
        });

        res.status(200);
        res.json({ success: true, totalCount: totalCount, pawns: data });
        return;
      }
    );
  },
  new: (req, res) => {
    pawn.pawn_ticket_number = req.body.pawnTicketNumber || '';
    pawn.pawn_date_granted = dateFormat(req.body.date_pawn_granted, "mm/dd/yyyy") || "";
    pawn.pawn_maturity_date = dateFormat(req.body.pawnMaturityDate, "mm/dd/yyyy") || "";
    pawn.pawn_expiry_date =dateFormat(req.body.pawnExpiryDate, "mm/dd/yyyy") || "";
    pawn.pawn_interest = req.body.pawnInterest || '';
    pawn.pawn_amount = req.body.pawnAmount || '';
    pawn.pawn_total_amount = req.body.pawnTotalAmount || '';
    pawn.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    //insert item

    //insert account id

    dac.query(`INSERT INTO pawns (pawn_ticket_number, pawn_date_granted, pawn_maturity_date, pawn_expiry_date, 
                pawn_interest, pawn_amount, pawn_total_amount, created) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pawn.pawn_ticket_number,
        pawn.pawn_date_granted,
        pawn.pawn_maturity_date,
        pawn.pawn_expiry_date,
        pawn.pawn_interest,
        pawn.pawn_amount,
        pawn.pawn_total_amount,
        pawn.created
      ],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        pawns.list(req, res);
      }
    );
  },
  update: (req, res) => {
    pawn.pawn_id = req.params.id || '';
    pawn.pawn_ticket_number = req.body.pawn_ticket_number || '';
    pawn.date_loan_granted = req.body.date_loan_granted || '';
    pawn.maturity_date = req.body.maturity_date || '';
    pawn.expiry_date = req.body.expiry_date || '';
    pawn.interest = req.body.interest || '';
    pawn.pawn_amount = req.body.pawn_amount || '';
    pawn.pawn_total_amount = req.body.pawn_total_amount || '';
    pawn.account_id = req.body.account_id || '';
    pawn.item_id = req.body.item_id || '';
    pawn.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(`UPDATE pawns SET pawn_ticket_number = ?, date_loan_granted = ?, maturity_date = ?, expiry_date = ?, 
                                interest = ?, pawn_amount = ?, pawn_total_amount = ?, account_id = ?, item_id = ?, modified = ? 
               WHERE pawn_id = ?`,
      [
        pawn.pawn_ticket_number,
        pawn.date_loan_granted,
        pawn.maturity_date,
        pawn.expiry_date,
        pawn.interest,
        pawn.pawn_amount,
        pawn.pawn_total_amount,
        pawn.account_id,
        pawn.item_id,
        pawn.modified,
        pawn.pawn_id
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated pawns
        pawns.list(req, res);
      }
    );
  },
  delete: (req, res) => {
    pawns.pawn_id = req.params.id || 0;

    dac.query(
      `DELETE FROM pawns WHERE pawn_id = ?`,
      [pawns.pawn_id],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        //get updated pawns
        pawns.list(req, res);
      }
    );
  }
};

module.exports = pawns;
