const { checkIsStringBasedType } = require("./helpers");

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
        }, this.value);
    } else {
      if (scope.hasOwnProperty(this.value)) {
        populatedValue = scope[this.value];
      }
    }
    return this.type.make(populatedValue || this.value);
  }
 });

module.exports = { Variable };