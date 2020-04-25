import keywords from './maps/keywords';
import constants from './maps/constants';
import errors from './maps/errors';
import {
  stripComments,
  getKeywordObjectFromToken
} from './helpers';

const findEndingEncapsulatorIndex = (tokens, curIndex, begEnc, endEnc) => {
  for (let i = curIndex, nests = 0; i < tokens.length; i++) {
    if (tokens[i] === begEnc) {
      nests++;
    } else if (tokens[i] === endEnc) {
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
  const pushArgument = () => {
    if (instructions.length === 0) {
      return errors.SYNTAX_ERROR();
    } else if (gimmeArgument.length > 0) {
      instructions[instructions.length - 1].arguments.push(gimmeArgument.join(" "));
      gimmeArgument.splice(0, gimmeArgument.length);
    }
  };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const keyword = getKeywordObjectFromToken(token);
    if (keyword !== undefined) {
      if (instructions.length > 0) {
        const error = pushArgument();
        if (error !== undefined) {
          return { error, instructions };
        }
      }
      instructions.push({ token: keyword.token, arguments: [] });
      if (keyword.hasOwnProperty("encapsulator")) {
        const endingEncapsulatorToken = keyword.encapsulator;
        const endingEncapsulatorIndex = findEndingEncapsulatorIndex(tokens, i, keyword.token, endingEncapsulatorToken);
        if (endingEncapsulatorIndex === -1) {
          return;
        }
        const { instructions: gimmeInstructions, error } = parseTokens(tokens.slice(i + 1, endingEncapsulatorIndex));
        if (error !== undefined) {
          return { error, instructions };
        }
        instructions[instructions.length - 1]["instructions"] = gimmeInstructions;
        i = endingEncapsulatorIndex;
      }
    } else if (token === constants.ARGUMENT_DELIMINATOR) {
      const error = pushArgument();
      if (error !== undefined) {
        return { error, instructions };
      }
    } else {
      gimmeArgument.push(token);
    }
    if (i === tokens.length - 1) {
      const error = pushArgument();
      if (error !== undefined) {
        return { error, instructions };
      }
    }
  }
  return { instructions };
};

const parse = source => {
  const tokens = stripComments(source)
    .split(constants.TOKENIZOR_REGEX)
    .filter(s => !s.match(/^\s*$/));
  return parseTokens(tokens);
};

export default parse;