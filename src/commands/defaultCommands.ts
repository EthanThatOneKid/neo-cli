import path from 'path';
import { keywords } from '../maps/keywords';
import { constants } from '../maps/constants';
import { types } from '../maps/types';
import warnings from '../maps/warnings';
import errors from '../maps/errors';
import Variable, { VariableType } from '../Variable';
import {
  now,
  logMessage,
  getTypeObjectFromToken,
  getListValueFromSource,
  getFileExt,
  getArgumentsFromArgTypesAndNames
} from '../helpers';
import { Commands } from '.';

export const defaultCommands: Commands = {

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
    } catch {
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
    const sel = (selVar as VariableType).make(this.scope);
    try {
      await this.page.click(sel);
    } catch {
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
    const _choice = (choiceVar as VariableType).make(this.scope);
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
    const { items, type } = (listVar as VariableType).make(this.scope);
    for (let i = 0; i < items.length; i++) {
      if (currentVarNameVar !== undefined) {
        const currentVarName = (currentVarNameVar as VariableType).make();
        this.scope[currentVarName] = Variable({ value: items[i], type });
      }
      if (indexVarNameVar !== undefined) {
        const indexVarName = (indexVarNameVar as VariableType).make();
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
    const listName = (listVar as VariableType).value;
    const list = this.scope[listName].value;
    const operation = (operationVar as VariableType).make(this.scope);
    if (operation === constants.LIST_PUSH) {
      if (elementVar !== undefined) {
        list.items.push((elementVar as VariableType).make(this.scope));
        this.scope[listName].value = list;
      } else {
        return warnings.LIST_EXPECTS_ELEMENT();
      }
    } else if (operation === constants.LIST_UNSHIFT) {
      if (elementVar !== undefined) {
        list.items.unshift((elementVar as VariableType).make(this.scope));
        this.scope[listName].value = list;
      } else {
        return warnings.LIST_EXPECTS_ELEMENT();
      }
    } else if (operation === constants.LIST_POP) {
      list.items.pop();
      this.scope[listName].value = list;
    } else if (operation === constants.LIST_SHIFT) {
      list.items.shift();
      this.scope[listName].value = list;
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
    const newVarName = (newVarNameVar as VariableType).make();
    const oldVarName = (oldVarNameVar as VariableType).make();
    const key = (keyVar as VariableType).make(this.scope);
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
            const endIndex = types.INTEGER.make((endKeyVar as VariableType).make(this.scope));
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
            const endIndex = types.INTEGER.make((endKeyVar as VariableType).make(this.scope));
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
    const sel = (selVar as VariableType).make(this.scope);
    const input = (inputVar as VariableType).make(this.scope);
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
    const url = (urlVar as VariableType).make(this.scope);
    try {
      await this.page.goto(url);
    } catch {
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
    const typeString = (typeStringVar as VariableType).make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = (varNameVar as VariableType).make();
    const url = (urlVar as VariableType).make(this.scope);
    const fileExt = getFileExt(url)
    const { source, error } = await this.sourceLoader(url, fileExt);
    if (error !== undefined) {
      return error;
    }
    const value = getListValueFromSource(source, type);
    this.scope[varName] = Variable({ value, type: types.LIST });
    return;
  },

  //  __         ______     ______    
  // /\ \       /\  __ \   /\  ___\   
  // \ \ \____  \ \ \/\ \  \ \ \__ \  
  //  \ \_____\  \ \_____\  \ \_____\ 
  //   \/_____/   \/_____/   \/_____/   
  async [keywords.LOG.token]({ inlineArguments }) {
    const [messageVars] = inlineArguments;
    const token = constants.OK_TOKEN;
    for (const messageVar of messageVars as VariableType[]) {
      const operableVariableForm = messageVar.make(this.scope);
      const message = messageVar.type.toString(operableVariableForm);
      logMessage({ token, message });
    }
    return;
  },

  //  __    __     ______     __  __     ______    
  // /\ "-./  \   /\  __ \   /\ \/ /    /\  ___\   
  // \ \ \-./\ \  \ \  __ \  \ \  _"-.  \ \  __\   
  //  \ \_\ \ \_\  \ \_\ \_\  \ \_\ \_\  \ \_____\ 
  //   \/_/  \/_/   \/_/\/_/   \/_/\/_/   \/_____/   
  async [keywords.MAKE.token]({ inlineArguments, instructions }) {
    const [listVarNameVar, argTypesAndNameVars] = inlineArguments;
    const listVarName = (listVarNameVar as VariableType).make();
    const { arguments: toyArgs, error } = getArgumentsFromArgTypesAndNames(argTypesAndNameVars);
    if (error !== undefined) {
      return error;
    } 
    this.scope[listVarName] = Variable({
      value: {
        type: types.INSTRUCTION,
        items: [...instructions]
      },
      type: types.LIST
    });
    this.scope[listVarName].arguments = toyArgs;
    return;
  },

  //  __    __     ______     __  __     ______     ______    
  // /\ "-./  \   /\  __ \   /\ \_\ \   /\  == \   /\  ___\   
  // \ \ \-./\ \  \ \  __ \  \ \____ \  \ \  __<   \ \  __\   
  //  \ \_\ \ \_\  \ \_\ \_\  \/\_____\  \ \_____\  \ \_____\ 
  //   \/_/  \/_/   \/_/\/_/   \/_____/   \/_____/   \/_____/   
  async [keywords.MAYBE.token]({ inlineArguments, instructions }) {
    const [conditionVar] = inlineArguments;
    const condition = (conditionVar as VariableType).make(this.scope);
    if (condition) {
      await this.run(instructions);
    }
    return;
  },

  //  __   __     ______     ______    
  // /\ "-.\ \   /\  ___\   /\  __ \   
  // \ \ \-.  \  \ \  __\   \ \ \/\ \  
  //  \ \_\\"\_\  \ \_____\  \ \_____\ 
  //   \/_/ \/_/   \/_____/   \/_____/   
  async [keywords.NEO.token]({ inlineArguments, Neo }) {
    const [pathVar] = inlineArguments;
    const path = (pathVar as VariableType).make(this.scope);
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
    const timeout = _timeout !== undefined ? (_timeout as VariableType).make(this.scope) : 0;
    return await pause(timeout);
  },

  //  ______   __         ______     __  __    
  // /\  == \ /\ \       /\  __ \   /\ \_\ \   
  // \ \  _-/ \ \ \____  \ \  __ \  \ \____ \  
  //  \ \_\    \ \_____\  \ \_\ \_\  \/\_____\ 
  //   \/_/     \/_____/   \/_/\/_/   \/_____/
  async [keywords.PLAY.token]({ inlineArguments }) {
    const [listVar, argumentValues] = inlineArguments;
    const { arguments: toyArgs } = listVar as VariableType;
    const { items: instructions, type: listType } = (listVar as VariableType).make(this.scope);
    if (listType.token !== types.INSTRUCTION.token) {
      return errors.BAD_PLAY_LIST(listType.token);
    }
    for (let i = 0; i < toyArgs.length; i++) {
      const { name, type } = toyArgs[i];
      argumentValues[i].type = type;
      const value = argumentValues[i].make(this.scope);
      this.scope[name] = Variable({ type, value });
    }
    await this.run(instructions);
    return;
  },
  
  //  ______     ______     ______     _____    
  // /\  == \   /\  ___\   /\  __ \   /\  __-.  
  // \ \  __<   \ \  __\   \ \  __ \  \ \ \/\ \ 
  //  \ \_\ \_\  \ \_____\  \ \_\ \_\  \ \____- 
  //   \/_/ /_/   \/_____/   \/_/\/_/   \/____/   
  async [keywords.READ.token]({ inlineArguments }) {
    const [typeStringVar, varNameVar, selVar] = inlineArguments;
    const typeString = (typeStringVar as VariableType).make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = (varNameVar as VariableType).make();
    const sel = (selVar as VariableType).make(this.scope);
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
    let targetSel, testText,
        currentRepeats = 0, maxRepeats = (maxRepeatsVar as VariableType).make(this.scope);
    while (currentRepeats++ <= maxRepeats) {
      await this.run(instructions);
      maxRepeats = (maxRepeatsVar as VariableType).make(this.scope);
      if (selVar !== undefined) {
        testText = (testTextVar as VariableType).make(this.scope);
        targetSel = (selVar as VariableType).make(this.scope);
        let innerText;
        try {
          innerText = await this.page.$eval(targetSel, el => el.innerText);
        } catch {
          return errors.ELEMENT_INEXISTENT(targetSel);
        }
        if (innerText.includes(testText)) {
          break;
        }
      }
    }
    return;
  },

  //  ______     ______     __         ______     ______     ______  
  // /\  ___\   /\  ___\   /\ \       /\  ___\   /\  ___\   /\__  _\ 
  // \ \___  \  \ \  __\   \ \ \____  \ \  __\   \ \ \____  \/_/\ \/ 
  //  \/\_____\  \ \_____\  \ \_____\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_____/   \/_____/   \/_____/   \/_____/     \/_/  
  async [keywords.SELECT.token]({ inlineArguments }) {
    const [selVar, optionVar] = inlineArguments;
    const sel = (selVar as VariableType).make(this.scope);
    const option = (optionVar as VariableType).make(this.scope);
    try {
      const isNotSelectElement = await this.page.$eval(sel, (el, value) => {
        if (el.options !== undefined) {
          if (value !== undefined) {
            for (let i = 0; i < el.options.length; i++) {
              if (el.options[i].innerText.includes(value)) {
                el.value = i;
                return false;
              }
            }
          }
          el.value = Math.floor((el.options.length - 1) * Math.random() + 1);
          return false;
        }
        return true;
      }, option);
      if (isNotSelectElement) {
        return errors.NOT_EXPECTED_ELEMENT_TAG("select", sel);
      }
    } catch {
      return errors.ELEMENT_INEXISTENT(sel);
    }
    return;
  },

  //  ______     __  __     ______     ______     ______  
  // /\  ___\   /\ \_\ \   /\  __ \   /\  __ \   /\__  _\ 
  // \ \___  \  \ \  __ \  \ \ \/\ \  \ \ \/\ \  \/_/\ \/ 
  //  \/\_____\  \ \_\ \_\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_/\/_/   \/_____/   \/_____/     \/_/
  // This is the non-allowReadWrite version of the shoot keyword.
  // It is overwritten when the allowReadWrite commands are specified.
  async [keywords.SHOOT.token]() {
    try {
      const pngBuffer = await this.page.screenshot();
      this.beforeErrorShot = pngBuffer;
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
      const latitude = Number((latStringVar as VariableType).make(this.scope));
      const longitude = Number((lonStringVar as VariableType).make(this.scope));
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
    const typeString = (typeStringVar as VariableType).make();
    const type = getTypeObjectFromToken(typeString);
    if (type === undefined) {
      return errors.NO_SUCH_TYPE(typeString);
    }
    const varName = (varNameVar as VariableType).make();
    const value = !type.selfDeclarable || valueVar === undefined
      ? type.empty
      : (valueVar as VariableType).make(this.scope);
    this.scope[varName] = Variable({ value, type });
    return;
  }

};