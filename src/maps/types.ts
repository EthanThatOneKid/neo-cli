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
    make: v => v === "true" || Boolean(Number(v)),
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
    make: o => ({ ...o }),
    toString: ({ items }) => JSON.stringify(items)
  },
  COOKIE: {
    token: "cook",
    make: o => ({ ...o }),
    toString: JSON.stringify
  }
};

export default types;