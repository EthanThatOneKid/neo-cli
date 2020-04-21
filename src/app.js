const { Neo } = require('./Neo');
const { getBrowserKey, beginBrowserLaunch } = require('./helpers');
const playwright = require('playwright');

const app = async ({ input, flags }) => {
  const browserKey = getBrowserKey(flags);
  if (flags.download) {
    const { downloadBrowser } = require('playwright-core/download-browser');
    await downloadBrowser(browserKey);
    return process.exit();
  }
  const headless = !flags.headful;
  const completeBrowserLaunch = beginBrowserLaunch(browserKey);
  const browser = await playwright[browserKey].launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  completeBrowserLaunch();
  const [path] = input;
  const neo = await Neo.load({ path, page });
  await neo.run();
  return process.exit();
};

module.exports = { app };