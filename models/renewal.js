var account = require("./account");
var item = require("./item");
var pawn = require("./pawn");

var renewal = (
  renewal_id,
  renewal_date,
  renewal_pawn_ticket,
  pawn_id,
  renewal_amount,
  renewal_total_amount,
  item_id,
  account_id,
  remarks,
  created,
  modified
) => {
  this.renewal_id = renewal_id || '';
  this.renewal_date = renewal_date || '';
  this.renewal_pawn_ticket = renewal_pawn_ticket || '';
  this.pawn_id = pawn_id || '';
  this.renewal_amount = renewal_amount || '';
  this.renewal_total_amount = renewal_total_amount || '';
  this.item_id = item_id || '';
  this.account_id = account_id || '';
  this.remarks = remarks || '';
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = renewal;
