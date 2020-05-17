import { constants } from './maps/constants';
import { keywords } from './maps/keywords';
import { types } from './maps/types';
import parse from './parse';
import Variable from './Variable';
import { defaultCommands } from './commands/defaultCommands';
import {
  loadGlobalScope,
  variablifyArguments,
  logMessage,
  loadSourceFromURL
} from './helpers';

const Neo = (commands = { ...defaultCommands }) => async ({
  instructions: autoInstructions,
  root, page, scope = loadGlobalScope(),
  beforeErrorShot = Buffer.from(""),
  sourceLoader = loadSourceFromURL
}) => ({

  page, root, scope,
  beforeErrorShot, sourceLoader,

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

Neo.load = async ({ path, page, commands, sourceLoader }) => {
  const { source, root, error } = await sourceLoader(path, constants.NEO_FILE_EXTENTION);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return await Neo.parse({ source, root, page, commands, sourceLoader });
};

Neo.parse = async ({ source, root, page, commands, sourceLoader }) => {
  const { instructions, error } = parse(source);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return await Neo(commands)({ instructions, root, page, sourceLoader });
};

export default Neo;