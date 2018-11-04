var renewal = (
  renewal_id,
  renewal_date,
  renewal_pawn_ticket,
  new_pawn_number,
  pawn_id,
  renewal_amount,
  renewal_total_amount,
  interest,
  difference,
  remarks,
  created,
  modified
) => {
  this.renewal_id = renewal_id || '';
  this.renewal_date = renewal_date || '';
  this.renewal_pawn_ticket = renewal_pawn_ticket || '';
  this.new_pawn_number = new_pawn_number || '';
  this.pawn_id = pawn_id || '';
  this.renewal_amount = renewal_amount || '';
  this.renewal_total_amount = renewal_total_amount || '';
  this.interest = interest || 0;
  this.difference = difference || 0;
  this.remarks = remarks || '';
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = renewal;
