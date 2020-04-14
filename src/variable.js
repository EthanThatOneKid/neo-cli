// const { types } = require('./types');

// const getTypeObject = token => {
//   for (const key of types) {
//     const type = types[key];
//     if (type.token === token) {
//       return type;
//     }
//   }
// };

const Variable = (value, type) => ({
  value, type,
  make(scope = {}) {
    const populatedValue = Object.keys(scope)
      .reduce((result, varName) => {
        if (result.indexOf(varName) > -1) {
          const varValue = scope[varName].make(scope);
          return result.replace(varName, varValue);
        }
        return result;
      }, this.value);
    return this.type.make(populatedValue);
  }
 });

module.exports = { Variable };