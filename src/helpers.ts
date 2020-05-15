import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { constants } from './maps/constants';
import { keywords, Keyword } from './maps/keywords';
import { types, Type } from './maps/types';
import Variable from './Variable';
import errors from './maps/errors';
import warnings from './maps/warnings';

const getReadableDate = () => {
  const gimmeDate = new Date();
  gimmeDate.setMinutes(gimmeDate.getMinutes() - new Date().getTimezoneOffset());
  return gimmeDate
    .toISOString()
    .split("T")
    .shift();
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
    token,
    arguments: targetArgTypes,
    required: requiredArgLookup
  },
  givenArgs
) => {
  for (let i = 0; i < targetArgTypes.length; i++) {
    if (i < givenArgs.length) {
      if (!checkArgumentIsType(givenArgs[i].type, targetArgTypes[i])) {
        if (requiredArgLookup !== undefined && requiredArgLookup[i]) {
          return errors.EXPECTED_ANOTHER(token, givenArgs[i].type.token, String(i + 1), targetArgTypes[i].token);
        }
        return warnings.BAD_UNECESSARY_ARGUMENT_TYPE(token, givenArgs[i].type.token, String(i + 1));
      }
    } else if (requiredArgLookup !== undefined && requiredArgLookup[i]) {
      return errors.MISSING_EXPECTED(token, String(i + 1), targetArgTypes[i].token);
    }
  }
  return;
};

const stripComments = source => {
  const rePattern = `${constants.COMMENT_TOKEN}.*?(${constants.NEW_LINE}|$)`;
  const re = new RegExp(rePattern, 'g');
  return source.replace(re, constants.NEW_LINE);
};

const checkIsURL = url => {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
};

const getFileExt = path => path.split(".").pop();

const loadSourceFromURL = async targetPath => {
  let req;
  try {
    req = await fetch(targetPath);
  } catch (_) {
    const error = errors.INABSOLUTE_URL(targetPath);
    return { error };
  }
  if (req.ok) {
    const source = await req.text();
    const root = process.cwd();
    return { source, root };
  }
  const error = errors.BAD_URL(targetPath, req.statusText, req.status);
  return { error };
};

const loadSource = async (targetPath, targetFileExt) => {
  if (checkIsURL(targetPath)) {
    return await loadSourceFromURL(targetPath);
  } else {
    const normalizedPath = path.normalize(targetPath);
    const isRelativePath = normalizedPath === path.resolve(targetPath);
    const resolvedPath = isRelativePath
      ? path.join(process.cwd(), normalizedPath)
      : normalizedPath;
    if (fs.existsSync(resolvedPath)) {
      const stats = fs.statSync(resolvedPath);
      if (stats.isDirectory()) {
        const source = fs.readdirSync(resolvedPath)
          .reduce((result, fileName) => {
            const ext = getFileExt(fileName),
                  prefix = fileName[0]; 
            if (ext === targetFileExt && prefix !== constants.IGNORE_PREFIX) {
              const fileContent = String(fs.readFileSync(path.join(resolvedPath, fileName)));
              return result.concat(fileContent);
            }
            return result;
          }, [])
          .join(constants.NEW_LINE);
        return { source, root: resolvedPath };
      } else if (stats.isFile()) {
        const ext = getFileExt(resolvedPath);
        if (ext === targetFileExt) {
          const source = String(fs.readFileSync(resolvedPath));
          const root = path.dirname(resolvedPath);
          return { source, root };
        }
        const error = errors.BAD_FILE_EXTENTION(resolvedPath, targetFileExt);
        return { error };
      } else {
        const error = errors.UNKNOWN_FILE_MISHAP(resolvedPath);
        return { error };
      }
    } else {
      const error = errors.NO_SUCH_FILE_OR_DIR(resolvedPath);
      return { error };
    }
  }
};

const loadGlobalScope = () => {
  const DATE = Variable({ value: getReadableDate(), type: types.TEXT });
  const CWD = Variable({ value: process.cwd(), type: types.URL });
  const FILE_PREFIX = Variable({ value: constants.FILE_URL_PREFIX, type: types.TEXT });
  return { DATE, CWD, FILE_PREFIX };
};

const logMessage = ({ token, message }) => {
  if (token === constants.ERROR_TOKEN) {
    const toLog = `${token} ${chalk.bold(constants.ERROR_PREFIX)}: ${message}`;
    console.log(chalk[constants.ERROR_COLOR](toLog));
  } else if (token === constants.WARNING_TOKEN) {
    const toLog = `${token} ${chalk.bold(constants.WARNING_PREFIX)}: ${message}`;
    console.log(chalk[constants.WARNING_COLOR](toLog));
  } else if (token === constants.OK_TOKEN) {
    const toLog = `${token} ${chalk.bold(constants.OK_PREFIX)}: ${message}`;
    console.log(chalk[constants.OK_COLOR](toLog));
  } else {
    logMessage(warnings.UNEXPECTED_MESSAGE_TYPE(token, message));
  }
};

const getKeywordObjectFromToken = (targetToken: string): Keyword => {
  return Object.values(keywords)
    .find(({ token }) => token === targetToken);
};

const getTypeObjectFromToken = (targetToken: string): Type => {
  return Object.values(types)
    .find(({ token }) => token === targetToken);
};

const variablifyArguments = (scope, { token, inlineArguments, instructions }) => {
  const { arguments: targetArgTypes } = getKeywordObjectFromToken(token);
  const variablifiedArguments = [];
  let rest = false;
  for (let argIndex = 0; argIndex < inlineArguments.length; argIndex++) {
    let type = targetArgTypes[argIndex] || types.TEXT;
    if (type.token === types.REST.token) {
      rest = true;
      type = types.TEXT;
    }
    const value = inlineArguments[argIndex];
    let variablifiedArgument = Variable({ value, type });
    if (scope.hasOwnProperty(value) && scope[value].type.token === type.token) {
      variablifiedArgument = scope[value];
    }
    if (rest) {
      if (variablifiedArguments[variablifiedArguments.length - 1] instanceof Array) {
        variablifiedArguments[variablifiedArguments.length - 1].push(variablifiedArgument);
      } else {
        variablifiedArguments.push([variablifiedArgument]);
      }
    } else {
      variablifiedArguments.push(variablifiedArgument);
    }
  }
  return { token, instructions, inlineArguments: variablifiedArguments };
};

const getListValueFromSource = (source, type) => {
  const list = { type, items: [] };
  try {
    list.items = [...JSON.parse(source)];
  } catch (_) {
    list.items = source.split(constants.NEW_LINE);
  }
  return list;
};

const getArgumentsFromArgTypesAndNames = argTypesAndNameVars => {
  const argTypesAndNames = argTypesAndNameVars.map(argVar => argVar.make());
  const result = [];
  for (let i = 0; i < argTypesAndNames.length; i++) {
    if (i % 2 === 0) {
      const typeToken = argTypesAndNames[i];
      const typeObject = getTypeObjectFromToken(typeToken);
      if (typeObject === undefined) {
        const error = errors.BAD_MAKE_PATTERN(String(i));
        return { error };
      }
      result.push({ type: typeObject, name: null });
    } else {
      const argName = argTypesAndNames[i];
      if (getTypeObjectFromToken(argName) !== undefined) {
        const error = errors.BAD_MAKE_PATTERN(String(i));
        return { error };
      }
      result[result.length - 1].name = argName;
    }
  }
  if (result[result.length - 1] !== undefined && result[result.length - 1].name === null) {
    const error = errors.BAD_MAKE_PATTERN(String(2 * result.length - 1), String(true));
    return { error };
  }
  return { arguments: result };
};

const now = () => +new Date();

export {
  now,
  checkArgumentIsType,
  determineViolation,
  stripComments,
  loadSource,
  loadGlobalScope,
  logMessage,
  getKeywordObjectFromToken,
  getTypeObjectFromToken,
  variablifyArguments,
  getListValueFromSource,
  getFileExt,
  getArgumentsFromArgTypesAndNames
};