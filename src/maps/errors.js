const { constants } = require('./constants');
const { keywords } = require('./keywords');
const { types } = require('./types');
const { classifyMessageMap } = require('./helpers');

const errors = classifyMessageMap(constants.ERROR_TOKEN, {
  BAD_LIST_DECLARATION: () => `Type ${types.LIST.token} must be declared with ${keywords.LOAD.token} keyword.`,
  EXPECTED_ANOTHER: (token, badType, argIndex, expectedType) => `At command ${token}, incorrect type ${badType} is not correct type but is required at argument #${argIndex}; expected type ${expectedType}.`,
  MISSING_EXPECTED: (token, argIndex, expectedType) => `At command, ${token}, required argument #${argIndex} if not given; expected type ${expectedType}.`,
  ELEMENT_INEXISTENT: (selectorString) => `Selector '${selectorString}' cannot resolve to an element on the current page state.`,
  BAD_FILE_EXTENTION: (path, ext) => `File '${path}' expected a file extension '${ext}'.`,
  UNKNOWN_FILE_MISHAP: (path) => `Unknown file circumstance at '${path}'.`,
  NO_SUCH_FILE_OR_DIR: (path) => `No such file or directory at '${path}'.`,
  NO_SUCH_TYPE: (typeText) => `No such type ${typeText} exists.`,
  SYNTAX_ERROR: () => `Proper syntax is required. Confirm that your source file(s) are correct. Review the documentation for examples.`,
  NOT_EXPECTED_ELEMENT_TAG: (targetTagName, selectorString) => `Expected to select an element of tag ${targetTagName} but got selector ${selectorString}.`,
  LIST_EXPECTS_ELEMENT: () => `When applying operation ${constants.LIST_PUSH} or ${constants.LIST_UNSHIFT}, keyword ${keywords.EDIT.token} expects a third argument.`,
  LIST_EXPECTS_OPERATION: (badOperation) => `Keyword ${keywords.EDIT.token} expects an operation constant ${constants.LIST_PUSH}, ${constants.LIST_UNSHIFT}, ${constants.LIST_POP}, or ${constants.LIST_UNSHIFT} as the second argument but got ${badOperation}.`,
  NAVIGATION_ERROR: (badUrl) => `No navigatable file found at '${badUrl}'.`,
  GENERIC_ERROR: (err) => `${err}`
});

module.exports = { errors };