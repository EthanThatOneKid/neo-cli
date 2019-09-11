// Dependencies
const puppeteer = require('puppeteer');
const Neo = require('./lib/Neo');

// Globals
const entryFilePath = "./test.neo";

// Main Process
(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const neo = Neo.load(entryFilePath);
    neo.setPage(page);
    await neo.run();
    process.exit();

})();
