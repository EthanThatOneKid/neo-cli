// Create seperator comments with http://patorjk.com/software/taag/#p=display&f=Sub-Zero
const path = require("path");
const { types } = require("./maps/types");
const { keywords } = require("./maps/keywords");
const { errors } = require("./maps/errors");
const { warnings } = require("./maps/warnings");
const { constants } = require("./maps/constants");
const { evaluations } = require("./evaluations");
const { loadSource } = require("./helpers");
const NEO_MAPS = { types, errors, warnings, keywords, constants };

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
    const argValues = arguments.map(arg => arg.make(this.scope));
    const evaluation = evaluations[keywords.CLICK.token]
      .bind(null, argValues, NEO_MAPS);
    const error = await this.page.evaluate(evaluation);
    if (error !== undefined) {
      return error;
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
    console.log({url,urlValue})
    await this.page.goto(url.make(this.scope));
    return;
  },

  //  ______   ______     __  __     ______     ______    
  // /\  == \ /\  __ \   /\ \/\ \   /\  ___\   /\  ___\   
  // \ \  _-/ \ \  __ \  \ \ \_\ \  \ \___  \  \ \  __\   
  //  \ \_\    \ \_\ \_\  \ \_____\  \/\_____\  \ \_____\ 
  //   \/_/     \/_/\/_/   \/_____/   \/_____/   \/_____/
  async [keywords.PAUSE.token]({ arguments }) {

  },

  //  ______     __  __     ______     ______     ______  
  // /\  ___\   /\ \_\ \   /\  __ \   /\  __ \   /\__  _\ 
  // \ \___  \  \ \  __ \  \ \ \/\ \  \ \ \/\ \  \/_/\ \/ 
  //  \/\_____\  \ \_\ \_\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_/\/_/   \/_____/   \/_____/     \/_/
  async [keywords.SHOOT.token]({ arguments }) {
    try {
      const _savePath = arguments[0] !== undefined
        ? arguments[0].make(this.scope)
        : `${constants.SHOOT_DEFAULT}_${now()}.png`;
      const savePath = path.join(this.root, _savePath);
      await this.page.screenshot({ path: savePath });
    } catch (genericError) {
      const error = errors.GENERIC_ERROR(genericError);
      return error;
    }
  }

};

module.exports = { commands };