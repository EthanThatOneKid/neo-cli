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
        this.titleName = config.titleName;
        this.page;
        this.errorMessage;
        this.globals;
        this.initializeGlobals();
    }

    // Keyword Operations

    async await() {
        await this.page.waitForNavigation({waitUntil: "load"});
    }

    async click(config) {
        const [cssSel] = config.arguments;
        await this.page.click(cssSel);
    }

    async depo(config) {
        let [depositAmount] = config.arguments;
        const bankUrl = "http://www.neopets.com/login/index.phtml";
        await this.goto({arguments: [bankUrl]});
        if (depositAmount == undefined) {
            const np = await this.page.$eval("#npanchor", el => el.innerText);
            depositAmount = Number(np.replace(/\D/g, ""));
        }
        await this.field({arguments: ["input[name='amount']", depositAmount]});
        await this.click({arguments: ["input[value='Deposit']"]});
        await this.await();
    }

    async eachpet(config) {
        const quickrefUrl = "http://www.neopets.com/quickref.phtml";
        const neopetImgCssSel = "img[width='50'][height='50'][border='0']";
        await this.goto({arguments: [quickrefUrl]});
        const neopetNames = await this.page.$$eval(neopetImgCssSel, imgs => {
            const names = [...imgs]
                .filter(el => el.id.length > 0)
                .map(el => el.title);
            return [...new Set(names)];
        });
        const scope = new Neo({
            root: this.root,
            instructions: config.instructions,
            titleName: this.titleName
        });
        scope.setPage(this.page);
        for (let neopetName of neopetNames) {
            await this.swap({arguments: [neopetName]});
            scope.globals["PET_NAME"] = neopetName;
            await scope.run();
        }
        this.globals["PET_NAME"] = neopetNames.pop();
    }

    async err(config) {
        const [errorMessage] = config.arguments;
        this.errorMessage = errorMessage;
    }

    async field(config) {
        const [cssSel, inputString] = config.arguments;
        await this.page.focus(cssSel);
        await this.page.keyboard.type(inputString);
    }

    async goto(config) {
        const [url] = config.arguments;
        await this.page.goto(url);
    }

    async log(config) {
        const [logMessage] = config.arguments;
        console.log(`${this.titleName}: ${this.populateArgument(logMessage)}`);
    }

    async login(config) {
        const [username, password] = config.arguments;
        const loginUrl = "http://www.neopets.com/login/index.phtml";
        const neo = Neo.parse(`
            goto ${loginUrl}
            field input[type='text'][name='username'], ${username}
            field input[type='password'][name='password'], ${password}
            click .welcomeLoginButton
        `, this.root);
        neo.setPage(this.page);
        await neo.run();
        if ((await this.page.url()) != loginUrl) {
            await this.await();
        }
        this.globals["PET_NAME"] = await this.page.$eval("a[href='/quickref.phtml']", el => el.innerText) ;
    }

    async neo(config) {
        const [entryFilePath] = config.arguments;
        const neo = Neo.load(entryFilePath);
        neo.setPage(this.page);
        await neo.run();
    }

    async read(config) {
        const [cssSel] = config.arguments;
        const text = await this.page.$eval(cssSel, el => el.innerText);
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
        if (Number.isInteger(Number(a))) {
            for (let i = 0; i < Number(a); i++) {
                await scope.run();
            }
        } else {
            while (true) {
                await scope.run();
                const mayContinue = await this.page.$eval(a, (el, b) => b == el.innerText, b);
                if (!mayContinue) {
                    break;
                }
            }
        }
    }

    async rew(config) {
        // save reward data to the data collection
    }

    async sav(config) {
        // save data to the data collection
    }

    async savstat(config) {
        // make rounds getting some data
    }

    async sel(config) {
        const [cssSel, value] = config.arguments;
        await page.$eval(cssSel, (sel, value) => {
            value = value == undefined
                ? ~~((sel.options.length - 1) * Math.random()) + 1
                : sel.options.map(opt => opt.innerText).indexOf(value);
            sel.value = `${value}`;
        }, value);
    }

    async swap(config) {
        const [neopetName] = config.arguments;
        const changePetUrl = "http://www.neopets.com/process_changepet.phtml?new_active_pet=";
        await this.goto({arguments: [`${changePetUrl}${neopetName}`]});
    }

    async title(config) {
        const [titleName] = config.arguments;
        this.titleName = this.populateArgument(titleName);
    }
    
    // Language Interpretter Utilities

    initializeGlobals() {
        const result = Object.entries(process.env)
            .filter(([k]) => k.includes(environmentVariablePrefix))
            .reduce((o, [k, v]) => ({...o, [k]: v}), {});
        const gimmeDate = new Date();
        const dateOffset = new Date().getTimezoneOffset();
        gimmeDate.setMinutes(gimmeDate.getMinutes() - dateOffset);
        result["DATE"] = gimmeDate.toISOString().split("T")[0];
        this.globals = result;
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
            new NeoError(0, !!this.errorMessage ? this.errorMessage : defaultErrorMessage);
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