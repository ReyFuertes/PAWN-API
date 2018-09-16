var dac = require("../db/dac");
var redemption = require("../models/redemption");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var redemptions = {
  list: (req, res) => {
    dac.query(
      `SELECT redemptions.redemption_id, redemptions.redemption_date, redemptions.redemption_pawn_ticket, redemptions.pawn_id, redemptions.redemption_amount, redemptions.redemption_total_amount, redemptions.interest, redemptions.difference, redemptions.remarks, redemptions.created, redemptions.modified,
              pawns.pawn_id, pawns.pawn_ticket_number, pawns.date_loan_granted, pawns.maturity_date, pawns.expiry_date, pawns.interest, pawns.pawn_amount, pawns.pawn_total_amount, pawns.account_id, pawns.item_id, pawns.created,
              accounts.account_id, accounts.firstname, accounts.lastname, accounts.contact_number, accounts.birthday, accounts.valid_id, accounts.valid_id_number, accounts.address, accounts.created
       FROM redemptions
       LEFT JOIN pawns ON pawns.pawn_id = redemptions.pawn_id
       LEFT JOIN accounts ON accounts.account_id = pawns.account_id
       LEFT JOIN items ON items.item_id = pawns.item_id`,
      [],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        res.status(200);
        res.json({ success: true, redemptions: data });
        return;
      }
    );
  },
  new: (req, res) => {
    redemption.redemption_date = req.body.redemption_date || null;
    redemption.pawn_id = req.body.pawn_id || 0;
    redemption.redemption_amount = req.body.redemption_amount || 0;
    redemption.redemption_total_amount = req.body.redemption_total_amount || 0;
    redemption.interest = req.body.interest || 0;
    redemption.difference = req.body.difference || 0;
    redemption.remarks = req.body.remarks || '';
    redemption.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    console.log(redemption);

    dac.query(
      `INSERT INTO redemptions (redemption_date, pawn_id, redemption_amount, redemption_total_amount, interest, difference, remarks, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        redemption.redemption_date,
        redemption.pawn_id,
        redemption.redemption_amount,
        redemption.redemption_total_amount,
        redemption.interest,
        redemption.difference,
        redemption.remarks,
        redemption.created
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated redemptions
        redemptions.list(req, res);
      }
    );
  },
  update: (req, res) => {
    redemption.redemption_id = req.params.id || 0;
    redemption.redemption_date = req.body.redemption_date || null;
    redemption.pawn_id = req.body.pawn_id || 0;
    redemption.redemption_amount = req.body.redemption_amount || 0;
    redemption.redemption_total_amount = req.body.redemption_total_amount || 0;
    redemption.interest = req.body.interest || 0;
    redemption.difference = req.body.difference || 0;
    redemption.remarks = req.body.remarks || '';
    redemption.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(`UPDATE redemptions SET redemption_date = ?, pawn_id = ?, redemption_amount = ?, redemption_total_amount = ?, interest = ?, difference = ?, remarks = ?, modified  = ? 
       WHERE redemption_id`,
      [
        redemption.redemption_date,
        redemption.pawn_id,
        redemption.redemption_amount,
        redemption.redemption_total_amount,
        redemption.interest,
        redemption.difference,
        redemption.remarks,
        redemption.modified,
        redemption.redemption_id
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated redemptions
        redemptions.list(req, res);
      }
    );
  },
  delete: (req, res) => {
    redemptions.redemption_id = req.params.id || 0;

    dac.query(`DELETE FROM redemptions WHERE redemption_id = ?`,
      [redemptions.redemption_id],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        //get updated redemptions
        redemptions.list(req, res);
      }
    );
  }
};

module.exports = redemptions;
