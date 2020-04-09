const { loadSource, loadGlobalScope, logMessage } = require('./helpers');
const { constants } = require("./maps/constants");
const { parse } = require('./parse');

const Neo = async ({ path, page }) => {
  const { source, error } = await loadSource(path);
  if (error !== undefined) {
    return logMessage(error);
  }
  const scope = {};
  const instructions = parse(source);
  console.log(JSON.stringify(instructions, null, 2))
};

module.exports = { Neo };