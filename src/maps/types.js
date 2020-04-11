const types = {
  INTEGER: {
    token: "int",
    make: n => Math.floor(Number(n.replace(/\D/g, "")))
  },
  TEXT: {
    token: "text",
    make: String
  },
  BOOLEAN: {
    token: "bool",
    make: Boolean
  },
  URL: {
    token: "url",
    make: String
  },
  SELECTOR: {
    token: "sel",
    make: String
  },
  LIST: {
    token: "list",
    make: list => [...list]
  }
};

module.exports = { types };