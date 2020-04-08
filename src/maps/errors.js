const { constants } = require('./constants');
const { keywords } = require('./keywords');
const { types } = require('./types');
const { classifyMessageMap } = require('./helpers');

const errors = classifyMessageMap(constants.ERROR_TOKEN, {
  BAD_LIST_DECLARATION: () => `Type ${types.LIST.token} must be declared with ${keywords.LOAD.token} keyword.`,
  EXPECTED_ANOTHER: (badType, expectedType) => `Incorrect type ${badType} is not correct type but is required; expected type ${expectedType}.`,
  MISSING_EXPECTED: (argIndex, expectedType) => `Required argument #${argIndex} not given; expected type ${expectedType}.`,
  ELEMENT_INEXISTENT: (selectorString) => `Selector "${selectorString}" cannot resolve to an element on the current page state.`
});

module.exports = { errors };