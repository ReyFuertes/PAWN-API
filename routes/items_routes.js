var dac = require("../db/dac");
var item = require("../models/item");
var messages = require("../config/resMsg");
var express = require("express");
var dateFormat = require("dateformat");
var now = new Date();
var helpers = require('../config/helpersFn');

router = express.Router();

var items = {
  print: (req, res) => {
    var params = req.query;
    dac.query(`SELECT
                  item_id AS id, 
                  sku AS sku,
                  item_name AS itemName, 
                  item_type AS itemType, 
                  grams, 
                  karat, 
                  description, 
                  DATE_FORMAT(created, '%m/%e/%Y') AS created, 
                  modified 
                FROM items
              WHERE created BETWEEN '${dateFormat(params.from, 'yyyy-mm-dd')}' AND '${dateFormat(params.to, 'yyyy-mm-dd')}'
              ORDER by item_id DESC `,
      [],
      function (err, data) {
        if (err) {
          console.log(err);
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({
          success: true,
          items: data
        });
        return;
      }
    );
  },
  getOne: (req, res) => {
    var id = req.query.id;
    dac.query(`SELECT item_id AS id, 
                sku,
                item_name AS itemName, 
                item_type AS itemType, 
                grams, 
                karat, 
                description, 
                created, 
                modified 
              FROM items 
              WHERE item_id = ?`,
      [id],
      function (err, data) {

        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({
          success: true,
          item: data[0]
        });
        return;
      }
    );
  },
  getTypes: (req, res) => {
    dac.query(`SELECT id, name, description FROM item_types`, [],
      function (err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({
          success: true,
          types: data
        });
        return;
      }
    );
  },
  search: (req, res) => {
    var searchTerm = req.query.term;
    dac.query(`SELECT (SELECT COUNT(item_id) FROM items) AS count, 
                  item_id AS id, 
                  sku,
                  item_name AS itemName, 
                  item_type AS itemType, 
                  grams, 
                  karat, 
                  description, 
                  created, 
                  modified 
                FROM items 
                WHERE 
                  sku LIKE ? OR
                  item_name LIKE ? OR
                  item_type LIKE ? OR
                  grams LIKE ? OR
                  karat LIKE ? OR
                  description LIKE ?
                ORDER BY item_id DESC`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,
        `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`
      ],
      function (err, data) {

        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({
          success: true,
          items: data
        });
        return;
      }
    );
  },
  edit: (req, res) => {
    var param = helpers.getParams(req);

    dac.query(
      `SELECT sku, item_id AS id, item_name AS itemName, item_type AS itemType, grams, karat, description, created, branch_id, none_jewelry, birth_stone_details, titus_details
              FROM items 
              WHERE item_id = ?
              `,
      [param[0].value],
      function (err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({
          success: true,
          item: data[0]
        });
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
        var obj = {
          key: item.split("=")[0],
          value: item.split("=")[1]
        };
        param.push(obj);
      });

      queryString =
        param[0].value && param[1].value ?
        ` LIMIT ${param[0].value} offset ${param[1].value}` :
        "LIMIT 10 offset 0";
    }

    dac.query(`SELECT (SELECT COUNT(item_id) FROM items) AS count, 
                  item_id AS id, 
                  sku AS sku,
                  item_name AS itemName, 
                  item_type AS itemType, 
                  grams, 
                  karat, 
                  description, 
                  branches.name AS branch_name,
                  none_jewelry, 
                  birth_stone_details, 
                  titus_details,
                  DATE_FORMAT(created, '%m/%e/%Y') AS created, 
                  DATE_FORMAT(modified, '%m/%e/%Y') AS modified  
                FROM items
                INNER JOIN branches ON branches.id = items.branch_id
                ORDER by item_id DESC 
                ${queryString}`,
      [],
      function (err, data) {

        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        var totalCount = 0;
        if (data.length > 0) {
          totalCount = data[0].count;
          data.forEach(row => {
            delete row.count;
          });
        }


        res.status(200);
        res.json({
          success: true,
          totalCount: totalCount,
          items: data
        });
        return;
      }
    );
  },
  new: (req, res) => {
    item.sku = req.body.sku || "";
    item.item_name = req.body.itemName || "";
    item.item_type = req.body.itemType || "";
    item.grams = req.body.grams || "";
    item.karat = req.body.karat || "";
    item.description = req.body.description || "";
    item.created = dateFormat(now, "yyyy-mm-dd hh:mm:ss") || null;

    item.branch_id = req.body.branch_id || "";
    item.none_jewelry = req.body.noneJewelry || "";
    item.birth_stone_details = req.body.birthStoneDetails || "";
    item.titus_details = req.body.titusDetails || "";

    dac.query(
      `INSERT INTO items (sku, item_name, item_type, grams, karat, description, created, branch_id, none_jewelry, birth_stone_details, titus_details) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.sku,
        item.item_name,
        item.item_type,
        item.grams,
        item.karat,
        item.description,
        item.created,
        item.branch_id,
        item.none_jewelry,
        item.birth_stone_details,
        item.titus_details
      ],
      function (err, data) {
        console.log(err);
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
    item.item_name = req.body.item_name || "";
    item.item_type = req.body.item_type || "";
    item.grams = parseInt(req.body.grams) || 0;
    item.karat = parseInt(req.body.karat) || 0;
    item.description = req.body.description || "";
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
      function (err, data) {
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

    dac.query(`DELETE FROM items WHERE item_id = ?`, [item.item_id], function (
      err,
      data
    ) {
      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      //get updated items
      items.list(req, res);
    });
  }
};

module.exports = items;