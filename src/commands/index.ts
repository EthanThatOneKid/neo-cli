import { VariableType } from '../Variable';
import { ClassifiedMessage } from '../maps/helpers';

interface Instruction {
  keyword: string,
  inlineArguments: CommandArgument[]
}

interface CommandArgument {
  inlineArguments?: (VariableType | VariableType[])[],
  instructions?: Instruction[],
  Neo?: any
}

type Command = (c: CommandArgument) => Promise<ClassifiedMessage | undefined>;

interface Commands {
  [k: string]: Command
}

export {
  Instruction,
  CommandArgument,
  Command,
  Commands
};