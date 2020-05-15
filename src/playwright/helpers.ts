import ora from 'ora';
import errors from '../maps/errors';
import { constants } from '../maps/constants';
import { logMessage } from '../helpers';

const getBrowserKey = flags => {
  if (flags[constants.CHROMIUM_BROWSER]) {
    return constants.CHROMIUM_BROWSER;
  } else if (flags[constants.FIREFOX_BROWSER]) {
    return constants.FIREFOX_BROWSER;
  } else if (flags[constants.WEBKIT_BROWSER]) {
    return constants.WEBKIT_BROWSER;
  } else {
    return constants.DEFAULT_BROWSER;
  }
};

const beginBrowserLaunch = browserKey => {
  const text = constants.LAUNCHING(browserKey);
  const spinner = ora({ text }).start();
  return () => spinner.succeed(constants.LAUNCH_COMPLETE(browserKey));
};

const getBrowserType = async (browserName: string, options): Promise<any> => {
  const browserType = (await import('playwright'))[browserName];
  if (!options.dev) {
    browserType._projectRoot = constants.DIST_DIR;
  }
  return browserType;
};

const launchBrowser = async (browserKey, browserType, headless) => {
  let page;
  try {
    const completeBrowserLaunch = beginBrowserLaunch(browserKey);
    const browser = await browserType.launch({ headless });
    const context = await browser.newContext();
    page = await context.newPage();
    completeBrowserLaunch();
  } catch {
    const error = errors.BROWSER_REVISION_UNINSTALLED(browserKey);
    logMessage(error);
    return process.exit();
  }
  return page;
};

export {
  getBrowserKey,
  beginBrowserLaunch,
  getBrowserType,
  launchBrowser
};