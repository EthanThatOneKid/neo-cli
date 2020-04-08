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
  value,
  type = getTypeObject(typeToken),
  make = () => this.type.make(this.value)
) => ({ value, type, make });

module.exports = { Variable };