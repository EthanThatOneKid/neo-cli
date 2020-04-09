const { keywords } = require('./maps/keywords');
const { constants } = require('./maps/constants');
const { stripComments, getKeywordObjectFromToken } = require('./helpers');

const findEndingEncapsulatorIndex = (tokens, curIndex, begEnc, endEnc) => {
  // console.log({tokens,begEnc,endEnc})
  let nests = 0;
  for (let i = curIndex; i < tokens.length; i++) {
    console.log(i, tokens[i]);
    if (tokens[i] === begEnc) {
      // console.log(tokens[i], "plus")
      nests++;
    } else if (tokens[i] === endEnc) {
      // console.log(tokens[i], "minus")
      nests--;
      if (nests === 0) {
        return i;
      }
    }
  }
  return -1;
};

const parseTokens = tokens => {
  const instructions = [],
        gimmeArgument = [];
  const pushArgument = () => instructions[instructions.length - 1].arguments.push(gimmeArgument.join(" "));
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const keyword = getKeywordObjectFromToken(token);
    if (keyword !== undefined) {
      if (instructions.length > 0) {
        pushArgument();
      }
      instructions.push({ token: keyword.token, arguments: [] });
      if (keyword.hasOwnProperty("encapsulator")) {
        const endingEncapsulatorToken = keyword.encapsulator;
        const endingEncapsulatorIndex = findEndingEncapsulatorIndex(tokens, i, keyword.token, endingEncapsulatorToken);
        console.log({endingEncapsulatorIndex})
        if (endingEncapsulatorIndex === -1) {
          console.log("Expected endingEncapsulatorToken for token");
          return;
        }
        console.log(tokens.slice(i, endingEncapsulatorIndex))
        instructions[instructions.length - 1]["instructions"] = parseTokens(tokens.slice(i + 1, endingEncapsulatorIndex));
        i = endingEncapsulatorIndex;
      }
    } else if (token === constants.ARGUMENT_DELIMINATOR) {
      pushArgument();
      gimmeArgument.splice(0, gimmeArgument.length);
    } else {
      gimmeArgument.push(token);
    }
  }
  return instructions;
};

const parse = source => {
  const tokens = stripComments(source)
    .split(constants.TOKENIZOR_REGEX)
    .filter(s => !s.match(/^\s*$/));
  // console.log({tokens})
  return parseTokens(tokens);
};

module.exports = { parse };