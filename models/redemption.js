var redemption = (
  redemption_id,
  redemption_date,
  redemption_pawn_ticket,
  pawn_id,
  redemption_amount,
  redemption_total_amount,
  interest,
  difference,
  remarks,
  created,
  modified
) => {
  this.redemption_id = redemption_id || '';
  this.redemption_date = redemption_date || '';
  this.redemption_pawn_ticket = redemption_pawn_ticket || '';
  this.pawn_id = pawn_id || '';
  this.redemption_amount = redemption_amount || '';
  this.redemption_total_amount = redemption_total_amount || '';
  this.interest = interest || 0;
  this.difference = difference || 0;
  this.remarks = remarks || '';
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = redemption;
