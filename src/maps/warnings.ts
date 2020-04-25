// import keywords from './keywords';
// import types from './types';
import constants from './constants';
import { classifyMessageMap } from './helpers';

const warnings = classifyMessageMap(constants.WARNING_TOKEN, {
  BAD_UNECESSARY_ARGUMENT_TYPE: (badType, argIndex) => `Incorrect type ${badType} used as unecessary argument #${argIndex}; resorted to default.`,
  UNEXPECTED_MESSAGE_TYPE: (type, message) => `Unexpected message type ${type} with message '${message}'`,
  NAV_THRESH_BREAK: (thresh) => `Page navigation broke ${thresh}s threshold.`,
  NO_SUCH_SELECTOR: (sel, cmd) => `No such element with selector '${sel}' in ${cmd} attempt.`
});

export default warnings;