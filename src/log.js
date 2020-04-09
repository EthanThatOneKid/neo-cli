const chalk = require("chalk");
const { errors } = require("./maps/errors");
const { constants } = require("./maps/constants");

const log = ({ type, message }) => {
  if (type === constants.ERROR_TOKEN) {
    console.log();
  } else if (type === constants.WARNING_TOKEN) {
    console.log();
  } else {
    // error: unexpected error type ${type} with message '${message}'
  }
};