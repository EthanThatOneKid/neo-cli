const { Neo } = require('./Neo2');
const { chromium } = require('playwright');

(async () => {

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const neo1 = await Neo.load({
    page,
    path: "./src/test.neo",
    // path: "https://raw.githubusercontent.com/EthanThatOneKid/neo/master/sample/index.neo",
    // path: "https://raw.githubusercontent.com/EthanThatOneKid/neo/master/sample/test.html",
  });

  await neo1.run();
  process.exit(1);

})();