const { types } = require('./maps/types');
const { errors } = require('./maps/errors');
const { warnings } = require('./maps/warnings');
const { keywords } = require('./maps/keywords');
const { constants } = require('./maps/constants');

const NEO_MAPS = { types, errors, warnings, keywords, constants };

// for each statement:
//   const err = determineViolation(keywords.CLICK, args);
//   if (err === undefined || err.type === constants.WARNING_TOKEN) {
//     // apply default values to args as needed
//     const isPageEvaluation = evaluations.hasOwnProperty(keywords.CLICK.token);
//     if (isPageEvaluation) {
//       const result = page.evaluate(evaluations[keywords.CLICK.token], args);
//       // check if result.type is warning or error or expected value
//     }
//     // carry on with interaction
//   }
//   return err;

const evaluations = {

  [keywords.CLICK.token](args, N = NEO_MAPS) { 
      const [selector] = args;
      const el = selector.make();
      return el !== null
        ? el.click()
        : N.errors.ELEMENT_INEXISTENT(selector.value);
  },

  [keywords.DIALOG.token](args, N = NEO_MAPS) {
    const [instruction] = args;
    ([
      N.constants.CONFIRM_BOX,
      N.constants.PROMPT_BOX,
      N.constants.ALERT_BOX
    ]).forEach(dialogBox => {
      window[dialogBox] = instruction === N.constants.ACCEPT
        ? () => true
        : instruction === N.constants.DISMISS
          ? () => false
          : () => instruction;
    });
    return;
  }

};

module.exports = { evaluations };