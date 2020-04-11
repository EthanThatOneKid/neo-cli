const { types } = require('./maps/types');
const { errors } = require('./maps/errors');
const { warnings } = require('./maps/warnings');
const { keywords } = require('./maps/keywords');
const { constants } = require('./maps/constants');

const NEO_MAPS = { types, errors, warnings, keywords, constants };

const evaluations = {

  [keywords.CLICK.token](args, N = NEO_MAPS) {
    const [selector] = args;
    let el;
    try {
      el = document.querySelector(selector);
      el.click();
    } catch (_) {
      return _;
      return N.errors.ELEMENT_INEXISTENT(selector);
    }
  },

  [keywords.DIALOG.token](args, N = NEO_MAPS) {
    const [instruction] = args;
    const newDialog = instruction === N.constants.ACCEPT
      ? () => true
      : instruction === N.constants.DISMISS
        ? () => false
        : () => instruction;
    ([N.constants.CONFIRM_BOX, N.constants.PROMPT_BOX, N.constants.ALERT_BOX])
      .forEach(dialogBox => window[dialogBox] = newDialog);
    return;
  }

};

module.exports = { evaluations };