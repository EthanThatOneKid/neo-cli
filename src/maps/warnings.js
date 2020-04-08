const { keywords } = require('./keywords');
const { types } = require('./types');
const { constants } = require('./constants');
const { classifyMessageMap } = require('../helpers');

const warnings = classifyMessageMap(constants.WARNING_TOKEN, {
  BAD_UNECESSARY_ARGUMENT_TYPE: (badType, argIndex) => `Incorrect type ${badType} used as unecessary argument #${argIndex}; resorted to default.`,
});

module.exports = { warnings };