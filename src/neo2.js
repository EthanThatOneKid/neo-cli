const { loadSource, loadGlobalScope } = require('./helpers');
const { parse } = require('./parse');

const Neo = async ({ path, page }) => {
  const source = await loadSource(path);
  console.log({source})
  const scope = {};
  const instructions = [];

};

module.exports = { Neo };