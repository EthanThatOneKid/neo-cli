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

const Neo = async ({ source, root, page }) => {
  const { instructions, error } = parse(source);
  if (error !== undefined) {
    logMessage(error);
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

Neo.load = async ({ path, page }) => {
  const { source, root, error } = await loadSource(path);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return Neo({ source, root, page });
};

module.exports = { Neo };