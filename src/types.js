const types = {
  INTEGER: {
    token: "int",
    make: Number
  },
  TEXT: {
    token: "text",
    make: String
  },
  BOOLEAN: {
    token: "bool",
    make: Boolean
  },
  ELEMENT: {
    token: "el",
    make: sel => document.querySelector(sel.value)
  },
  URL: {
    token: "url",
    make: URL
  },
  SELECTOR: {
    token: "sel",
    make: String
  },
  LIST: {
    token: "list",
    make: Array
  }
};

module.exports = { types };