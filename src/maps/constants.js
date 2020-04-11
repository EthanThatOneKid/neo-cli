const constants = {
  ACCEPT: "accept",
  DISMISS: "dismiss",
  CONFIRM_BOX: "confirm",
  ALERT_BOX: "alert",
  PROMPT_BOX: "prompt",
  WARNING_TOKEN: "⚠",
  WARNING_PREFIX: "NEO WARNING",
  WARNING_COLOR: "yellow",
  ERROR_TOKEN: "❌",
  ERROR_PREFIX: "NEO ERROR",
  ERROR_COLOR: "red",
  OK_TOKEN: "✔",
  OK_PREFIX: "NEO",
  OK_COLOR: "green",
  ARGUMENT_DELIMINATOR: ",",
  COMMENT_TOKEN: "\~\~",
  TOKENIZOR_REGEX: /\s*([^\s\,]+|\,)\s*/g,
  NEW_LINE: "\r\n",
  NEO_FILE_EXTENTION: "neo",
  IGNORE_PREFIX: "_",
  SHOOT_DEFAULT: "./NEO_SHOOT",
  BEFORE_ERROR_NAME: "./NEO_BEFORE_ERROR"
};

module.exports = { constants };