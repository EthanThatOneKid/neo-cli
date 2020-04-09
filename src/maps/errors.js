const { constants } = require('./constants');
const { keywords } = require('./keywords');
const { types } = require('./types');
const { classifyMessageMap } = require('./helpers');

const errors = classifyMessageMap(constants.ERROR_TOKEN, {
  BAD_LIST_DECLARATION: () => `Type ${types.LIST.token} must be declared with ${keywords.LOAD.token} keyword.`,
  EXPECTED_ANOTHER: (badType, expectedType) => `Incorrect type ${badType} is not correct type but is required; expected type ${expectedType}.`,
  MISSING_EXPECTED: (argIndex, expectedType) => `Required argument #${argIndex} not given; expected type ${expectedType}.`,
  ELEMENT_INEXISTENT: (selectorString) => `Selector '${selectorString}' cannot resolve to an element on the current page state.`,
  BAD_FILE_EXTENTION: (path) => `File '${path}' must have a file extension '${constants.NEO_FILE_EXTENTION}'.`,
  UNKNOWN_FILE_MISHAP: (path) => `Unknown file circumstance at '${path}'.`,
  NO_SUCH_FILE_OR_DIR: (path) => `No such file or directory at '${path}.`
});

module.exports = { errors };