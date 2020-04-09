const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { constants } = require('./maps/constants');
const { warnings } = require('./maps/warnings');
const { errors } = require('./maps/errors');

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
    arguments: targetArgTypes,
    required: requiredArgLookup
  },
  givenArgs
) => {
  for (let i = 0; i < targetArgTypes.length; i++) {
    if (i < givenArgTypes.length) {
      if (!checkArgumentIsType(givenArgs[i].type, targetArgTypes[i])) {
        if (requiredArgLookup[i]) {
          return errors.EXPECTED_ANOTHER(givenArgs[i].type.token, targetArgTypes[i].token);
        }
        return warnings.BAD_UNECESSARY_ARGUMENT_TYPE(givenArgs[i].type.token, i + 1);
      }
    } else if (requiredArgLookup[i]) {
      return errors.MISSING_EXPECTED(i + 1, targetArgTypes[i].token);
    }
  }
  return;
};

const stripComments = source => {
  const rePattern = `${constants.COMMENT_TOKEN}.*?${constants.NEW_LINE}`;
  const re = new RegExp(rePattern, 'g');
  return source.replace(re, constants.NEW_LINE);
};

const checkIsURL = url => {
  try {
    const test = new URL(url);
  } catch (_) {
    return false;
  }
  return true;
}

const loadSource = async targetPath => {
  const { dir, root, base, name, ext } = path.parse(targetPath);
  if (checkIsURL(targetPath)) {
    const req = await fetch(targetPath);
    if (req.statusText === "OK") {
      return await req.text();
    }
    return errors.BAD_URL(targetPath);
  } else {
    const normalizedPath = path.normalize(targetPath);
    const isRelativePath = normalizedPath === path.resolve(targetPath);
    const resolvedPath = isRelativePath
      ? path.join(process.cwd(), normalizedPath)
      : normalizedPath;
    const stats = await fs.promises.stat(resolvedPath);
    if (stats.isDirectory()) {
      return (await fs.promises.readdir(resolvedPath))
        .reduce((result, fileName) => {
          const ext = fileName.split(".").pop(),
                prefix = fileName[0]; 
          if (ext === constants.NEO_FILE_EXTENTION && prefix !== constants.IGNORE_PREFIX) {
            const fileContent = fs.readFileSync(
              path.join(resolvedPath, fileName)
            );
            return result.concat(fileContent);
          }
          return result;
        }, [])
        .join("\n");
    } else if (stats.isFile()) {
      const fileContent = await fs.promises.readFile(resolvedPath);
      return fileContent;
    } else {
      // error: unknown file circumstance
    }
  }
};

const loadGlobalScope = () => {

};

module.exports = {
  checkArgumentIsType,
  determineViolation,
  stripComments,
  loadSource,
  loadGlobalScope
};