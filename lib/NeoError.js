// Dependencies
const errorMessages = require('./error-messages.json');

// Exports
module.exports = class NeoError {

    constructor(errorCode, ...args) {
        this.errorCode = errorCode;
        this.args = args;
        this.throw();
    }

    generateErrorMessage() {
        let result = errorMessages[errorCode],
            curArgIndex = 0;
        result = result
            .replace("{}", () => this.args[curArgIndex++]);
        return `NeoErrCode ${this.errorCode}: ${result}`;
    }

    throw() {
        throw new Error(this.generateErrorMessage());
    }

}