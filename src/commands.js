// Create seperator comments with http://patorjk.com/software/taag/#p=display&f=Sub-Zero
const path = require("path");
const { types } = require("./maps/types");
const { keywords } = require("./maps/keywords");
const { errors } = require("./maps/errors");
const { warnings } = require("./maps/warnings");
const { constants } = require("./maps/constants");
const {
  loadSource,
  logMessage,
  getTypeObjectFromToken
} = require("./helpers");

const now = () => +new Date();

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
    const [url] = arguments;
    const urlValue = url.make(this.scope);
    try {
      await this.page.goto(urlValue);
    } catch (genericError) {
      return errors.GENERIC_ERROR(genericError);
    }
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
    const message = messageVar.make(this.scope);
    logMessage({ token, message });
    return;
  },

  //  __   __     ______     ______    
  // /\ "-.\ \   /\  ___\   /\  __ \   
  // \ \ \-.  \  \ \  __\   \ \ \/\ \  
  //  \ \_\\"\_\  \ \_____\  \ \_____\ 
  //   \/_/ \/_/   \/_____/   \/_____/   
  async [keywords.NEO.token]({ arguments }) {
    const [pathVar] = arguments;
    const neo = await Neo.load(pathVar.make(this.scope));
    return await neo.run();
  },

  //  ______   ______     __  __     ______     ______    
  // /\  == \ /\  __ \   /\ \/\ \   /\  ___\   /\  ___\   
  // \ \  _-/ \ \  __ \  \ \ \_\ \  \ \___  \  \ \  __\   
  //  \ \_\    \ \_\ \_\  \ \_____\  \/\_____\  \ \_____\ 
  //   \/_/     \/_/\/_/   \/_____/   \/_____/   \/_____/
  async [keywords.PAUSE.token]({ arguments }) {
    const [_timeout] = arguments;
    const timeout = _timeout !== undefined ? timeout : 0;
    return await new Promise(resolve => setTimeout(resolve, timeout));
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
    // const [cssSel, value] = config.arguments;
    // await this.page.$eval(this.populateArgument(cssSel), (sel, value) => {
    //   value = value === undefined
    //     ? ~~((sel.options.length - 1) * Math.random()) + 1
    //     : [...sel.options].map(opt => opt.innerText).indexOf(value);
    //   sel.value = `${value}`;
    // }, value);
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

module.exports = { commands };