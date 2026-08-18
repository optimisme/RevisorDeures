const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function comparePassword(password, hash) {
  return hashPassword(password) === hash;
}

module.exports = { hashPassword, comparePassword };
