const { loadSource, loadGlobalScope } = require('./helpers');
const { constants } = require("./maps/constants");
const { parse } = require('./parse');

const Neo = async ({ path, page }) => {
  const source = await loadSource(path);
  if (source.hasOwnProperty("type")) {
    if (source.type === constants.ERROR_TOKEN) {
      
    }
  }
  console.log({source})
  const scope = {};
  const instructions = [];

};

module.exports = { Neo };