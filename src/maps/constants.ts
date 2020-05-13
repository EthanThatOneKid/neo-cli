interface Constants {
  [constantKey: string]: any
}

const constants: Constants = {
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
  OK_TOKEN: "√",
  OK_PREFIX: "NEO",
  OK_COLOR: "green",
  ARGUMENT_DELIMINATOR: ",",
  COMMENT_TOKEN: "\~\~",
  TOKENIZOR_REGEX: /\s*([^\s\,]+|\,)\s*/g,
  NEW_LINE: "\r\n",
  NEO_FILE_EXTENTION: "neo",
  IGNORE_PREFIX: "_",
  SHOOT_DEFAULT: "./NEO_SHOOT",
  BEFORE_ERROR_NAME: "./NEO_BEFORE_ERROR",
  ENV_VARIABLE_PREFIX: "NEO_",
  LIST_PUSH: "push",
  LIST_POP: "pop",
  LIST_SHIFT: "shift",
  LIST_UNSHIFT: "unshift",
  CHROMIUM_BROWSER: "chromium",
  FIREFOX_BROWSER: "firefox",
  WEBKIT_BROWSER: "webkit",
  DEFAULT_BROWSER: "chromium",
  CLI_MODE: "cli",
  EXT_MODE: "ext",
  FILE_URL_PREFIX: "file:///",
  DIST_DIR: `${process.cwd()}\\`,
  LAUNCHING: browser => `Launching ${browser} browser.`,
  LAUNCH_COMPLETE: browser => `${browser} browser launched successfully.`
};

export { constants, Constants };