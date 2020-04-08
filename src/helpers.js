const classifyMessageMap = (token, messageMap) => {
  return Object.entries(messageMap)
    .reduce((result, [key, make]) => {
      result[key] = (...args) => ({ token, message: make(...args)});
      return result;
    }, {});
};

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

module.exports = {
  classifyMessageMap,
  checkArgumentIsType,
  determineViolation
};