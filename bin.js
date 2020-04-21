#!/usr/bin/env node
const meow = require('meow');
const { app } = require('./src/app');

const help = `
Usage
  $ neo <entry path or url>

Options
  --chromium, -cr  Run script on chrome
  --firefox,  -ff  Run script on firefox
  --webkit,   -wk  Run script on webkit
  --headful,  -h   See headful execution
  --download, -dl  Download browser revision
`;
const flags = {
  chromium: { type: 'boolean', alias: 'cr' },
  firefox:  { type: 'boolean', alias: 'ff' },
  webkit:   { type: 'boolean', alias: 'wk' },
  headful:  { type: 'boolean', alias: 'h'  },
  download: { type: 'boolean', alias: 'dl' }
};
const cli = meow(help, { flags });
app(cli);