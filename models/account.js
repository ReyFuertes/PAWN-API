var account = (id_number, account_id, firstname, lastname, contact_number, birthday, valid_id, valid_id_number, address, created, modified) => {
  this.id_number = id_number || null;
  this.account_id = account_id || null;
  this.firstname = firstname || null;
  this.lastname = lastname || null;
  this.contact_number = contact_number || null;
  this.birthday =  valid_id || null;
  this.valid_id = valid_id || null;
  this.valid_id_number = valid_id_number || null;
  this.address = address || null;
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = account;
