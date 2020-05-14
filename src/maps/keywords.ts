import { types, Type } from './types';
import { constants } from './constants';

interface Keyword {
  token: string,
  arguments: Type[],
  required?: boolean[],
  encapsulator?: string,
  argDescriptions?: {
    name: string,
    description: string
  }[],
  description?: string,
  safe?: boolean
}

interface Keywords {
  [keywordKey: string]: Keyword
}

const keywords: Keywords = {
  AWAIT: {
    token: "await",
    arguments: [],
    required: [],
    argDescriptions: [],
    description: "Waits for page navigation.",
    safe: false
  },
  CLICK: {
    token: "click",
    arguments: [types.SELECTOR],
    required: [true],
    argDescriptions: [{
      name: "BUTTON_SELECTOR",
      description: "CSS selector representing page element intended to be clicked."
    }],
    description: "Clicks an element on the page.",
    safe: true
  },
  DIALOG: {
    token: "dialog",
    arguments: [types.TEXT],
    required: [false],
    argDescriptions: [{
      name: "CHOICE",
      description: `Can either be \`${constants.ACCEPT}\` or \`${constants.DISMISS}\`. Defaults to \`${constants.ACCEPT}\`.`
    }],
    description: "Accepts or dismisses future dialog evocations.",
    safe: true
  },
  DO: {
    token: "do",
    arguments: [types.LIST, types.TEXT, types.TEXT],
    required: [true, false, false],
    argDescriptions: [{
      name: "LOOP_LIST",
      description: "Name of list variable to be interpolated."
    }, {
      name: "CUR_ITEM_NAME",
      description: "Variable name dedicated to the current item in the list per interpolation."
    }, {
      name: "CUR_INDEX_NAME",
      description: "Variable name dedicated to the current index in the list per interpolation."
    }],
    description: "Loops through the contents of a list variable.",
    encapsulator: "foreach",
    safe: true
  },
  FOREACH: {
    token: "foreach",
    arguments: []
  },
  EDIT: {
    token: "edit",
    arguments: [types.TEXT, types.TEXT, types.TEXT],
    required: [true, true, false],
    argDescriptions: [{
      name: "EDIT_LIST",
      description: "Name of list variable to be operated on."
    }, {
      name: "OPERATION",
      description: "Can only be \`push\`, \`pop\`, \`shift\`, or \`unshift\`. Push appends to the back, pop removes from the back, shift removes from the front, and unshift appends to the front."
    }, {
      name: "APPENDATION",
      description: "Item to be added to the list."
    }],
    description: "Manipulates the contents of a list by adding to the front, removing from the front, adding to the end, and removing from the end.",
    safe: true
  },
  EXTRACT: {
    token: "extract",
    arguments: [types.TEXT, types.TEXT, types.TEXT, types.TEXT],
    required: [true, true, true, false],
    argDescriptions: [{
      name: "NEW_VARIABLE_NAME",
      description: "Name of the new variable being created."
    }, {
      name: "REFERENCE_VARIABLE",
      description: "Name of the variable being extracted from. Cannot be of types int or boo."
    }, {
      name: "INDEX",
      description: "Position in the variable at which to extract a new value from."
    }, {
      name: "END_INDEX",
      description: "Position at which to end the extraction. If this argument is given, the new variable will be a slice of the reference variable from the index given in the previous argument to the one in this argument."
    }],
    description: "Extracts a value or a slice out of a list-y typed variable.",
    safe: true
  },
  FIELD: {
    token: "field",
    arguments: [types.SELECTOR, types.TEXT],
    required: [true, true],
    argDescriptions: [{
      name: "INPUT_SELECTOR",
      description: "CSS selector representing page element intended to be populated."
    }, {
      name: "INPUT_VALUE",
      description: "Value being populated into the given input field."
    }],
    description: "Populates an element on the page.",
    safe: true
  },
  GOTO: {
    token: "goto",
    arguments: [types.URL],
    required: [true],
    argDescriptions: [{
      name: "URL_TO_GO",
      description: "The URL that the page shall navigate to."
    }],
    description: "Navigates to a new website.",
    safe: true
  },
  LOAD: {
    token: "load",
    arguments: [types.URL, types.TEXT, types.TEXT],
    required: [true, false],
    argDescriptions: [{
      name: "SOURCE_LOCATION",
      description: "URL or path to file containing list data. The file must either be a one-dimensional JSON list or a text file with the items separated by line breaks."
    }, {
      name: "INTENDED_TYPE",
      description: "The type token of the list elements. For example, a list of \`int\`s."
    }, {
      name: "LIST_VAR_NAME",
      description: "The variable name that is taking on the value of the list."
    }],
    description: "Loads list contents from an extraneous file.",
    safe: true
  },
  LOG: {
    token: "log",
    arguments: [types.REST],
    required: [true],
    argDescriptions: [{
      name: "MESSAGE",
      description: "Message to be logged in the command-line interface."
    }],
    description: "Logs a message to the command-line interface.",
    safe: true
  },
  MAKE: {
    token: "make",
    arguments: [types.TEXT, types.REST],
    required: [true],
    argDescriptions: [{
      name: "INSTRUCTION_LIST_NAME",
      description: "Name of instruction-filled list variable to be assigned to."
    }],
    description: "Assigns a list of instructions as a variable.",
    encapsulator: "finish",
    safe: true
  },
  FINISH: {
    token: "finish",
    arguments: []
  },
  MAYBE: {
    token: "maybe",
    arguments: [types.BOOLEAN],
    required: [true],
    encapsulator: "if",
    argDescriptions: [{
      name: "CONDITION",
      description: "If the condition is truth-y, then the internal commands will be ran."
    }],
    description: "Allows internal commands to run hinging on a condition. This is the language's 'if/then' solution.",
    safe: true
  },
  IF: {
    token: "if",
    arguments: []
  },
  NEO: {
    token: "neo",
    arguments: [types.URL],
    required: [true],
    argDescriptions: [{
      name: "SOURCE_LOCATION",
      description: "URL or path or directory to Neo file. If given a directory, every Neo file will be ran. If given a URL or path, the retrieved Neo file will be ran."
    }],
    description: "Runs external Neo files. This is the language's modularization solution.",
    safe: true
  },
  PAUSE: {
    token: "pause",
    arguments: [types.INTEGER],
    required: [false],
    argDescriptions: [{
      name: "TIMEOUT",
      description: "Timeout for how long to pause the script in milliseconds."
    }],
    description: "Pauses the script from continuing for a given amount of milliseconds.",
    safe: true
  },
  PLAY: {
    token: "play",
    arguments: [types.LIST, types.REST],
    required: [true],
    argDescriptions: [{
      name: "INSTRUCTION_LIST",
      description: "List of instructions determined by the \`make\` keyword."
    }, {
      name: "ARGUMENT...",
      description: "Applies the arguments to the list of instructions."

    }],
    description: "'Plays' the instructions and applies the arguments.",
    safe: true
  },
  READ: {
    token: "read",
    arguments: [types.TEXT, types.TEXT, types.SELECTOR],
    required: [true, true],
    argDescriptions: [{
      name: "INTENDED_TYPE",
      description: "Type to be assumed when value is stored as a variable."
    }, {
      name: "NEW_VARIABLE_NAME",
      description: "Name of variable being attributed the read value."
    }, {
      name: "CONTENT_SELECTOR",
      description: "CSS selector of representing page element that shall be read from."
    }],
    description: "Stores the text content of a page element as a variable.",
    safe: true
  },
  REPEAT: {
    token: "rep",
    // TODO: add 2 more args: variable name for current index and variable name for current text content
    arguments: [types.INTEGER, types.SELECTOR, types.TEXT],
    required: [true, false, false],
    encapsulator: "until",
    argDescriptions: [{
      name: "MAXIMUM_REPEATS",
      description: "The maximum number of loops before deciding to continue."
    }, {
      name: "WATCHED_SELECTOR",
      description: "CSS selector representing page element being checked against."
    }, {
      name: "TEST_TEXT",
      description: "Text that the targeted page element's text content is checked against."
    }, {
      name: "CUR_EL_VAL_NAME",
      description: "The current text content of the targeted page element."
    }, {
      name: "CUR_INDEX_NAME",
      description: "The current interpolation being ran."
    }],
    description: "Repeats a block of code until a targeted page element's text content matches (or includes) a given text value.",
    safe: true
  },
  UNTIL: {
    token: "until",
    arguments: []
  },
  SAVE: {
    token: "sav",
    arguments: [types.URL, types.LIST],
    required: [true, true],
    argDescriptions: [{
      name: "SAVE_LOCATION",
      description: "Path of file to be appended or created. If the file has a JSON extention, the values will be appended to the JSON, but otherwise will be appended with line breaks as deliminators."
    }, {
      name: "SAVED_LIST",
      description: "List of items to be saved in file form."
    }],
    description: "Saves (or appends) value of a list as a file.",
    safe: true
  },
  SELECT: {
    token: "select",
    arguments: [types.SELECTOR, types.TEXT],
    required: [true, false],
    argDescriptions: [{
      name: "SELECT_SELECTOR",
      description: "CSS selector representing an element on the page with a tag of \`select\`."
    }, {
      name: "OPTION_VALUE",
      description: "The option in the \`select\` element to be selected."
    }],
    description: "Selects an option from a \`select\` page element",
    safe: true
  },
  SHOOT: {
    token: "shoot",
    arguments: [types.URL],
    required: [false],
    argDescriptions: [{
      name: "SAVE_LOCATION",
      description: "Path for image file to be saved."
    }],
    description: "Takes a screenshot of the current page.",
    safe: true
  },
  TRAVEL: {
    token: "trav",
    arguments: [types.TEXT, types.TEXT],
    required: [false, false],
    argDescriptions: [{
      name: "LATITUDE",
      description: "Latitude coordinate."
    }, {
      name: "LONGITUDE",
      description: "Longitude coordinate."
    }],
    description: "Grants geolocation permissions and sets the desired location.",
    safe: false
  },
  VARIABLE: {
    token: "var",
    arguments: [types.TEXT, types.TEXT, types.TEXT],
    required: [true, true, true],
    argDescriptions: [{
      name: "INTENDED_TYPE",
      description: "Type for variable value to take on."
    }, {
      name: "VAR_NAME",
      description: "Name for variable to be called under."
    }, {
      name: "VAR_VALUE",
      description: "Raw value for variable to take on initially."
    }],
    description: "Sets a new variable in the scope of the Neo script.",
    safe: true
  }
};

export { keywords, Keyword, Keywords };