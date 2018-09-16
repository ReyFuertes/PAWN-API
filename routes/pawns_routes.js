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
  list: (req, res) => {
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
  new: (req, res) => {
    pawn.pawn_ticket_number = req.body.pawn_ticket_number || '';
    pawn.date_loan_granted = req.body.date_loan_granted || '';
    pawn.maturity_date = req.body.maturity_date || '';
    pawn.expiry_date = req.body.expiry_date || '';
    pawn.interest = req.body.interest || '';
    pawn.pawn_amount = req.body.pawn_amount || '';
    pawn.pawn_total_amount = req.body.pawn_total_amount || '';
    pawn.account_id = req.body.account_id || '';
    pawn.item_id = req.body.item_id || '';
    pawn.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(`INSERT INTO pawns (pawn_ticket_number, date_loan_granted, maturity_date, expiry_date, 
                                  interest, pawn_amount, pawn_total_amount, account_id, item_id, created) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        pawn.created
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
