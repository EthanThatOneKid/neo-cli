// Dependencies
const puppeteer = require('puppeteer');
const Neo = require('./lib/Neo');

// Main Process
const entryFilePath = "./test.neo";
const neo = Neo.load(entryFilePath);
console.log({neo});
