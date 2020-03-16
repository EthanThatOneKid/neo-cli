#!/usr/bin/env node

// Dependencies
const { chromium } = require('playwright');
const Neo = require('./lib/Neo');

// Globals
const entryFilePath = process.argv[2] || "./index.neo";

// Main Process
(async () => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const neo = Neo.load(entryFilePath);
    neo.setPage(page);
    await neo.run();
    process.exit();

})();
