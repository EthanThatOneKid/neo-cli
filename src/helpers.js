const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const chalk = require('chalk');
const { Variable } = require('./Variable');
const { constants } = require('./maps/constants');
const { keywords } = require('./maps/keywords');
const { warnings } = require('./maps/warnings');
const { errors } = require('./maps/errors');
const { types } = require('./maps/types');
require('dotenv').config();

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
          return errors.EXPECTED_ANOTHER(token, givenArgs[i].type.token, i + 1, targetArgTypes[i].token);
        }
        return warnings.BAD_UNECESSARY_ARGUMENT_TYPE(token, givenArgs[i].type.token, i + 1);
      }
    } else if (requiredArgLookup !== undefied && requiredArgLookup[i]) {
      return errors.MISSING_EXPECTED(token, i + 1, targetArgTypes[i].token);
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
  const req = await fetch(targetPath);
  if (req.statusText === "OK") {
    const source = await req.text();
    const root = process.cwd();
    return { source, root };
  }
  const error = errors.BAD_URL(targetPath);
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
          .join("\n");
        return { source, root: resolvedPath };
      } else if (stats.isFile()) {
        const ext = getFileExt(resolvedPath);
        if (ext === constants.NEO_FILE_EXTENTION) {
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
  const DATE = getReadableDate();
  const enviromentVariables = Object.keys(process.env)
    .reduce((result, key) => {
      if (key.indexOf(constants.ENV_VARIABLE_PREFIX) === 0) {
        result[key] = process.env[key];
      }
      return result;
    }, {});
  return { DATE, ...enviromentVariables };
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

const getKeywordObjectFromToken = targetToken => {
  return Object.values(keywords)
    .find(({ token }) => token === targetToken);
};

const getTypeObjectFromToken = targetToken => {
  return Object.values(types)
    .find(({ token }) => token === targetToken);
};

const variablifyArguments = ({ token, arguments }) => {
  const keywordObject = getKeywordObjectFromToken(token);
  const { arguments: targetArgTypes } = keywordObject;
  return arguments.map((value, i) => Variable(value, targetArgTypes[i]));
};

const beforeErrorShoot = ({
  async beforeErrorShoot() {
    const screenshotPath = `${constants.BEFORE_ERROR_NAME}_${+new Date()}.png`;
    const instruction = {
      keyword: keywords.SHOOT.token,
      arguments: [Variable(screenshotPath, types.URL)]
    };
    await this[keywords.SHOOT.token](instruction);
  }
});

const getListValueFromSource = source => {
  let list = [];
  try {
    list = JSON.parse(source);
  } catch (_) {
    list = source.split(constants.NEW_LINE);
  }
  return list;
};

module.exports = {
  checkArgumentIsType,
  determineViolation,
  stripComments,
  loadSource,
  loadGlobalScope,
  logMessage,
  getKeywordObjectFromToken,
  getTypeObjectFromToken,
  variablifyArguments,
  beforeErrorShoot,
  getListValueFromSource
};