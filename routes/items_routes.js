var dac = require("../db/dac");
var item = require("../models/item");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();

router = express.Router();

var items = {
  list: (req, res) => {
    dac.query(
      `SELECT item_id, item_name, item_type, grams, karat, description, created, modified FROM items`,
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
    item.item_name = req.body.item_name || '';
    item.item_type = req.body.item_type || '';
    item.grams = req.body.grams || '';
    item.karat = req.body.karat || '';
    item.description = req.body.description || '';
    item.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(`INSERT INTO items (item_name, item_type, grams, karat, description, created) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        item.item_name,
        item.item_type,
        item.grams,
        item.karat,
        item.description,
        item.created
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        
        //get updated items
        items.list(req, res);
      }
    );
  },
  update: (req, res) => {
    item.item_id = req.params.id || 0;
    item.item_name = req.body.item_name || '';
    item.item_type = req.body.item_type || '';
    item.grams = parseInt(req.body.grams) || 0;
    item.karat = parseInt(req.body.karat) || 0;
    item.description = req.body.description || '';
    item.modified = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    dac.query(
      `UPDATE items SET item_name = ?, item_type = ?, grams = ?, karat = ?, description = ?, modified = ? 
            WHERE item_id = ?`,
      [
        item.item_name,
        item.item_type,
        item.grams,
        item.karat,
        item.description,
        item.modified,
        item.item_id
      ],
      function(err, data) {
        //catch error
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        //get updated items
        items.list(req, res);
      }
    );
  },
  delete: (req, res) => {
    item.item_id = req.params.id || 0;

    dac.query(
      `DELETE FROM items WHERE item_id = ?`,
      [item.item_id],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }
        //get updated items
        items.list(req, res);
      }
    );
  }
};

module.exports = items;
