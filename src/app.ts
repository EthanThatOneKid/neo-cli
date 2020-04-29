import Neo from './Neo';
import 'source-map-support/register';
import { chromium, firefox, webkit } from 'playwright';
import { downloadBrowser } from './download-browser';
import { getBrowserKey, beginBrowserLaunch } from './helpers';

const playwright = { chromium, firefox, webkit };

const app = async ({ input, flags }) => {
  const browserKey = getBrowserKey(flags);
  if (flags.download) {
    await downloadBrowser(browserKey);
    return;
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

export { app };