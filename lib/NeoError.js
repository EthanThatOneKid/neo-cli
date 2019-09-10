// Dependencies
const fs = require('fs');
const path = require('path');

// Globals
const errorMessagesPath = path.join(__dirname, "error-messages.json");
const errorMessages = JSON.parse(fs.readFileSync(errorMessagesPath));

// Exports
module.exports = class NeoError {

    constructor(errorCode, ...args) {
        this.errorCode = errorCode;
        this.args = args;
        this.throw();
    }

    generateErrorMessage() {
        let result = errorMessages[this.errorCode] || "Unknown Error",
            curArgIndex = 0;
        result = result
            .replace("{}", () => this.args[curArgIndex++]);
        return `NeoErrCode ${this.errorCode}: ${result}`;
    }

    throw() {
        throw new Error(this.generateErrorMessage());
    }

}