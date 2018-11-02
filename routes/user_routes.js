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

    dac.query(`SELECT email, token
              FROM users 
              WHERE email = ? AND password = ? AND token = ?`,
      [user.email, user.password, user.token],
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
  }
};

module.exports = user;
