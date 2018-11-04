var dac = require("../db/dac");
var renewal = require("../models/renewal");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();
var helpers = require('../config/helpersFn');
router = express.Router();

var renewals = {
  search: (req, res) => {
    dac.query(`SELECT (SELECT COUNT(renewal_id) FROM renewals) AS count, 
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
                WHERE 
                  pawn_ticket_number LIKE ? OR
                  firstname LIKE ? OR
                  lastname LIKE ? OR
                  item_name LIKE ? OR
                  remarks LIKE ?
                ORDER BY renewals.created DESC `,
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
 
    dac.query(`SELECT (SELECT COUNT(renewal_id) FROM renewals) AS count, 
                renewals.renewal_id AS id, 
                renewals.renewal_date AS renewalDate, 
                renewals.renewal_pawn_ticket AS renewalPawnTicket, 
                renewals.new_pawn_number AS newPawnNumber, 
                renewals.renewal_amount AS renewalAmount, 
                renewals.renewal_total_amount AS renewalTotalAmount, 
                renewals.interest, 
                renewals.difference, 
                renewals.remarks, 
                renewals.created, 
                renewals.modified,
                renewals.pawn_id AS renewalPawnId,

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

              FROM renewals
              
              LEFT JOIN pawns ON pawns.pawn_id = renewals.pawn_id
              LEFT JOIN accounts ON accounts.account_id = pawns.account_id
              LEFT JOIN items ON items.item_id = pawns.item_id
              WHERE renewal_id = ?
              `,
      [param[0].value],
      function(err, data) {
    
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        _renewal = {};
        data.forEach(i => {
          _renewal = {
            id: i.id,
            renewalDate: i.renewalDate,
            renewalPawnTicket: i.renewalPawnTicket,
            newPawnNumber: req.body.newPawnNumber,
            pawnMaturityDate: i.pawnMaturityDate,
            renewalAmount: i.renewalAmount,
            renewalTotalAmount: i.renewalTotalAmount,
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
        console.log(_renewal);
        res.status(200);
        res.json({ success: true, renewal: _renewal });
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
      `SELECT (SELECT COUNT(renewal_id) FROM renewals) AS count, 
        renewals.renewal_id AS id, 
        renewals.renewal_date AS renewalDate, 
        renewals.renewal_pawn_ticket AS renewalPawnTicket, 
        renewals.new_pawn_number AS newPawnNumber,
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
      ORDER BY renewals.created DESC 
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
    renewal.renewal_date = req.body.renewalDate || '';
    renewal.renewal_pawn_ticket = req.body.renewalPawnTicket || '';
    renewal.new_pawn_number  = req.body.newPawnNumber || '';
    renewal.renewal_amount = req.body.renewalAmount || '';
    renewal.renewal_total_amount = req.body.renewalTotalAmount || '';
    renewal.interest = req.body.interest || '';
    renewal.difference = req.body.difference || '';
    renewal.remarks = req.body.remarks || '';
    renewal.pawn_id = req.body.pawnId || '';
    renewal.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || "";
   
    dac.query(
      `INSERT INTO renewals (renewal_date, renewal_pawn_ticket, new_pawn_number, renewal_amount, renewal_total_amount, interest, difference, remarks, pawn_id, created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        renewal.renewal_date,
        renewal.renewal_pawn_ticket,
        renewal.new_pawn_number,
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
    renewal.renewal_date = req.body.renewalDate || '';
    renewal.renewal_pawn_ticket = req.body.renewalPawnTicket || '';
    renewal.new_pawn_number  = req.body.newPawnNumber || '';
    renewal.renewal_amount = req.body.renewalAmount || '';
    renewal.renewal_total_amount = req.body.renewalTotalAmount || '';
    renewal.interest = req.body.interest || '';
    renewal.difference = req.body.difference || '';
    renewal.remarks = req.body.remarks || '';
    renewal.pawn_id = req.body.pawnId || '';
    renewal.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(
      `UPDATE renewals 
        SET renewal_date = ?, renewal_pawn_ticket = ?, new_pawn_number = ?, renewal_amount = ?, renewal_total_amount = ?, interest = ?, difference = ?, remarks = ?, modified = ?, pawn_id = ?
       WHERE renewal_id = ?`,
      [
        renewal.renewal_date,
        renewal.renewal_pawn_ticket,
        renewal.new_pawn_number,
        renewal.renewal_amount,
        renewal.renewal_total_amount,
        renewal.interest,
        renewal.difference,
        renewal.remarks,
        renewal.modified,
        renewal.pawn_id,
        renewal.renewal_id
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
