// Dependencies
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const urlExpansionPack = require('./urls.js');

// Globals
const validKeywords = new Set(["~~", "await", "click", "dialog", "field", "goto", "log", "neo", "pause", "read", "rep", "sav", "sel", "shoot", "title", "until", "var"]);
const begLoopKeywords = new Set(["rep"]);
const endLoopKeywords = new Set(["until"]);
const validDataTypes = new Set(["int", "string"]);
const environmentVariablePrefix = "NEO_";

// Exports
module.exports = class Neo {

    constructor(config) {
        this.root = config.root;
        this.instructions = config.instructions;
        this.titleName = config.titleName;
        this.page;
        this.errorMessage;
        this.globals;
        this.initializeGlobals();
    }

    // Keyword Operations

    async await(config) {
        const [load] = config.arguments;
        await load === "load"
            ? this.page.waitForNavigation({ waitUntil: "load" })
            : this.page.waitForNavigation();
    }

    async click(config) {
        const [cssSel] = config.arguments;
        await this.page.click(this.populateArgument(cssSel));
    }

    async dialog(config) {
        const [_setting] = config.arguments;
        const validDialogSettings = new Set(["accept", "dismiss"]);
        const setting = validDialogSettings.has(_setting) ? _setting : "accept";
        this.page.on("dialog", async dialog => await dialog[setting]());
    }

    async field(config) {
        const [cssSel, _inputString] = config.arguments;
        const inputString = this.populateArgument(_inputString);
        await this.page.focus(this.populateArgument(cssSel));
        await this.page.keyboard.type(inputString);
    }

    async goto(config) {
        const [_url] = config.arguments;
        const url = this.populateArgument(_url);
        await this.page.goto(url);
    }

    async log(config) {
        const [logMessage] = config.arguments;
        const prefix = `${chalk.cyan("~")} ${chalk.green(`${this.titleName}`)}`;
        console.log(`${prefix} : ${this.populateArgument(logMessage)}`);
    }

    async neo(config) {
        const [entryFilePath] = config.arguments;
        const { ext, base } = path.parse(entryFilePath);
        if (ext.toLowerCase() == ".neo") {
            const neo = Neo.load(entryFilePath);
            neo.setPage(this.page);
            await neo.run();
        } else {
            const allEntryFileNames = fs.readdirSync(entryFilePath);
            for (let entryFileName of allEntryFileNames) {
                const gimmePath = path.join(base, entryFileName);
                const neo = Neo.load(gimmePath);
                neo.setPage(this.page);
                await neo.run();
            }
        }
    }

    async pause(config) {
        const [_ms] = config.arguments;
        const ms = !!_ms ? Number(_ms) : 0;
        await new Promise(res => setTimeout(res, ms));
    }

    async read(config) {
        const [cssSel] = config.arguments;
        const text = await this.page.$eval(this.populateArgument(cssSel), el => el.innerText);
        await this.log({arguments: [text]});
    }

    async rep(config) {
        const [a, b] = config.arguments;
        const scope = new Neo({
            root: this.root,
            instructions: config.instructions,
            titleName: this.titleName
        });
        scope.setPage(this.page);
        scope.loadGlobals(this.globals);
        if (Number.isInteger(Number(a))) {
            for (let i = 0; i < Number(a); i++) {
                await scope.run();
            }
        } else {
            while (true) {
                await scope.run();
                let mayContinue = false;
                try {
                    mayContinue = await this.page.$eval(a, (el, b) => el != null && b == el.innerText, b);
                } catch(err) {}
                if (!mayContinue) {
                    break;
                }
            }
        }
    }

    async sav(config) {
        // save data to the data collection
    }

    async sel(config) {
        const [cssSel, value] = config.arguments;
        await this.page.$eval(this.populateArgument(cssSel), (sel, value) => {
            value = value === undefined
                ? ~~((sel.options.length - 1) * Math.random()) + 1
                : [...sel.options].map(opt => opt.innerText).indexOf(value);
            sel.value = `${value}`;
        }, value);
    }

    async shoot(config) {
        const [__savePath] = config.arguments;
        const _savePath = __savePath || `./NEO_SHOOT_${(new Date()).valueOf()}.png`;
        const savePath = path.join(this.root, _savePath);
        await this.page.screenshot({ path: savePath });
    }

    async title(config) {
        const [titleName] = config.arguments;
        this.titleName = this.populateArgument(titleName);
    }

    async var(config) {
        const [_dataType, varName, cssSel] = config.arguments;
        const dataType = validDataTypes.has(_dataType) ? _dataType : "string";
        const _data = await this.page.$eval(this.populateArgument(cssSel), el => el.innerText);
        const data = dataType == "int" ? Number(_data.replace(/\D/g, "")) : _data;
        this.globals[varName] = data;
    }

    // Language Interpretter Utilities

    initializeGlobals() {
        let result = Object.entries(process.env)
            .filter(([k]) => k.includes(environmentVariablePrefix))
            .reduce((o, [k, v]) => ({ ...o, [k]: v }), {});
        const gimmeDate = new Date();
        const dateOffset = new Date().getTimezoneOffset();
        gimmeDate.setMinutes(gimmeDate.getMinutes() - dateOffset);
        result["DATE"] = gimmeDate.toISOString().split("T")[0];
        result["RELATIVE_PATH"] = this.root;
        result = { ...result, ...urlExpansionPack };
        this.globals = result;
    }

    loadGlobals(globals) {
        this.globals = { ...this.globals, ...globals };
    }

    populateArgument(s) {
        for (let [globalName, globalValue] of Object.entries(this.globals)) {
            if (s.includes(globalName)) {
                s = s.replace(globalName, globalValue);
            }
        }
        return s;
    }

    async run() {
        try {
            for (let instruction of this.instructions) {
                if (instruction.keyword == "~~") {
                    continue;
                } else {
                    await this[instruction.keyword](instruction);
                }
            }
        } catch (defaultErrorMessage) {
            console.log(chalk.red("NeoError: "), { defaultErrorMessage });
            const ts = (new Date()).valueOf();
            await this.shoot({ arguments: [`./BEFORE_ERROR_${ts}.png`] });
            process.exit();
        }
    }

    setPage(page) {
        this.page = page;
    }

    static load(_filePath) {
        const filePath = path.join(process.cwd(), _filePath);
        if (fs.existsSync(filePath)) {
            const rawSourceCode = String(fs.readFileSync(filePath));
            return Neo.parse(rawSourceCode, filePath);
        } else {
            throw Error(`No such ${filePath} was found.`);
        }
    }

    static parse(rawSourceCode, filePath) {
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
        const { name: titleName, dir: root } = path.parse(filePath);
        return new Neo({ root, titleName, instructions });
    }

}
