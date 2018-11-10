var dac = require("../db/dac");
var account = require("../models/account");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();
router = express.Router();

var dashboard = {
  getDashboardReports: (req, res) => {
    dac.query(`SELECT COUNT(pawn_id) AS totalPawnedItems, 
                (SELECT COUNT(renewal_id) AS count FROM renewals) AS totalRenewedItems,
                (SELECT COUNT(item_id) AS count FROM items) AS totalItems,
                (SELECT COUNT(account_id) AS count FROM accounts) AS totalAccounts
               FROM pawns`, [], function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({ success: true, 
          totalAccounts: data[0].totalAccounts, 
          totalItems: data[0].totalItems,
          totalPawnedItems: data[0].totalPawnedItems, 
          totalRenewedItems: data[0].totalRenewedItems 
        });
        return;
      }
    );
  }
};

module.exports = dashboard;
