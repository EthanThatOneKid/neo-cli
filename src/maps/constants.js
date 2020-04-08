const constants = {
  ACCEPT: "accept",
  DISMISS: "dismiss",
  CONFIRM_BOX: "confirm",
  ALERT_BOX: "alert",
  PROMPT_BOX: "prompt",
  WARNING_TOKEN: "⚠",
  ERROR_TOKEN: "❌",
  OK_TOKEN: "✔",
  ARGUMENT_DELIMINATOR: ",",
  COMMENT_TOKEN: "~~",
  TOKENIZOR_REGEX: /\s*([^\s\,]+|\,)\s*/g,
  NEW_LINE: "\n",
  NEO_FILE_EXTENTION: ".neo"
};

module.exports = { constants };