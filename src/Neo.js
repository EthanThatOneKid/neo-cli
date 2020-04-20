const path = require("path");
const { constants } = require("./maps/constants");
const { keywords } = require("./maps/keywords");
const { parse } = require('./parse');
const { types } = require("./maps/types");
const { errors } = require("./maps/errors");
const { warnings } = require("./maps/warnings");
const { Variable } = require("./Variable");
const {
  now,
  loadSource,
  loadGlobalScope,
  variablifyArguments,
  logMessage,
  beforeErrorShoot,
  getTypeObjectFromToken,
  getListValueFromSource,
  getFileExt
} = require('./helpers');

const Neo = async ({
  instructions: autoInstructions,
  root, page, scope = loadGlobalScope(),
  mode = constants.CLI_MODE,
  commands = mode === constants.CLI_MODE ? cliCommands : extCommands
}) => ({
  page, root, scope,
  ...commands, ...beforeErrorShoot,
  async run(instructions = autoInstructions) {
    for (const instruction of instructions) {
      instruction.arguments = variablifyArguments(instruction);
      const error = await this[instruction.token](instruction);
      if (error !== undefined) {
        logMessage(error);
        await this.beforeErrorShoot();
        return;
      }
    }
  }
});

Neo.load = async ({ path, page }) => {
  const { source, root, error } = await loadSource(path, constants.NEO_FILE_EXTENTION);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return await Neo.parse({ source, root, page });
};

Neo.parse = async ({ source, root, page }) => {
  const { instructions, error } = parse(source);
  if (error !== undefined) {
    logMessage(error);
    return;
  }
  return await Neo({ instructions, root, page });
};

const cliCommands = {

  //  ______     __     __     ______     __     ______
  // /\  __ \   /\ \  _ \ \   /\  __ \   /\ \   /\__  _\
  // \ \  __ \  \ \ \/ ".\ \  \ \  __ \  \ \ \  \/_/\ \/
  //  \ \_\ \_\  \ \__/".~\_\  \ \_\ \_\  \ \_\    \ \_\
  //   \/_/\/_/   \/_/   \/_/   \/_/\/_/   \/_/     \/_/
  async [keywords.AWAIT.token]() {
    const timeout = 3e5; // 30 second-long threshold
    const waitUntil = "load"; // Consider navigation to be finished when the `load` event is fired
    try {
      await this.page.waitForNavigation({ timeout, waitUntil });
    } catch (_) {
      return warnings.NAV_THRESH_BREAK(timeout);
    }
    return;
  },

  //  ______     __         __     ______     __  __    
  // /\  ___\   /\ \       /\ \   /\  ___\   /\ \/ /    
  // \ \ \____  \ \ \____  \ \ \  \ \ \____  \ \  _"-.  
  //  \ \_____\  \ \_____\  \ \_\  \ \_____\  \ \_\ \_\ 
  //   \/_____/   \/_____/   \/_/   \/_____/   \/_/\/_/ 
  async [keywords.CLICK.token]({ arguments }) {
    const [selVar] = arguments;
    const sel = selVar.make(this.scope);
    try {
      await this.page.click(sel);
    } catch (_) {
      return errors.ELEMENT_INEXISTENT(sel);
    }
    return;
  },

  //  _____     __     ______     __         ______     ______    
  // /\  __-.  /\ \   /\  __ \   /\ \       /\  __ \   /\  ___\   
  // \ \ \/\ \ \ \ \  \ \  __ \  \ \ \____  \ \ \/\ \  \ \ \__ \  
  //  \ \____-  \ \_\  \ \_\ \_\  \ \_____\  \ \_____\  \ \_____\ 
  //   \/____/   \/_/   \/_/\/_/   \/_____/   \/_____/   \/_____/   
  async [keywords.DIALOG.token]({ arguments }) {
    const [choiceVar] = arguments;
    const _choice = choiceVar.make(this.scope);
    const choice = [constants.ACCEPT, constants.DISMISS].includes(_choice)
      ? _choice
      : constants.ACCEPT;
    try {
      this.page.on("dialog", async dialog => await dialog[choice]());
    } catch (genericError) {
      return errors.GENERIC_ERROR(genericError);
    }
    return;
  },

  //  _____     ______    
  // /\  __-.  /\  __ \   
  // \ \ \/\ \ \ \ \/\ \  
  //  \ \____-  \ \_____\ 
  //   \/____/   \/_____/  
  async [keywords.DO.token]({ arguments, instructions }) {
    const [listVar, currentVarNameVar, indexVarNameVar] = arguments;
    const list = listVar.make(this.scope);
    console.log({ list, instructions})
    for (let i = 0; i < list.length; i++) {
      if (currentVarNameVar !== undefined) {
        const currentVarName = currentVarNameVar.make();
        this.scope[currentVarName] = Variable({ value: list[i], type: list.type });
      }
      if (indexVarNameVar !== undefined) {
        const indexVarName = indexVarNameVar.make();
        this.scope[indexVarName] = Variable({ value: i, type: getTypeObjectFromToken("int") });
      }
      await this.run({ instructions });
    }
  },

  //  ______     _____     __     ______  
  // /\  ___\   /\  __-.  /\ \   /\__  _\ 
  // \ \  __\   \ \ \/\ \ \ \ \  \/_/\ \/ 
  //  \ \_____\  \ \____-  \ \_\    \ \_\ 
  //   \/_____/   \/____/   \/_/     \/_/   
  async [keywords.EDIT.token]({ arguments }) {
    const [listVar, operationVar, elementVar] = arguments;
    const listName = listVar.make();
    const list = listVar.make(this.scope);
    const operation = operationVar.make(this.scope);
    if (operation === constants.LIST_PUSH) {
      if (elementVar !== undefined) {
        list.push(elementVar.make(this.scope));
        this.scope[listName] = list;
      } else {
        return warnings.LIST_EXPECTS_ELEMENT();
      }
    } else if (operation === constants.LIST_UNSHIFT) {
      if (elementVar !== undefined) {
        list.unshift(elementVar.make(this.scope));
        this.scope[listName] = list;
      } else {
        return warnings.LIST_EXPECTS_ELEMENT();
      }
    } else if (operation === constants.LIST_POP) {
      list.pop();
      this.scope[listName] = list;
    } else if (operation === constants.LIST_SHIFT) {
      list.shift();
      this.scope[listName] = list;
    } else {
      return errors.LIST_EXPECTS_OPERATION(operation);
    }
    return;
  },

  //  ______   __     ______     __         _____    
  // /\  ___\ /\ \   /\  ___\   /\ \       /\  __-.  
  // \ \  __\ \ \ \  \ \  __\   \ \ \____  \ \ \/\ \ 
  //  \ \_\    \ \_\  \ \_____\  \ \_____\  \ \____- 
  //   \/_/     \/_/   \/_____/   \/_____/   \/____/ 
  async [keywords.FIELD.token]({ arguments }) {
    const [selVar, inputVar] = arguments;
    const sel = selVar.make(this.scope);
    const input = inputVar.make(this.scope);
    try {
      await this.page.focus(sel);
      await this.page.keyboard.type(input);
    } catch (genericError) {
      return errors.GENERIC_ERROR(genericError);
    }
    return;
  },

  //  ______     ______     ______   ______    
  // /\  ___\   /\  __ \   /\__  _\ /\  __ \   
  // \ \ \__ \  \ \ \/\ \  \/_/\ \/ \ \ \/\ \  
  //  \ \_____\  \ \_____\    \ \_\  \ \_____\ 
  //   \/_____/   \/_____/     \/_/   \/_____/
  async [keywords.GOTO.token]({ arguments }) {
    const [urlVar] = arguments;
    const url = urlVar.make(this.scope);
    try {
      await this.page.goto(url);
    } catch (_) {
      return errors.NAVIGATION_ERROR(url)
    }
    return;
  },

  //  __         ______     ______     _____    
  // /\ \       /\  __ \   /\  __ \   /\  __-.  
  // \ \ \____  \ \ \/\ \  \ \  __ \  \ \ \/\ \ 
  //  \ \_____\  \ \_____\  \ \_\ \_\  \ \____- 
  //   \/_____/   \/_____/   \/_/\/_/   \/____/  
  async [keywords.LOAD.token]({ arguments }) {
    const [urlVar, typeStringVar, varNameVar] = arguments;
    const typeString = typeStringVar.make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = varNameVar.make();
    const url = urlVar.make(this.scope);
    const fileExt = getFileExt(url)
    const { source, error } = await loadSource(url, fileExt);
    if (error !== undefined) {
      return error;
    }
    this.scope[varName] = Variable({
      value: getListValueFromSource(source, type),
      type: getTypeObjectFromToken("list")
    });
    return;
  },

  //  __         ______     ______    
  // /\ \       /\  __ \   /\  ___\   
  // \ \ \____  \ \ \/\ \  \ \ \__ \  
  //  \ \_____\  \ \_____\  \ \_____\ 
  //   \/_____/   \/_____/   \/_____/   
  async [keywords.LOG.token]({ arguments }) {
    const [messageVar] = arguments;
    const token = constants.OK_TOKEN;
    const operableVariableForm = messageVar.make(this.scope);
    const message = messageVar.type.toString(operableVariableForm);
    logMessage({ token, message });
    return;
  },

  //  __    __     ______     __  __     ______     ______    
  // /\ "-./  \   /\  __ \   /\ \_\ \   /\  == \   /\  ___\   
  // \ \ \-./\ \  \ \  __ \  \ \____ \  \ \  __<   \ \  __\   
  //  \ \_\ \ \_\  \ \_\ \_\  \/\_____\  \ \_____\  \ \_____\ 
  //   \/_/  \/_/   \/_/\/_/   \/_____/   \/_____/   \/_____/   
  async [keywords.MAYBE.token]({ arguments, instructions }) {
    const [conditionVar] = arguments;
    const condition = conditionVar.make(this.scope);
    if (condition) {
      await this.run({ instructions });
    }
    return;
  },

  //  __   __     ______     ______    
  // /\ "-.\ \   /\  ___\   /\  __ \   
  // \ \ \-.  \  \ \  __\   \ \ \/\ \  
  //  \ \_\\"\_\  \ \_____\  \ \_____\ 
  //   \/_/ \/_/   \/_____/   \/_____/   
  async [keywords.NEO.token]({ arguments }) {
    const [pathVar] = arguments;
    const path = pathVar.make(this.scope);
    const neo = await Neo.load({ path, page: this.page });
    return await neo.run();
  },

  //  ______   ______     __  __     ______     ______    
  // /\  == \ /\  __ \   /\ \/\ \   /\  ___\   /\  ___\   
  // \ \  _-/ \ \  __ \  \ \ \_\ \  \ \___  \  \ \  __\   
  //  \ \_\    \ \_\ \_\  \ \_____\  \/\_____\  \ \_____\ 
  //   \/_/     \/_/\/_/   \/_____/   \/_____/   \/_____/
  async [keywords.PAUSE.token]({ arguments }) {
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const [_timeout] = arguments;
    const timeout = _timeout !== undefined ? _timeout.make(this.scope) : 0;
    return await pause(timeout);
  },
  
  //  ______     ______     ______     _____    
  // /\  == \   /\  ___\   /\  __ \   /\  __-.  
  // \ \  __<   \ \  __\   \ \  __ \  \ \ \/\ \ 
  //  \ \_\ \_\  \ \_____\  \ \_\ \_\  \ \____- 
  //   \/_/ /_/   \/_____/   \/_/\/_/   \/____/   
  async [keywords.READ.token]({ arguments }) {
    const [typeStringVar, varNameVar, selVar] = arguments;
    const typeString = typeStringVar.make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = varNameVar.make();
    const sel = selVar.make(this.scope);
    let value;
    try {
      resultValue = await this.page.$eval(sel, el => el.innerText);
    } catch (genericError) {
      return errors.GENERIC_ERROR(genericError);
    }
    this.scope[varName] = Variable({ value, type });
    return;
  },

  //  ______     ______     ______   ______     ______     ______  
  // /\  == \   /\  ___\   /\  == \ /\  ___\   /\  __ \   /\__  _\ 
  // \ \  __<   \ \  __\   \ \  _-/ \ \  __\   \ \  __ \  \/_/\ \/ 
  //  \ \_\ \_\  \ \_____\  \ \_\    \ \_____\  \ \_\ \_\    \ \_\ 
  //   \/_/ /_/   \/_____/   \/_/     \/_____/   \/_/\/_/     \/_/   
  async [keywords.REPEAT.token]({ arguments, instructions }) {
    const [maxRepeatsVar, selVar, testTextVar] = arguments;
    let targetSel, targetElement, testText,
        currentRepeats = 0, maxRepeats = maxRepeatsVar.make(this.scope);
    while (currentRepeats++ <= maxRepeats) {
      await this.run({ instructions });
      maxRepeats = maxRepeatsVar.make(this.scope);
      if (selVar !== undefined) {
        testText = testTextVar.make(this.scope);
        targetSel = targetSelVar.make(this.scope);
        targetElement = await this.page.$(targetSel);
        if (targetElement !== null) {
          const containsTestText = (await targetElement.innerText()).includes(testText);
          if (containsTestText) {
            break;
          }
        } else {
          return errors.ELEMENT_INEXISTENT(sel);
        }
      }
    }
    return;
  },

  //  ______     ______     __   __   ______    
  // /\  ___\   /\  __ \   /\ \ / /  /\  ___\   
  // \ \___  \  \ \  __ \  \ \ \'/   \ \  __\   
  //  \/\_____\  \ \_\ \_\  \ \__|    \ \_____\ 
  //   \/_____/   \/_/\/_/   \/_/      \/_____/  
  async [keywords.SAVE.token]({ arguments }) {
    return;
  },

  //  ______     ______     __         ______     ______     ______  
  // /\  ___\   /\  ___\   /\ \       /\  ___\   /\  ___\   /\__  _\ 
  // \ \___  \  \ \  __\   \ \ \____  \ \  __\   \ \ \____  \/_/\ \/ 
  //  \/\_____\  \ \_____\  \ \_____\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_____/   \/_____/   \/_____/   \/_____/     \/_/  
  async [keywords.SELECT.token]({ arguments }) {
    const [selVar, optionVar] = arguments;
    const sel = selVar.make(this.scope);
    const option = optionVar.make(this.scope);
    try {
      const isNotSelectElement = await this.page.$eval(sel, (el, value) => {
        if (el.hasOwnProperty("options") && el.hasOwnProperty("value")) {
          const optionIndex = value === undefined
            ? Math.floor((el.options.length - 1) * Math.random() + 1)
            : [...el.options].map(opt => opt.innerText).indexOf(value);
          el.value = `${optionIndex}`;
          return false;
        }
        return true;
      }, option);
      if (isNotSelectElement) {
        return errors.NOT_EXPECTED_ELEMENT_TAG("select");
      }
    } catch (_) {
      return errors.ELEMENT_INEXISTENT(sel);
    }
    return;
  },

  //  ______     __  __     ______     ______     ______  
  // /\  ___\   /\ \_\ \   /\  __ \   /\  __ \   /\__  _\ 
  // \ \___  \  \ \  __ \  \ \ \/\ \  \ \ \/\ \  \/_/\ \/ 
  //  \/\_____\  \ \_\ \_\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_/\/_/   \/_____/   \/_____/     \/_/
  async [keywords.SHOOT.token]({ arguments }) {
    const [__savePath] = arguments;
    const _savePath = __savePath !== undefined
      ? __savePath.make(this.scope)
      : `${constants.SHOOT_DEFAULT}_${now()}.png`;
    const savePath = path.join(this.root, _savePath);
    try {
      await this.page.screenshot({ path: savePath });
    } catch (genericError) {
      return errors.GENERIC_ERROR(genericError);
    }
  },

  //  ______   ______     ______     __   __   ______     __           
  // /\__  _\ /\  == \   /\  __ \   /\ \ / /  /\  ___\   /\ \          
  // \/_/\ \/ \ \  __<   \ \  __ \  \ \ \'/   \ \  __\   \ \ \____     
  //    \ \_\  \ \_\ \_\  \ \_\ \_\  \ \__|    \ \_____\  \ \_____\    
  //     \/_/   \/_/ /_/   \/_/\/_/   \/_/      \/_____/   \/_____/    
  async [keywords.TRAVEL.token]({ arguments }) {
    const [latStringVar, lonStringVar] = arguments;
    if (latStringVar !== undefined && lonStringVar !== undefined) {
      const latitude = Number(latStringVar.make(this.scope));
      const longitude = Number(lonStringVar.make(this.scope));
      await this.page._browserContext.setGeolocation({ latitude, longitude });
    }
    await this.page._browserContext.grantPermissions(["geolocation"]);
    return;
  },

  //  __   __   ______     ______     __     ______     ______     __         ______    
  // /\ \ / /  /\  __ \   /\  == \   /\ \   /\  __ \   /\  == \   /\ \       /\  ___\   
  // \ \ \'/   \ \  __ \  \ \  __<   \ \ \  \ \  __ \  \ \  __<   \ \ \____  \ \  __\   
  //  \ \__|    \ \_\ \_\  \ \_\ \_\  \ \_\  \ \_\ \_\  \ \_____\  \ \_____\  \ \_____\ 
  //   \/_/      \/_/\/_/   \/_/ /_/   \/_/   \/_/\/_/   \/_____/   \/_____/   \/_____/  
  async [keywords.VARIABLE.token]({ arguments }) {
    const [typeStringVar, varNameVar, valueVar] = arguments;
    const typeString = typeStringVar.make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = varNameVar.make();
    const value = valueVar.make(this.scope);
    this.scope[varName] = Variable({ value, type });
    return;
  }

};

const extCommands = {};

module.exports = { Neo };