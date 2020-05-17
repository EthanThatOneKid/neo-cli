import fs from 'fs';
import path from 'path';
import { keywords } from '../maps/keywords';
import { constants } from '../maps/constants';
import errors from '../maps/errors';
import {
  now,
  getFileExt
} from '../helpers';

export const allowReadWriteCommands = {

  //  ______     ______     __   __   ______    
  // /\  ___\   /\  __ \   /\ \ / /  /\  ___\   
  // \ \___  \  \ \  __ \  \ \ \'/   \ \  __\   
  //  \/\_____\  \ \_\ \_\  \ \__|    \ \_____\ 
  //   \/_____/   \/_/\/_/   \/_/      \/_____/  
  async [keywords.SAVE.token]({ inlineArguments }) {
    const [savePathVar, listVar] = inlineArguments;
    const savePath = path.normalize(savePathVar.make(this.scope));
    const list = listVar.make(this.scope);
    const fileExists = fs.existsSync(savePath) && fs.statSync(savePath).isFile();
    const isJSON = getFileExt(savePath).toLowerCase() === "json";
    let saveData: any[];
    if (fileExists) {
      const source = String(fs.readFileSync(savePath));
      if (isJSON) {
        try {
          saveData = [...JSON.parse(source)]
        } catch {
          return errors.INVALID_JSON(savePath);
        }
      } else {
        saveData = saveData = source.split(constants.NEW_LINE);
      }
      saveData.push(...list.items);
    } else {
      const directoryName = path.relative(this.scope["CWD"].make(), path.parse(savePath).dir);
      fs.mkdirSync(directoryName, { recursive: true });
      saveData = [...list.items];
    }
    const stringifiedSaveData = isJSON
      ? JSON.stringify(saveData)
      : saveData.join(constants.NEW_LINE)
    fs.writeFileSync(savePath, stringifiedSaveData);
    return;
  },

  //  ______     __  __     ______     ______     ______  
  // /\  ___\   /\ \_\ \   /\  __ \   /\  __ \   /\__  _\ 
  // \ \___  \  \ \  __ \  \ \ \/\ \  \ \ \/\ \  \/_/\ \/ 
  //  \/\_____\  \ \_\ \_\  \ \_____\  \ \_____\    \ \_\ 
  //   \/_____/   \/_/\/_/   \/_____/   \/_____/     \/_/
  async [keywords.SHOOT.token]({ inlineArguments }) {
    const [savePathVar] = inlineArguments;
    const _savePath = savePathVar !== undefined
      ? savePathVar.make(this.scope)
      : `${this.scope["CWD"].make()}/${constants.SHOOT_DEFAULT}_${now()}.png`;
    const savePath = path.normalize(_savePath);
    try {
      const pngBuffer = await this.page.screenshot();
      this.beforeErrorShot = pngBuffer;
      fs.writeFileSync(savePath, pngBuffer);
    } catch (genericError) {
      return errors.GENERIC_ERROR(genericError);
    }
  }

};