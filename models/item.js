var item = (
  item_id,
  sku,
  item_name,
  item_type,
  grams,
  karat,
  description,
  created,
  branch,
  branch_id,
  none_jewelry,
  birth_stone_details,
  titus_details,
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
  this.branch = branch || null;
  this.branch_id = branch_id || null;
  this.none_jewelry = none_jewelry || null;
  this.birth_stone_details = birth_stone_details || null;
  this.titus_details = titus_details || null;
  this.modified = modified || null;
};

module.exports = item;
