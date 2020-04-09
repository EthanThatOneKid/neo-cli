const constants = {
  ACCEPT: "accept",
  DISMISS: "dismiss",
  CONFIRM_BOX: "confirm",
  ALERT_BOX: "alert",
  PROMPT_BOX: "prompt",
  WARNING_TOKEN: "⚠",
  WARNING_COLOR: "yellow",
  ERROR_TOKEN: "❌",
  ERROR_COLOR: "red",
  OK_TOKEN: "✔",
  OK_COLOR: "green",
  ARGUMENT_DELIMINATOR: ",",
  COMMENT_TOKEN: "\~\~",
  TOKENIZOR_REGEX: /\s*([^\s\,]+|\,)\s*/g,
  NEW_LINE: "\r\n",
  NEO_FILE_EXTENTION: "neo",
  IGNORE_PREFIX: "_"
};

module.exports = { constants };