const fs = require('fs');
const { keywords } = require('../lib/maps/keywords');
const { constants } = require('../lib/maps/constants');

const toc = [];
const docs = [];
const encapsulatedKeywords = new Set([]);

const introduction = `
> Welcome to the official Neo language API documentation.

## Global Variables 🌎
There are some global variables accessible right out of the box.
\`DATE\` provides a very readable date of type \`text\`.
\`CWD\` provides the current working directory of type \`url\` from which the Neo script was ran.
\`NEO_...\`: Any variables defined in the \`.env\` file that are prefaced with "NEO_" will be included as a global variable.

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

## .env 🔐
A .env file (literally named ".env") is a file that contains secret information that should not be committed to a git repository.
The contents of the file should look like this:
\`\`\`
SECRET_USERNAME=YOUR_NEOPETS_USERNAME_HERE
SECRET_PASSWORD=YOUR_NEOPETS_PASSWORD_HERE
\`\`\`
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
  toc.push(`* [${name}](#${name})`);
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
      "\t\~\~ Block of Code",
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
  introduction,
  "## Keyword Table of Contents",
  toc.join(constants.NEW_LINE),
  "",
  "## API",
  docs.join(constants.NEW_LINE),
  "---",
  "Generated with 💖 by EthanThatOneKid"
].join(constants.NEW_LINE);

fs.writeFileSync("./docs/API.md", document);