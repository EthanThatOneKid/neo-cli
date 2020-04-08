const { types } = require('./types');
const { constants } = require('./constants');

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
    arguments: [[constants.ACCEPT, constants.DISMISS]],
    required: [false]
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
  LOAD: {
    token: "load",
    arguments: [types.URL, types.TEXT],
    required: [true, false]
  },
  LOG: {
    token: "log",
    arguments: [types.TEXT],
    required: [true]
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
    arguments: []
  },
  SAVE: {
    token: "sav",
    arguments: [types.TEXT, types.SELECTOR],
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
    arguments: [[types.INTEGER, types.SELECTOR], types.TEXT],
    required: [true, false]
  },
  VARIABLE: {
    token: "var",
    arguments: [
      [Object.values(types).map(({ token }) => token)],
      types.TEXT,
      types.SELECTOR
    ]
  }
};

module.exports = { keywords };