// Dependencies
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const NeoError = require('./NeoError');

// Exports
module.exports = class Neo {

    constructor(config) {
        this.root = config.root;
        this.lines = config.lines;
        this.page;
        this.title;
        this.error;
    }

    run() {
        for (let line of this.lines) {
            const [keyword, ...args] = line;
            this[keyword](args);
        }
    }

    setPage(page) {
        this.page = page;
    }

    static load(_filePath) {
        const filePath = path.join(__dirname, _filePath);
        if (fs.existsSync(filePath)) {
            const rawSourceCode = fs.readFileSync(filePath);
            const root = path.dirname(filePath);
            return Neo.parse(rawSourceCode, root);
        } else {
            new NeoError(1);
        }
    }

    static parse(rawSourceCode, root = "/") {
        const lines = rawSourceCode.split("\n")
            .map(line => line.replace(",", "[ARG_SEP]").split(" "));
        return new Neo({root, lines});
    }

}