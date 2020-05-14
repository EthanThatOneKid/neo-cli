const fs = require('fs');
const { keywords } = require('../lib/maps/keywords');
const { constants } = require('../lib/maps/constants');

const toc = [];
const docs = [];
const encapsulatedKeywords = new Set([]);

const reference = `
## Global Variables 🌎
There are some global variables accessible right out of the box.
\`DATE\` provides a very readable date of type \`text\`.
\`CWD\` provides the current working directory of type \`url\` from which the Neo script was ran.

## Native Types ⛄
There are multiple types natively accessible in the Neo language.
* \`int\` holds an integer numeric value.
* \`text\` holds a string alphanumeric value.
* \`boo\` holds a boolean; a true or false condition.
* \`url\` holds text for an absolute URL or path on the current system.
* \`sel\` holds text for a CSS selector.
* \`list\` holds array data for any of the above types.

## Commenting 🙈
To comment in a Neo file (text that will be ignored by the compiler), simply type \`\~\~\`.
The following text between the tildas and the next line break will be ignored by the compiler.
The reason why tildas were chosen to be the comment token of the Neo language is because they symbolize good vibes 🤙.

## CSS Selectors 🎯
CSS Selectors are strings of text used to target certain HTML elements.
In the case of this language, they are used to select an element to be operated on or read.
`;

for (const key of Object.keys(keywords)) {
  const {
    token,
    arguments,
    required,
    encapsulator,
    argDescriptions,
    description,
    safe
  } = keywords[key];
  if (!safe || encapsulatedKeywords.has(token)) {
    continue;
  }
  let name;
  if (encapsulator === undefined) {
    name = token;
  } else {
    name = `${token}/${encapsulator}`;
    encapsulatedKeywords.add(encapsulator);
  }
  toc.push(`* [${name}](#${name.replace("/", "")})`);
  docs.push(`### \`${name}\``);
  const exampleArgs = arguments.map((type, i) => {
    const { name: argName } = argDescriptions[i];
    const requiredMarker = required[i] ? "*" : "";
    return `[${argName}: ${type.token}]${requiredMarker}`;
  }).join(", ");
  if (encapsulator === undefined) {
    docs.push(`Usage: \`${token} ${exampleArgs}\``);
  } else {
    docs.push(
      "Usage:",
      "\`\`\`",
      `${token}`,
      "  \~\~ Block",
      "  \~\~ of",
      "  \~\~ Code",
      `${encapsulator} ${exampleArgs}`,
      "\`\`\`"
    );
  }
  docs.push(`> ${description}`, "", "Arguments:");
  docs.push(...arguments.map((type, i) => {
    const { name: argName, description: argDescription } = argDescriptions[i];
    const requiredMarker = required[i] ? " (*required*)" : "";
    return `1. \`${argName}\`: \`${type.token}\`${requiredMarker}... ${argDescription}`;
  }));
  docs.push("", "---", "");
}

const document = [
  "# Neo Documentation 🐱‍👤",
  "> Welcome to the official Neo language API documentation.",
  "## Keyword Table of Contents 🤓",
  toc.join(constants.NEW_LINE),
  "",
  "## API 🧠",
  docs.join(constants.NEW_LINE),
  reference,
  "Generated with 💖 by EthanThatOneKid"
].join(constants.NEW_LINE);

fs.writeFileSync("./docs/API.md", document);