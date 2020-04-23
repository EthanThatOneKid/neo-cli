const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const chalk = require('chalk');
const ora = require('ora');
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
          .join("\n");
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
  const textType = getTypeObjectFromToken("text");
  const DATE = Variable({ value: getReadableDate(), type: textType });
  const CWD = Variable({ value: process.cwd(), type: types.URL });
  const FILE_PREFIX = Variable({ value: constants.FILE_URL_PREFIX, type: types.TEXT });
  const enviromentVariables = Object.keys(process.env)
    .reduce((result, key) => {
      if (key.indexOf(constants.ENV_VARIABLE_PREFIX) === 0) {
        result[key] = Variable({ value: process.env[key], type: textType });
      }
      return result;
    }, {});
  return { DATE, CWD, FILE_PREFIX, ...enviromentVariables };
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

const getObjectFromToken = (parent, targetToken) => {
  return Object.values(parent)
    .find(({ token }) => token === targetToken);
};

const getKeywordObjectFromToken = targetToken => {
  return getObjectFromToken(keywords, targetToken);
};

const getTypeObjectFromToken = targetToken => {
  return getObjectFromToken(types, targetToken);
};

const variablifyArguments = ({ token, arguments }) => {
  const keywordObject = getKeywordObjectFromToken(token);
  const { arguments: targetArgTypes } = keywordObject;
  return arguments.map((value, i) => {
    const isValueAlreadyVariablified = value.hasOwnProperty("value");
    if (isValueAlreadyVariablified) {
      return value;
    }
    const type = targetArgTypes[i];
    return Variable({ value, type });
  });
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

const getListValueFromSource = (source, type) => {
  const list = { type,   items: [] };
  try {
    list.items = [...JSON.parse(source)];
  } catch (_) {
    list.items = source.split(constants.NEW_LINE);
  }
  return list;
};

const getBrowserKey = flags => {
  if (flags[constants.CHROMIUM_BROWSER]) {
    return constants.CHROMIUM_BROWSER;
  } else if (flags[constants.FIREFOX_BROWSER]) {
    return constants.FIREFOX_BROWSER;
  } else if (flags[constants.WEBKIT_BROWSER]) {
    return constants.WEBKIT_BROWSER;
  } else {
    return constants.DEFAULT_BROWSER;
  }
};

const beginBrowserLaunch = browserKey => {
  const text = constants.LAUNCHING(browserKey);
  const spinner = ora({ text }).start();
  return () => spinner.succeed(constants.LAUNCH_COMPLETE(browserKey));
};

const now = () => +new Date();

module.exports = {
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
  beforeErrorShoot,
  getListValueFromSource,
  getBrowserKey,
  beginBrowserLaunch,
  getFileExt
};