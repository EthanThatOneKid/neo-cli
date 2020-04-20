const types = {
  INTEGER: {
    token: "int",
    make: n => Math.floor(Number(n)),
    toString: String
  },
  TEXT: {
    token: "text",
    make: String,
    toString: String
  },
  BOOLEAN: {
    token: "boo",
    make: v => Boolean(Number(v)),
    toString: b => b ? "true" : "false"
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
    make: l => Object.assign([], l),
    toString: JSON.stringify
  },
  COOKIE: {
    token: "cook",
    make: o => ({ ...o }),
    toString: JSON.stringify
  }
};

module.exports = { types };