const { types } = require('./types');

const keywords = {
  AWAIT: {
    token: "await",
    arguments: []
  },
  CLICK: {
    token: "click",
    arguments: [types.SELECTOR],
    required: [true]
  },
  DIALOG: {
    token: "dialog",
    arguments: [types.TEXT],
    required: [false]
  },
  EDIT: {
    token: "edit",
    // list to edit, push|pop|shift|unshift, addition
    arguments: [types.LIST, types.TEXT, types.TEXT],
    required: [true, true, false]
  },
  FIELD: {
    token: "field",
    arguments: [types.SELECTOR, types.TEXT],
    required: [true, true]
  },
  GOTO: {
    token: "goto",
    arguments: [types.URL],
    required: [true]
  },
  IF: {
    token: "if",
    arguments: [types.BOOLEAN],
    required: [true]
  },
  LOAD: {
    token: "load",
    arguments: [types.URL, types.TEXT, types.TEXT],
    required: [true, false]
  },
  LOG: {
    token: "log",
    arguments: [types.TEXT],
    required: [true]
  },
  MAYBE: {
    token: "maybe",
    arguments: [],
    encapsulator: "if"
  },
  NEO: {
    token: "neo",
    arguments: [types.URL],
    required: [true]
  },
  PAUSE: {
    token: "pause",
    arguments: [types.INTEGER],
    required: [false]
  },
  READ: {
    token: "read",
    arguments: [types.SELECTOR],
    required: [true]
  },
  REPEAT: {
    token: "rep",
    arguments: [],
    encapsulator: "until"
  },
  SAVE: {
    token: "sav",
    arguments: [types.URL, types.LIST],
    required: [true, true]
  },
  SELECT: {
    token: "select",
    arguments: [types.SELECTOR, types.TEXT],
    required: [true, false]
  },
  SHOOT: {
    token: "shoot",
    arguments: [types.URL],
    required: [false]
  },
  TITLE: {
    token: "title",
    arguments: [types.TEXT],
    required: [true]
  },
  UNTIL: {
    token: "until",
    // max thresh, the element, the check
    arguments: [types.INTEGER, types.SELECTOR, types.TEXT],
    required: [true, false, false]
  },
  VARIABLE: {
    token: "var",
    arguments: [types.TEXT, types.TEXT, types.TEXT],
    required: [true, true, true]
  }
};

module.exports = { keywords };