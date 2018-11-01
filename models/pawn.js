var account = require("./account");
var item = require("./item");

var pawn = (
  pawn_id,
  pawn_ticket_number,
  pawn_date_granted,
  pawn_maturity_date,
  pawn_expiry_date,
  pawn_interest,
  pawn_amount,
  pawn_total_amount,
  pawn_item_id,
  pawn_account_id,
  account,
  item,
  created,
  modified
) => {
  this.pawn_id = pawn_id || '';
  this.pawn_ticket_number = pawn_ticket_number || '';
  this.pawn_date_granted = pawn_date_granted || '';
  this.pawn_maturity_date = pawn_maturity_date || '';
  this.pawn_expiry_date = pawn_expiry_date || '';
  this.pawn_interest = pawn_interest || '';
  this.pawn_amount = pawn_amount || '';
  this.pawn_total_amount = pawn_total_amount || '';

  this.pawn_item_id = pawn_item_id || '';
  this.pawn_account_id = pawn_account_id || '';
  this.account = account || null;
  this.item = item || null;
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = pawn;


