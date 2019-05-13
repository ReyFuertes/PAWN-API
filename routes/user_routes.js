var dac = require("../db/dac");
var express = require("express");
var user = require("../models/user");
var messages = require("../config/resMsg");
router = express.Router();

var user = {
  login: (req, res) => {
    user.email = req.body.email || "";
    user.password = req.body.password || "";
    user.token = req.body.token || "";
    user.branch = req.body.branch || "";
    console.log(user);
    dac.query(`SELECT email, users.token, branch
              FROM users
              INNER JOIN branches ON name = users.branch
              WHERE email = ? AND password = ? AND branch = ?`,
      [user.email, user.password, user.branch],
      function(err, data) {
    
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({ success: true, status: data.length !== 0 ? true: false,  user: data[0] });
        return;
      }
    );
  },
  branches: (req, res) => {
    dac.query(`SELECT name FROM branches`,
      [],
      function(err, data) {
        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({ success: true, branches: data });
        return;
      }
    );
  },
};

module.exports = user;
