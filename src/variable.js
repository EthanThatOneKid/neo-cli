const { types } = require('./types');

const getTypeObject = token => {
  for (const key of types) {
    const type = types[key];
    if (type.token === token) {
      return type;
    }
  }
};

const Variable = (
  typeToken,
  rawValue,
  type = getTypeObject(typeToken),
  value = type.make(rawValue)
) => ({ type, value });

module.exports = Variable;