const { Neo } = require('./Neo');
const playwright = require('playwright');

const app = async ({ input, flags }) => {
  const browser = flags.firefox
      ? await playwright.firefox.launch()
      : flags.webkit
        ? await playwright.webkit.launch()
        : await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const [path] = input;
  const neo = await Neo.load({ path, page });
  await neo.run();
  return;
};

module.exports = { app };