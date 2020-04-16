const types = {
  INTEGER: {
    token: "int",
    make: n => Math.floor(Number(n.replace(/\D/g, ""))),
    toString: String
  },
  TEXT: {
    token: "text",
    make: String,
    toString: String
  },
  BOOLEAN: {
    token: "bool",
    make: Boolean,
    toString: bool => bool ? "true" : "false"
  },
  URL: {
    token: "url",
    make: String,
    toString: String
  },
  SELECTOR: {
    token: "sel",
    make: String,
    toString: String
  },
  LIST: {
    token: "list",
    make: list => [...list],
    toString: JSON.stringify
  },
  COOKIE: {
    token: "cook",
    make: obj => ({ ...obj }),
    toString: JSON.stringify
  }
};

module.exports = { types };