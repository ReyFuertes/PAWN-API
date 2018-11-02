var dac = require("../db/dac");
var renewal = require("../models/renewal");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();


// accounts.account_id, 
// accounts.firstname, 
// accounts.lastname, 
// accounts.contact_number, 
// accounts.birthday AS birthDate, 
// accounts.valid_id, 
// accounts.valid_id_number, 
// accounts.address, 
// accounts.created

// pawns.pawn_id, 
// pawns.pawn_ticket_number, 
// pawns.date_loan_granted, 
// pawns.maturity_date, 
// pawns.expiry_date, 
// pawns.interest, 
// pawns.pawn_amount, 
// pawns.pawn_total_amount, 
// pawns.account_id

// LEFT JOIN pawns ON pawns.pawn_id = renewals.pawn_id
// LEFT JOIN accounts ON accounts.account_id = pawns.account_id
// LEFT JOIN items ON items.item_id = pawns.item_id

var renewals = {
  list: (req, res) => {
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
        renewals.pawn_id AS pawnId

       FROM renewals
`,
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
        res.json({ success: true, totalCount: totalCount, renewals: data });
        return;
      }
    );
  },
  new: (req, res) => {
    renewal.renewal_date = req.body.renewal_date || null;
    renewal.renewal_pawn_ticket = req.body.renewal_pawn_ticket || '';
    renewal.pawn_id = req.body.pawn_id || 0;
    renewal.renewal_amount = req.body.renewal_amount || 0;
    renewal.renewal_total_amount = req.body.renewal_total_amount || 0;
    renewal.interest = req.body.interest || 0;
    renewal.difference = req.body.difference || 0;
    renewal.remarks = req.body.remarks || '';
    renewal.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(
      `INSERT INTO renewals (renewal_date, renewal_pawn_ticket, pawn_id, renewal_amount, renewal_total_amount, interest, difference, remarks, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        renewal.renewal_date,
        renewal.renewal_pawn_ticket,
        renewal.pawn_id,
        renewal.renewal_amount,
        renewal.renewal_total_amount,
        renewal.interest,
        renewal.difference,
        renewal.remarks,
        renewal.created
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
