const {
  loadSource,
  loadGlobalScope,
  variablifyArguments,
  logMessage,
  beforeErrorShoot
} = require('./helpers');
const { commands } = require("./commands");
const { constants } = require("./maps/constants");
const { keywords } = require("./maps/keywords");
const { parse } = require('./parse');

const quit = () => process.exit(0);
const check = error => {
  if (error !== undefined) {
    logMessage(error);
    quit();
  }
};

const Neo = async ({ path, page }) => {
  
  const { source, root, error: sourceError } = await loadSource(path);
  if (sourceError !== undefined) {
    logMessage(sourceError);
    return;
  }

  const { instructions, error: parseError } = parse(source);
  if (parseError !== undefined) {
    logMessage(parseError);
    return;
  }

  const scope = loadGlobalScope();
  
  return {
    page, root, scope, ...beforeErrorShoot, ...commands,
    async run() {
      for (const instruction of instructions) {
        instruction.arguments = variablifyArguments(instruction);
        const error = await this[instruction.token](instruction);
        if (error !== undefined) {
          logMessage(error);
          await this.beforeErrorShoot();
          return;
        }
      }
    }
  };

};

module.exports = { Neo };