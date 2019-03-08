var dac = require("../db/dac");
var pawn = require("../models/pawn");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();
var helpers = require('../config/helpersFn');

router = express.Router();

var pawns = {
  print: (req, res) => {
    var params = req.query;
    dac.query(`SELECT
                  pawns.pawn_id AS id, 
                  pawns.pawn_ticket_number AS pawnTicketNumber, 
                  pawns.pawn_date_granted AS pawnDateGranted, 
                  pawns.pawn_maturity_date AS pawnMaturityDate, 
                  pawns.pawn_expiry_date AS pawnExpiryDate, 
                  pawns.auction_date AS auctionDate, 
                  pawns.pawn_interest AS pawnInterest, 
                  pawns.pawn_amount AS pawnAmount, 
                  pawns.pawn_total_amount AS pawnTotalAmount, 
                  DATE_FORMAT(pawns.created, '%m/%e/%Y') AS created,
                  items.item_name AS itemName, 
                  items.item_type AS itemType, 
                  items.grams, 
                  items.karat, 
                  items.description, 
                  items.modified,
                  accounts.firstname AS firstName, 
                  accounts.lastname AS lastName, 
                  CONCAT(firstname, ',', lastname) AS fullname,
                  accounts.contact_number AS contactNumber, 
                  accounts.birthday AS birthDate, 
                  accounts.address, 
                  accounts.valid_id AS validId, 
                  accounts.valid_id_number AS validIdNumber
              FROM pawns
              LEFT JOIN items ON pawns.item_id = items.item_id
              LEFT JOIN accounts ON pawns.account_id = accounts.account_id
              WHERE pawns.created BETWEEN '${dateFormat(params.from, 'yyyy-mm-dd')}' AND '${dateFormat(params.to, 'yyyy-mm-dd')}'
              ORDER BY pawns.created DESC `,
      [],
      function(err, data) {
        if (err) {
          console.log(err);
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({ success: true, pawns: data });
        return;
      }
    );
  },
  edit: (req, res) => {
    var param = helpers.getParams(req);
  
    dac.query(`SELECT
          pawns.pawn_id AS id, 
          pawns.pawn_ticket_number AS pawnTicketNumber, 
          pawns.pawn_date_granted AS pawnDateGranted, 
          pawns.pawn_maturity_date AS pawnMaturityDate, 
          pawns.pawn_expiry_date AS pawnExpiryDate, 
          pawns.auction_date AS auctionDate, 
          pawns.pawn_interest AS pawnInterest, 
          pawns.pawn_amount AS pawnAmount, 
          pawns.pawn_total_amount AS pawnTotalAmount, 
          DATE_FORMAT(pawns.created, '%m/%e/%Y') AS created,
          items.item_id AS itemId,
          items.item_name AS itemName, 
          items.item_type AS itemType, 
          items.grams, 
          items.karat, 
          items.description,
          accounts.account_id AS accountId,
          accounts.firstname AS firstName, 
          accounts.lastname AS lastName, 
          CONCAT(firstname, ',', lastname) AS fullname,
          accounts.contact_number AS contactNumber, 
          accounts.birthday AS birthDate, 
          accounts.address, 
          accounts.valid_id AS validId, 
          accounts.valid_id_number AS validIdNumber
      FROM pawns
        LEFT JOIN items ON pawns.item_id = items.item_id
        LEFT JOIN accounts ON pawns.account_id = accounts.account_id
      WHERE pawn_id = ?`,
      [param[0].value],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        item = {};
        data.forEach(i => {
          item = {
            id: i.id,
            pawnTicketNumber: i.pawnTicketNumber,
            pawnDateGranted: i.pawnDateGranted,
            pawnMaturityDate: i.pawnMaturityDate,
            pawnExpiryDate: i.pawnExpiryDate,
            auctionDate: i.auctionDate,
            pawnInterest: i.pawnInterest,
            pawnAmount: i.pawnAmount,
            pawnTotalAmount: i.pawnTotalAmount,
            account: {
              id: i.accountId,
              firstName: i.firstName, 
              lastName: i.lastName, 
              contactNumber: i.contactNumber, 
              birthDate: i.birthDate, 
              address: i.address, 
              validId: i.validId, 
              validIdNumber: i.validIdNumber
            },
            item: {
              id: i.itemId,
              itemName: i.itemName, 
              itemType: i.itemType, 
              grams: i.grams, 
              karat: i.karat, 
              description: i.description, 
            }
          }
        });

        res.status(200);
        res.json({ success: true, pawn: item });
        return;
      }
    );
  },
  search: (req, res) => {
    var searchTerm = req.query.term;
    dac.query(`SELECT (SELECT COUNT(pawn_id) FROM pawns) AS count, 
                  pawns.pawn_id AS id, 
                  pawns.pawn_ticket_number AS pawnTicketNumber, 
                  pawns.pawn_date_granted AS pawnDateGranted, 
                  pawns.pawn_maturity_date AS pawnMaturityDate, 
                  pawns.pawn_expiry_date AS pawnExpiryDate, 
                  pawns.auction_date AS auctionDate, 
                  pawns.pawn_interest AS pawnInterest, 
                  pawns.pawn_amount AS pawnAmount, 
                  pawns.pawn_total_amount AS pawnTotalAmount, 
                  DATE_FORMAT(pawns.created, '%m/%e/%Y') AS created,
                  items.item_name AS itemName, 
                  items.item_type AS itemType, 
                  items.grams, 
                  items.karat, 
                  items.description, 
                  items.modified,
                  accounts.firstname AS firstName, 
                  accounts.lastname AS lastName, 
                  CONCAT(firstname, ',', lastname) AS fullname,
                  accounts.contact_number AS contactNumber, 
                  accounts.birthday AS birthDate, 
                  accounts.address, 
                  accounts.valid_id AS validId, 
                  accounts.valid_id_number AS validIdNumber
              FROM pawns
                LEFT JOIN items ON pawns.item_id = items.item_id
                LEFT JOIN accounts ON pawns.account_id = accounts.account_id
                WHERE 
                  pawn_ticket_number LIKE ? OR
                  firstname LIKE ? OR
                  lastname LIKE ? OR
                  item_name LIKE ? OR
                  pawn_date_granted LIKE ?
                ORDER BY pawn_id DESC`, 
             [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,
              `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`], function(err, data) {
        
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
        res.json({ success: true, totalCount: totalCount, pawns: data });
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
      `SELECT (SELECT COUNT(pawn_id) AS count FROM pawns) AS count, 
          pawns.pawn_id AS id, 
          pawns.pawn_ticket_number AS pawnTicketNumber, 
          pawns.pawn_date_granted AS pawnDateGranted, 
          pawns.pawn_maturity_date AS pawnMaturityDate, 
          pawns.pawn_expiry_date AS pawnExpiryDate, 
          pawns.auction_date AS auctionDate, 
          pawns.pawn_interest AS pawnInterest, 
          pawns.pawn_amount AS pawnAmount, 
          pawns.pawn_total_amount AS pawnTotalAmount, 
          DATE_FORMAT(pawns.created, '%m/%e/%Y') AS created,
          items.item_name AS itemName, 
          items.item_type AS itemType, 
          items.grams, 
          items.karat, 
          items.description, 
          items.modified,
          accounts.firstname AS firstName, 
          accounts.lastname AS lastName, 
          CONCAT(firstname, ',', lastname) AS fullname,
          accounts.contact_number AS contactNumber, 
          accounts.birthday AS birthDate, 
          accounts.address, 
          accounts.valid_id AS validId, 
          accounts.valid_id_number AS validIdNumber
       FROM pawns
        LEFT JOIN items ON pawns.item_id = items.item_id
        LEFT JOIN accounts ON pawns.account_id = accounts.account_id
      ORDER BY pawns.created DESC 
       ${queryString}`,
      [],
      function(err, data) {
        var totalCount = 0;
        if(data.length > 0) {
          totalCount = data[0].count;
          data.forEach(row => {
            delete row.count;
          });
        }

        res.status(200);
        res.json({ success: true, totalCount: totalCount, pawns: data });
        return;
      }
    );
  },
  new: (req, res) => {
    pawn.pawn_ticket_number = req.body.pawnTicketNumber || "";
    pawn.pawn_date_granted = dateFormat(req.body.date_pawn_granted, "mm/dd/yyyy") || "";
    pawn.pawn_maturity_date = dateFormat(req.body.pawnMaturityDate, "mm/dd/yyyy") || "";
    pawn.pawn_expiry_date = dateFormat(req.body.pawnExpiryDate, "mm/dd/yyyy") || "";
    pawn.auction_date = dateFormat(req.body.auctionDate, "mm/dd/yyyy") || "";
    pawn.pawn_interest = req.body.pawnInterest || "";
    pawn.pawn_amount = req.body.pawnAmount || "";
    pawn.pawn_total_amount = req.body.pawnTotalAmount || "";
    pawn.item_id = req.body.item.id;
    pawn.account_id = req.body.account.id;
    pawn.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;
    
    dac.query(
      `INSERT INTO pawns (pawn_ticket_number, pawn_date_granted, pawn_maturity_date, pawn_expiry_date, auction_date,
                pawn_interest, pawn_amount, pawn_total_amount, account_id, item_id, created) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pawn.pawn_ticket_number,
        pawn.pawn_date_granted,
        pawn.pawn_maturity_date,
        pawn.pawn_expiry_date,
        pawn.auction_date,
        pawn.pawn_interest,
        pawn.pawn_amount,
        pawn.pawn_total_amount,
        pawn.account_id,
        pawn.item_id,
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
    pawn.pawn_id = req.params.id || 0;
    pawn.pawn_ticket_number = req.body.pawnTicketNumber || "";
    pawn.pawn_date_granted = dateFormat(req.body.date_pawn_granted, "mm/dd/yyyy") || "";
    pawn.pawn_maturity_date = dateFormat(req.body.pawnMaturityDate, "mm/dd/yyyy") || "";
    pawn.pawn_expiry_date = dateFormat(req.body.pawnExpiryDate, "mm/dd/yyyy") || "";
    pawn.auction_date = dateFormat(req.body.auctionDate, "mm/dd/yyyy") || "";
    pawn.pawn_interest = req.body.pawnInterest || "";
    pawn.pawn_amount = req.body.pawnAmount || "";
    pawn.pawn_total_amount = req.body.pawnTotalAmount || "";
    pawn.item_id = req.body.item.id;
    pawn.account_id = req.body.account.id;
    pawn.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;
    
    dac.query(
      `UPDATE pawns 
        SET pawn_ticket_number = ?, pawn_date_granted = ?, pawn_maturity_date = ?, pawn_expiry_date = ?, auction_date = ?,
            pawn_interest = ?, pawn_amount = ?, pawn_total_amount = ?, account_id = ?, item_id = ?, modified = ? 
        WHERE pawn_id = ?`,
      [
        pawn.pawn_ticket_number,
        pawn.pawn_date_granted,
        pawn.pawn_maturity_date,
        pawn.pawn_expiry_date,
        pawn.auction_date,
        pawn.pawn_interest,
        pawn.pawn_amount,
        pawn.pawn_total_amount,
        pawn.account_id,
        pawn.item_id,
        pawn.modified,
        pawn.pawn_id
      ],
      function(err, data) {
        //catch error
        console.log(err);
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

    dac.query(`DELETE FROM pawns WHERE pawn_id = ?`, [pawns.pawn_id], function(
      err,
      data
    ) {
      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      //get updated pawns
      pawns.list(req, res);
    });
  }
};

module.exports = pawns;
