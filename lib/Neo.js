// Dependencies
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const NeoError = require('./NeoError');

// Globals
const validKeywords = new Set(["~~", "await", "click", "depo", "eachpet", "endeach", "err", "goto", "log", "login", "neo", "read", "rep", "rew", "sav", "savstat", "sel", "swap", "title", "until"]);
const begLoopKeywords = new Set(["eachpet", "rep"]);
const endLoopKeywords = new Set(["endeach", "until"]);
const environmentVariablePrefix = "NEO_";

// Exports
module.exports = class Neo {

    constructor(config) {
        this.root = config.root;
        this.instructions = config.instructions;
        this.page;
        this.title;
        this.error;
        this.globals;
        this.initializeGlobals();
    }

    // Keyword Operations

    async await(config) {
        // await reload
    }
    

    // Language Interpretter Utilities

    initializeGlobals() {
        const result = Object.entries(process.env)
            .filter(([k, v]) => k.includes(environmentVariablePrefix))
            .reduce((o, [k, v]) => ({...o, [k]: v}), {});
        const gimmeDate = new Date();
        const dateOffset = new Date().getTimezoneOffset();
        gimmeDate.setMinutes(gimmeDate.getMinutes() - dateOffset);
        result["DATE"] = gimmeDate.toISOString().split("T")[0];
        this.globals = result;
    }

    async run() {
        for (let instruction of this.instructions) {
            if (instruction.keyword == "~~") {
                continue;
            } else {
                await this[instruction.keyword](instruction);
            }
        }
    }

    setPage(page) {
        this.page = page;
    }

    static load(_filePath) {
        const filePath = path.join(process.cwd(), _filePath);
        if (fs.existsSync(filePath)) {
            const rawSourceCode = String(fs.readFileSync(filePath));
            const root = path.dirname(filePath);
            return Neo.parse(rawSourceCode, root);
        } else {
            new NeoError(1, filePath);
        }
    }

    static parse(rawSourceCode, root = "/") {
        const tokenizor = /\s*([^\s\,]+|\,)\s*/g;
        const tokens = rawSourceCode
            .split(tokenizor)
            .filter(s => !s.match(/^\s*$/));
        const parseTokens = (tokens, instructions = []) => {
            let gimmeInstruction;
            let gimmeArgument = [];
            let isFinalInstruction = false;
            const pushInstruction = () => {
                if (!!gimmeArgument.length) {
                    gimmeInstruction.arguments.push(gimmeArgument.join(" "));
                    gimmeArgument = [];
                }
                instructions.push(gimmeInstruction);
            };
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (validKeywords.has(token)) {
                    if (isFinalInstruction) {
                        if (!!gimmeArgument.length) {
                            gimmeInstruction.arguments.push(gimmeArgument.join(" "));
                        }
                        return {
                            arguments: gimmeInstruction.arguments,
                            instructions: instructions,
                            steps: i
                        };
                    } else if (!!gimmeInstruction) {
                        pushInstruction();
                    }
                    if (begLoopKeywords.has(token)) {
                        const deepDive = parseTokens(tokens.slice(i + 1));
                        i += deepDive.steps;
                        gimmeInstruction = {
                            keyword: token,
                            arguments: deepDive.arguments,
                            instructions: deepDive.instructions
                        };
                    } else {
                        if (endLoopKeywords.has(token)) {
                            isFinalInstruction = true;
                        }
                        gimmeInstruction = {
                            keyword: token,
                            arguments: []
                        };
                    }
                } else if (token == ",") {
                    gimmeInstruction.arguments.push(gimmeArgument.join(" "));
                    gimmeArgument = [];
                } else {
                    gimmeArgument.push(token);
                }
            }
            pushInstruction();
            return instructions;
        };
        const instructions = parseTokens(tokens);
        return new Neo({root, instructions});
    }

}