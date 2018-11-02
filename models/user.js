var user = (
  email,
  password,
  token
) => {
  this.email = email || '';
  this.password = password || '';
  this.token = token || '';
};

module.exports = user;
