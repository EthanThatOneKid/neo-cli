const { keywords } = require('./keywords');
const { types } = require('./types');

const errors = {
  LIST_DECLARATION: `Type ${types.LIST.token} must be declared with ${keywords.LOAD.token} keyword.`
};

module.exports = { errors };