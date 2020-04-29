const fs = require('fs');
const { types } = require('../lib/maps/types');
const { keywords } = require('../lib/maps/keywords');
const { constants } = require('../lib/maps/constants');

const title = "# Neo Documentation";
const toc = [];
const nativeTypes = [];
const docs = [];
const encapsulatedKeywords = new Set([]);

for (const key of keywords) {
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
  docs.push(`## ${name}`);
  const exampleArgs = arguments.map((type, i) => {
    const { name: argName } = argDescriptions[i];
    const requiredMarker = required[i] ? "*" : "";
    return `${argName}: ${type.token}${requiredMarker}`;
  }).join(", ");
  if (encapsulator === undefined) {
    docs.push(`Usage: \`${token} ${exampleArgs}\``);
  } else {
    docs.push(
      "Usage: \`\`\`",
      `${token}`,
      "\t...",
      `${encapsulator} ${exampleArgs}`,
      "\`\`\`"
    );
  }
  docs.push(`> ${description}`, "", "Arguments:");
  docs.push(...arguments.map((type, i) => {
    const { name: argName, description: argDescription } = argDescriptions[i];
    const requiredMarker = required[i] ? " (*required*)" : "";
    return `1. ${argName}: ${type.token}${requiredMarker}... ${argDescription}`;
  }));
}

const document = [
  title,
  toc.join(constants.NEW_LINE),
  docs.join(constants.NEW_LINE)
].join(constants.NEW_LINE);

fs.writeFileSync("../docs/API.md")