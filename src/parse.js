const { constants } = require('./maps/constants');
const { stripComments } = require('./maps/helpers');

const parse = source => {
  const tokens = stripComments(source)
    .split(constants.TOKENIZOR_REGEX)
    .filter(s => !s.match(/^\s*$/));
  return tokens;
};

module.exports = { parse };