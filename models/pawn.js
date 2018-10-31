
var pawn = (
  pawn_ticket_number,
  pawn_date_granted,
  pawn_maturity_date,
  pawn_expiry_date,
  pawn_interest,
  pawn_amount,
  pawn_total_amount,
  created,
  modified
) => {
  this.pawn_id = pawn_id || '';
  this.pawn_ticket_number = pawn_ticket_number || '';
  this.pawn_date_granted = pawn_date_granted || '';
  this.pawn_maturity_date = pawn_maturity_date || '';
  this.pawn_expiry_date = pawn_expiry_date || '';
  this.birth_date = birth_date || '';
  this.pawn_interest = pawn_interest || '';
  this.pawn_amount = pawn_amount || '';
  this.pawn_total_amount = pawn_total_amount || '';
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = pawn;


