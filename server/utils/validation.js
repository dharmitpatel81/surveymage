const mongoose = require('mongoose');

const isValidId = (id) =>
  id && id !== 'undefined' && mongoose.Types.ObjectId.isValid(id);

module.exports = { isValidId };
