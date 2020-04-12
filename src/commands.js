// Create seperator comments with http://patorjk.com/software/taag/#p=display&f=Sub-Zero
const path = require("path");
const { types } = require("./maps/types");
const { keywords } = require("./maps/keywords");
const { errors } = require("./maps/errors");
const { warnings } = require("./maps/warnings");
const { constants } = require("./maps/constants");
const { loadSource } = require("./helpers");

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
      const warning = warnings.NAV_THRESH_BREAK(timeout);
      return warning;
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
      const error = errors.GENERIC_ERROR(genericError);
      return error;
    }
  }

};

module.exports = { commands };