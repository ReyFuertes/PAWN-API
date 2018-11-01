var item = (
  item_id,
  sku,
  item_name,
  item_type,
  grams,
  karat,
  description,
  created,
  modified
) => {
  this.item_id = item_id || null;
  this.sku = sku || null;
  this.item_name = item_name || '';
  this.item_type = item_type || '';
  this.grams = grams || 0;
  this.karat = karat || 0;
  this.description = description || '';
  this.created = created || null;
  this.modified = modified || null;
};

module.exports = item;
