import { constants } from './maps/constants';
import { keywords } from './maps/keywords';
import { types } from './maps/types';
import parse from './parse';
import Variable from './Variable';
import { defaultCommands } from './commands';
import {
  loadSource,
  loadGlobalScope,
  variablifyArguments,
  logMessage
} from './helpers';

const Neo = (commands = { ...defaultCommands }) => async ({
  instructions: autoInstructions,
  root, page, scope = loadGlobalScope(),
  beforeErrorShot = Buffer.from("")
}) => ({

  page, root, scope, beforeErrorShot,

  async beforeErrorShoot() {
    const screenshotPath = `${constants.BEFORE_ERROR_NAME}_${+new Date()}.png`;
    const instruction = {
      keyword: keywords.SHOOT.token,
      inlineArguments: [Variable({ value: screenshotPath, type: types.URL })]
    };
    await this[keywords.SHOOT.token](instruction);
  },

  async run(instructions = autoInstructions) {
    for (const instruction of instructions) {
      const variablifiedInstruction = variablifyArguments(this.scope, instruction);
      if (variablifiedInstruction.token === keywords.NEO.token) {
        variablifiedInstruction["Neo"] = Neo;
      }
      const error = await this[variablifiedInstruction.token](variablifiedInstruction);
      if (error !== undefined) {
        logMessage(error);
        await this.beforeErrorShoot();
        return;
      }
    }

  },
  
  ...commands

});

Neo.load = async ({ path, page, commands }) => {
  const { source, root, error } = await loadSource(path, constants.NEO_FILE_EXTENTION);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return await Neo.parse({ source, root, page, commands });
};

Neo.parse = async ({ source, root, page, commands }) => {
  const { instructions, error } = parse(source);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return await Neo(commands)({ instructions, root, page });
};

export default Neo;