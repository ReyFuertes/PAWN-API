var item = (
  item_id,
  item_name,
  item_type,
  grams,
  karat,
  description,
  created,
  modified
) => {
  this.item_id = item_id || null;
  this.item_name = item_name || null;
  this.item_type = item_type || null;
  this.grams = grams || null;
  this.karat = karat || null;
  this.description = description || null;
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = item;
