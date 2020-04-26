import path from 'path';
import { constants } from './maps/constants';
import { keywords } from './maps/keywords';
import { types } from './maps/types';
import errors from './maps/errors';
import warnings from './maps/warnings';
import parse from './parse';
import Variable from './Variable';
import {
  now,
  loadSource,
  loadGlobalScope,
  variablifyArguments,
  logMessage,
  beforeErrorShoot,
  getTypeObjectFromToken,
  getListValueFromSource,
  getFileExt
} from './helpers';

const Neo = async ({
  instructions: autoInstructions,
  root, page, scope = loadGlobalScope()
}) => ({
  page, root, scope,
  ...commands, ...beforeErrorShoot,
  async run(instructions = autoInstructions) {
    for (const instruction of instructions) {
      instruction.inlineArguments = variablifyArguments(instruction);
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

const commands = {

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
      return warnings.NAV_THRESH_BREAK(String(timeout));
    }
    return;
  },

  //  ______     __         __     ______     __  __    
  // /\  ___\   /\ \       /\ \   /\  ___\   /\ \/ /    
  // \ \ \____  \ \ \____  \ \ \  \ \ \____  \ \  _"-.  
  //  \ \_____\  \ \_____\  \ \_\  \ \_____\  \ \_\ \_\ 
  //   \/_____/   \/_____/   \/_/   \/_____/   \/_/\/_/ 
  async [keywords.CLICK.token]({ inlineArguments }) {
    const [selVar] = inlineArguments;
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
  async [keywords.DIALOG.token]({ inlineArguments }) {
    const [choiceVar] = inlineArguments;
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
  async [keywords.DO.token]({ inlineArguments, instructions }) {
    const [listVar, currentVarNameVar, indexVarNameVar] = inlineArguments;
    const { items, type } = listVar.make(this.scope);
    for (let i = 0; i < items.length; i++) {
      if (currentVarNameVar !== undefined) {
        const currentVarName = currentVarNameVar.make();
        this.scope[currentVarName] = Variable({ value: items[i], type });
      }
      if (indexVarNameVar !== undefined) {
        const indexVarName = indexVarNameVar.make();
        this.scope[indexVarName] = Variable({ value: i, type: types.INTEGER });
      }
      await this.run(instructions);
    }
  },

  //  ______     _____     __     ______  
  // /\  ___\   /\  __-.  /\ \   /\__  _\ 
  // \ \  __\   \ \ \/\ \ \ \ \  \/_/\ \/ 
  //  \ \_____\  \ \____-  \ \_\    \ \_\ 
  //   \/_____/   \/____/   \/_/     \/_/   
  async [keywords.EDIT.token]({ inlineArguments }) {
    const [listVar, operationVar, elementVar] = inlineArguments;
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

  //  ______     __  __     ______   ______     ______     ______     ______  
  // /\  ___\   /\_\_\_\   /\__  _\ /\  == \   /\  __ \   /\  ___\   /\__  _\ 
  // \ \  __\   \/_/\_\/_  \/_/\ \/ \ \  __<   \ \  __ \  \ \ \____  \/_/\ \/ 
  //  \ \_____\   /\_\/\_\    \ \_\  \ \_\ \_\  \ \_\ \_\  \ \_____\    \ \_\ 
  //   \/_____/   \/_/\/_/     \/_/   \/_/ /_/   \/_/\/_/   \/_____/     \/_/   
  async [keywords.EXTRACT.token]({ inlineArguments }) {
    const nonExtractableTypeTokens = [types.INTEGER.token, types.BOOLEAN.token];
    const [newVarNameVar, oldVarNameVar, keyVar, endKeyVar] = inlineArguments;
    const newVarName = newVarNameVar.make();
    const oldVarName = oldVarNameVar.make();
    const key = keyVar.make(this.scope);
    const oldVar = this.scope[oldVarName];
    if (!nonExtractableTypeTokens.includes(oldVar.type.token)) {
      if (oldVar.type.token === types.COOKIE) {
        if (oldVar.value.hasOwnProperty(key)) {
          this.scope[newVarName] = Variable({
            value: types.TEXT.make(oldVar.value[key]),
            type: types.TEXT
          });
        } else {
          return errors.BAD_EXTRACTION_KEY(oldVarName, types.COOKIE.token, key);
        }
      } else {
        const index = types.INTEGER.make(key);
        if (oldVar.type.token === types.LIST.token) {
          if (endKeyVar !== undefined) {
            const endIndex = types.INTEGER.make(endKeyVar.make(this.scope));
            this.scope[newVarName] = Variable({
              value: {
                items: oldVar.value.items.slice(index, endIndex),
                type: oldVar.value.type
              },
              type: types.LIST
            });
          } else if (oldVar.value.items.hasOwnProperty(index)) {
            this.scope[newVarName] = Variable({
              value: oldVar.value.items[index],
              type: oldVar.value.type
            });
          } else {
            return errors.BAD_EXTRACTION_KEY(oldVarName, types.LIST.token, String(index));
          }
        } else {
          const extractableText = oldVar.make(this.scope);
          if (endKeyVar !== undefined) {
            const endIndex = types.INTEGER.make(endKeyVar.make(this.scope));
            this.scope[newVarName] = Variable({
              value: extractableText.slice(index, endIndex),
              type: oldVar.type
            });
          } else if (extractableText.hasOwnProperty(index)) {
            this.scope[newVarName] = Variable({
              value: extractableText[index],
              type: types.TEXT
            });
          } else {
            return errors.BAD_EXTRACTION_KEY(oldVarName, oldVar.type, String(index));
          }
        }
      }
    } else {
      return errors.NON_EXTRACTABLE_TYPE(oldVarName, oldVar.type.token);
    }
  },

  //  ______   __     ______     __         _____    
  // /\  ___\ /\ \   /\  ___\   /\ \       /\  __-.  
  // \ \  __\ \ \ \  \ \  __\   \ \ \____  \ \ \/\ \ 
  //  \ \_\    \ \_\  \ \_____\  \ \_____\  \ \____- 
  //   \/_/     \/_/   \/_____/   \/_____/   \/____/ 
  async [keywords.FIELD.token]({ inlineArguments }) {
    const [selVar, inputVar] = inlineArguments;
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
  async [keywords.GOTO.token]({ inlineArguments }) {
    const [urlVar] = inlineArguments;
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
  async [keywords.LOAD.token]({ inlineArguments }) {
    const [urlVar, typeStringVar, varNameVar] = inlineArguments;
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
      type: types.LIST
    });
    return;
  },

  //  __         ______     ______    
  // /\ \       /\  __ \   /\  ___\   
  // \ \ \____  \ \ \/\ \  \ \ \__ \  
  //  \ \_____\  \ \_____\  \ \_____\ 
  //   \/_____/   \/_____/   \/_____/   
  async [keywords.LOG.token]({ inlineArguments }) {
    const [messageVar] = inlineArguments;
    const token = constants.OK_TOKEN;
    const operableVariableForm = messageVar.make(this.scope);
    // console.log({messageVar})
    // console.log({messageVar,operableVariableForm})
    const message = messageVar.type.toString(operableVariableForm);
    logMessage({ token, message });
    return;
  },

  //  __    __     ______     __  __     ______     ______    
  // /\ "-./  \   /\  __ \   /\ \_\ \   /\  == \   /\  ___\   
  // \ \ \-./\ \  \ \  __ \  \ \____ \  \ \  __<   \ \  __\   
  //  \ \_\ \ \_\  \ \_\ \_\  \/\_____\  \ \_____\  \ \_____\ 
  //   \/_/  \/_/   \/_/\/_/   \/_____/   \/_____/   \/_____/   
  async [keywords.MAYBE.token]({ inlineArguments, instructions }) {
    const [conditionVar] = inlineArguments;
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
  async [keywords.NEO.token]({ inlineArguments }) {
    const [pathVar] = inlineArguments;
    const path = pathVar.make(this.scope);
    const neo = await Neo.load({ path, page: this.page });
    return await neo.run();
  },

  //  ______   ______     __  __     ______     ______    
  // /\  == \ /\  __ \   /\ \/\ \   /\  ___\   /\  ___\   
  // \ \  _-/ \ \  __ \  \ \ \_\ \  \ \___  \  \ \  __\   
  //  \ \_\    \ \_\ \_\  \ \_____\  \/\_____\  \ \_____\ 
  //   \/_/     \/_/\/_/   \/_____/   \/_____/   \/_____/
  async [keywords.PAUSE.token]({ inlineArguments }) {
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const [_timeout] = inlineArguments;
    const timeout = _timeout !== undefined ? _timeout.make(this.scope) : 0;
    return await pause(timeout);
  },
  
  //  ______     ______     ______     _____    
  // /\  == \   /\  ___\   /\  __ \   /\  __-.  
  // \ \  __<   \ \  __\   \ \  __ \  \ \ \/\ \ 
  //  \ \_\ \_\  \ \_____\  \ \_\ \_\  \ \____- 
  //   \/_/ /_/   \/_____/   \/_/\/_/   \/____/   
  async [keywords.READ.token]({ inlineArguments }) {
    const [typeStringVar, varNameVar, selVar] = inlineArguments;
    const typeString = typeStringVar.make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = varNameVar.make();
    const sel = selVar.make(this.scope);
    let value;
    try {
      value = await this.page.$eval(sel, el => el.innerText);
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
  async [keywords.REPEAT.token]({ inlineArguments, instructions }) {
    const [maxRepeatsVar, selVar, testTextVar] = inlineArguments;
    let targetSel, targetElement, testText,
        currentRepeats = 0, maxRepeats = maxRepeatsVar.make(this.scope);
    while (currentRepeats++ <= maxRepeats) {
      await this.run({ instructions });
      maxRepeats = maxRepeatsVar.make(this.scope);
      if (selVar !== undefined) {
        testText = testTextVar.make(this.scope);
        targetSel = selVar.make(this.scope);
        targetElement = await this.page.$(targetSel);
        if (targetElement !== null) {
          const containsTestText = (await targetElement.innerText()).includes(testText);
          if (containsTestText) {
            break;
          }
        } else {
          return errors.ELEMENT_INEXISTENT(targetSel);
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
  async [keywords.SAVE.token]({ inlineArguments }) {
    return;
  },

  //  ______     ______     __         ______     ______     ______  
  // /\  ___\   /\  ___\   /\ \       /\  ___\   /\  ___\   /\__  _\ 
  // \ \___  \  \ \  __\   \ \ \____  \ \  __\   \ \ \____  \/_/\ \/ 
  //  \/\_____\  \ \_____\  \ \_____\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_____/   \/_____/   \/_____/   \/_____/     \/_/  
  async [keywords.SELECT.token]({ inlineArguments }) {
    const [selVar, optionVar] = inlineArguments;
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
  async [keywords.SHOOT.token]({ inlineArguments }) {
    const [__savePath] = inlineArguments;
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
  async [keywords.TRAVEL.token]({ inlineArguments }) {
    const [latStringVar, lonStringVar] = inlineArguments;
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
  async [keywords.VARIABLE.token]({ inlineArguments }) {
    const [typeStringVar, varNameVar, valueVar] = inlineArguments;
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

export default Neo;