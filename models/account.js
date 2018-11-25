var account = (id_number, account_id, firstname, lastname, contact_number, birthdate, valid_id, valid_id_number, address, image, created, modified) => {
  this.id_number = id_number || null;
  this.account_id = account_id || null;
  this.firstname = firstname || null;
  this.lastname = lastname || null;
  this.contact_number = contact_number || null;
  this.birthdate =  valid_id || null;
  this.valid_id = valid_id || null;
  this.valid_id_number = valid_id_number || null;
  this.address = address || null;
  this.image = image || null;
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = account;
