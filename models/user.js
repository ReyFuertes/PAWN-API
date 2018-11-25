var user = (
  email,
  password,
  token,
  branch
) => {
  this.email = email || '';
  this.password = password || '';
  this.token = token || '';
  this.branch = branch || '';
};

module.exports = user;
