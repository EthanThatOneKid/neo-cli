const { types } = require("./maps/types");

const checkIsStringBasedType = ({ token }) => {
  const nonStringBasedTypeTokens = [types.LIST.token, types.COOKIE.token, types.INTEGER.token];
  return !nonStringBasedTypeTokens.some(t => t === token);
};

const Variable = ({ value, type }) => ({
  value, type,
  make(scope = {}) {
    let populatedValue;
    if (checkIsStringBasedType(this.type)) {
      populatedValue = Object.keys(scope)
        .reduce((result, varName) => {
          if (result.indexOf(varName) > -1) {
            const varValue = scope[varName].make(scope);
            return result.replace(varName, varValue);
          }
          return result;
        }, this.type.toString(this.value));
    } else {
      populatedValue = scope.hasOwnProperty(this.value)
        ? scope[this.value].value
        : this.type.make(this.value);
      // console.log(this.type.token, this.value, populatedValue)
    }
    // console.log({value, type, populatedValue})
    return this.type.make(populatedValue);
  }
 });

module.exports = { Variable };