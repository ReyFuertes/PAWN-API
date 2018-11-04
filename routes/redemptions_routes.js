var dac = require("../db/dac");
var redemption = require("../models/redemption");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();
var helpers = require('../config/helpersFn');
router = express.Router();

var redemptions = {
  search: (req, res) => {
    dac.query(`SELECT (SELECT COUNT(redemption_id) FROM redemptions) AS count, 
                  redemptions.redemption_id AS id, 
                  redemptions.redemption_date AS redemptionDate, 
                  redemptions.redemption_pawn_ticket AS redemptionPawnTicket, 
                  redemptions.redemption_amount AS redemptionAmount, 
                  redemptions.redemption_total_amount AS redemptionTotalAmount, 
                  redemptions.interest, 
                  redemptions.difference, 
                  redemptions.remarks, 
                  redemptions.created, 
                  redemptions.modified,
                  redemptions.pawn_id AS pawnId,

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

                FROM redemptions
                
                LEFT JOIN pawns ON pawns.pawn_id = redemptions.pawn_id
                LEFT JOIN accounts ON accounts.account_id = pawns.account_id
                LEFT JOIN items ON items.item_id = pawns.item_id
                WHERE 
                  pawn_ticket_number LIKE ? OR
                  firstname LIKE ? OR
                  lastname LIKE ? OR
                  item_name LIKE ? OR
                  remarks LIKE ?
                ORDER BY redemptions.created DESC `,
            [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`], 
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
  edit: (req, res) => {
    var param = helpers.getParams(req);
 
    dac.query(`SELECT (SELECT COUNT(redemption_id) FROM redemptions) AS count, 
                redemptions.redemption_id AS id, 
                redemptions.redemption_date AS redemptionDate, 
                redemptions.redemption_pawn_ticket AS redemptionPawnTicket, 
                redemptions.redemption_amount AS redemptionAmount, 
                redemptions.redemption_total_amount AS redemptionTotalAmount, 
                redemptions.interest, 
                redemptions.difference, 
                redemptions.remarks, 
                redemptions.created, 
                redemptions.modified,
                redemptions.pawn_id AS redemptionPawnId,

                accounts.account_id AS accountId, 
                accounts.id_number AS idNumber,
                accounts.firstname AS firstName,
                accounts.lastname AS lastName,
                CONCAT(accounts.firstname, ',', accounts.lastname) AS fullname, 
                accounts.contact_number AS contactNumber, 
                accounts.birthday AS birthDate, 
                accounts.valid_id AS validId, 
                accounts.valid_id_number AS validIdNumber, 
                accounts.address,

                pawns.pawn_id AS pawnId,
                pawns.pawn_ticket_number AS pawnTicketNumber, 
                pawns.pawn_date_granted AS pawnDateGranted, 
                pawns.pawn_maturity_date AS pawnMaturityDate, 
                pawns.pawn_expiry_date AS pawnExpiryDate, 
                pawns.pawn_interest AS pawnInterest, 
                pawns.pawn_amount AS pawnAmount, 
                pawns.pawn_total_amount AS pawnTotalAmount, 

                items.item_id AS itemId, 
                items.sku AS sku,
                items.item_name AS itemName, 
                items.item_type AS itemType, 
                items.grams, 
                items.karat, 
                items.description

              FROM redemptions
              
              LEFT JOIN pawns ON pawns.pawn_id = redemptions.pawn_id
              LEFT JOIN accounts ON accounts.account_id = pawns.account_id
              LEFT JOIN items ON items.item_id = pawns.item_id
              WHERE redemption_id = ?
              `,
      [param[0].value],
      function(err, data) {
    
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        _redemption = {};
        data.forEach(i => {
          _redemption = {
            id: i.id,
            redemptionDate: i.redemptionDate,
            redemptionPawnTicket: i.redemptionPawnTicket,
            pawnMaturityDate: i.pawnMaturityDate,
            redemptionAmount: i.redemptionAmount,
            redemptionTotalAmount: i.redemptionTotalAmount,
            interest: i.interest,
            difference: i.difference,
            remarks: i.remarks,
            created: i.created,
            pawnId: i.pawnId,
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
              sku: i.sku,
              itemName: i.itemName, 
              itemType: i.itemType, 
              grams: i.grams, 
              karat: i.karat, 
              description: i.description, 
            },
            pawn: {
              id: i.pawnId,
              pawnTicketNumber: i.pawnTicketNumber,
              pawnDateGranted: i.pawnDateGranted, 
              pawnMaturityDate: i.pawnMaturityDate, 
              pawnExpiryDate: i.pawnExpiryDate, 
              pawnInterest: i.pawnInterest, 
              pawnAmount: i.pawnAmount, 
              pawnTotalAmount: i.pawnTotalAmount, 
            }
          }
        });
        console.log(_redemption);
        res.status(200);
        res.json({ success: true, redemption: _redemption });
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
      `SELECT (SELECT COUNT(redemption_id) FROM redemptions) AS count, 
        redemptions.redemption_id AS id, 
        redemptions.redemption_date AS redemptionDate, 
        redemptions.redemption_pawn_ticket AS redemptionPawnTicket, 
        redemptions.redemption_amount AS redemptionAmount, 
        redemptions.redemption_total_amount AS redemptionTotalAmount, 
        redemptions.interest, 
        redemptions.difference, 
        redemptions.remarks, 
        redemptions.created, 
        redemptions.modified,
        redemptions.pawn_id AS pawnId,

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

       FROM redemptions
       
      LEFT JOIN pawns ON pawns.pawn_id = redemptions.pawn_id
      LEFT JOIN accounts ON accounts.account_id = pawns.account_id
      LEFT JOIN items ON items.item_id = pawns.item_id
      ORDER BY redemptions.created DESC 
      ${queryString}`, 
       [], function(err, data) {
        console.log(err);
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
        res.json({ success: true, totalCount: totalCount, redemptions: data });
        return;
      }
    );
  },
  new: (req, res) => {
    redemption.redemption_date = req.body.redemptionDate || '';
    redemption.redemption_pawn_ticket = req.body.redemptionPawnTicket || '';
    redemption.redemption_amount = req.body.redemptionAmount || '';
    redemption.redemption_total_amount = req.body.redemptionTotalAmount || '';
    redemption.interest = req.body.interest || '';
    redemption.difference = req.body.difference || '';
    redemption.remarks = req.body.remarks || '';
    redemption.pawn_id = req.body.pawnId || '';
    redemption.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || "";

    dac.query(
      `INSERT INTO redemptions (redemption_date, redemption_pawn_ticket, redemption_amount, redemption_total_amount, interest, difference, remarks, pawn_id, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        redemption.redemption_date,
        redemption.redemption_pawn_ticket,
        redemption.redemption_amount,
        redemption.redemption_total_amount,
        redemption.interest,
        redemption.difference,
        redemption.remarks,
        redemption.pawn_id,
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
    redemption.redemption_date = req.body.redemptionDate || '';
    redemption.redemption_pawn_ticket = req.body.redemptionPawnTicket || '';
    redemption.redemption_amount = req.body.redemptionAmount || '';
    redemption.redemption_total_amount = req.body.redemptionTotalAmount || '';
    redemption.interest = req.body.interest || '';
    redemption.difference = req.body.difference || '';
    redemption.remarks = req.body.remarks || '';
    redemption.pawn_id = req.body.pawnId || '';
    redemption.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(
      `UPDATE redemptions 
        SET redemption_date = ?, redemption_pawn_ticket = ?, redemption_amount = ?, redemption_total_amount = ?, interest = ?, difference = ?, remarks = ?, modified = ?, pawn_id = ?
       WHERE redemption_id = ?`,
      [
        redemption.redemption_date,
        redemption.redemption_pawn_ticket,
        redemption.redemption_amount,
        redemption.redemption_total_amount,
        redemption.interest,
        redemption.difference,
        redemption.remarks,
        redemption.modified,
        redemption.pawn_id,
        redemption.redemption_id
      ],
      function(err, data) {
        //catch error
        console.log(err);
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

    dac.query(
      `DELETE FROM redemptions WHERE redemption_id = ?`,
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
