const fs = require('fs');
const path = require('path');
const { constants } = require('./maps/constants');
const { warnings } = require('./maps/warnings');
const { errors } = require('./maps/errors');

const checkArgumentIsType = (targetType, argumentType) => {
  if (argumentType instanceof Array) {
    for (const type of argumentType) {  
      if (targetType.token === type.token) {
        return true;
      }
    }
    return false;
  }
  return targetType.token === argumentType.token;
};

const determineViolation = (
  {
    arguments: targetArgTypes,
    required: requiredArgLookup
  },
  givenArgs
) => {
  for (let i = 0; i < targetArgTypes.length; i++) {
    if (i < givenArgTypes.length) {
      if (!checkArgumentIsType(givenArgs[i].type, targetArgTypes[i])) {
        if (requiredArgLookup[i]) {
          return errors.EXPECTED_ANOTHER(givenArgs[i].type.token, targetArgTypes[i].token);
        }
        return warnings.BAD_UNECESSARY_ARGUMENT_TYPE(givenArgs[i].type.token, i + 1);
      }
    } else if (requiredArgLookup[i]) {
      return errors.MISSING_EXPECTED(i + 1, targetArgTypes[i].token);
    }
  }
  return;
};

const stripComments = source => {
  const rePattern = `${constants.COMMENT_TOKEN}.*?${constants.NEW_LINE}`;
  const re = new RegExp(rePattern, 'g');
  return source.replace(re, constants.NEW_LINE);
};

const loadSource = async targetPath => {
  const { dir, root, base, name, ext } = path.parse(targetPath);
  return path.parse(targetPath);
};

const loadGlobalScope = () => {

};

module.exports = {
  checkArgumentIsType,
  determineViolation,
  stripComments,
  loadSource,
  loadGlobalScope
};