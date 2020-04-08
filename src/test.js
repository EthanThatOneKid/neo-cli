const { Neo } = require('./neo2');

const neo1 = Neo({
  path: "../sample/index.neo",
  page: null
});

const neo2 = Neo({
  path: "../sample/",
  page: null
});

const neo3 = Neo({
  path: "https://github.com/EthanThatOneKid/neo/index.neo",
  page: null
});

const neo4 = Neo({
  path: "../sample/_test.neo",
  page: null
});

console.log({neo1,neo2,neo3,neo4});