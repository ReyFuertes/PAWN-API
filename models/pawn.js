var account = require("./account");
var item = require("./item");

var pawn = (
  pawn_id,
  pawn_ticket_number,
  date_loan_granted,
  maturity_date,
  expiry_date,
  interest,
  pawn_amount,
  pawn_total_amount,
  account,
  item,
  created,
  modified
) => {
  this.pawn_id = pawn_id || '';
  this.pawn_ticket_number = pawn_ticket_number || '';
  this.date_loan_granted = date_loan_granted || '';
  this.maturity_date = maturity_date || '';
  this.expiry_date = expiry_date || '';
  this.interest = interest || '';
  this.pawn_amount = pawn_amount || '';
  this.pawn_total_amount = pawn_total_amount || '';
  this.account = account || null;
  this.item = item;
  this.created = created;
  this.modified = modified;
};

module.exports = pawn;
