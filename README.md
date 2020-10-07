# Neo 🐱‍👤

> Neo, a scripting language for web automation ~~ https://neolang.dev/

[![GitHub repo size](https://img.shields.io/github/repo-size/ethanthatonekid/neo-cli)][neo_repo][![GitHub release (latest by date)](https://img.shields.io/github/v/release/ethanthatonekid/neo-cli)][neo_site][![GitHub top language](https://img.shields.io/github/languages/top/ethanthatonekid/neo-cli)](https://www.typescriptlang.org/)[![GitHub issues](https://img.shields.io/github/issues/ethanthatonekid/neo-cli)](https://github.com/EthanThatOneKid/neo-cli/issues)[![GitHub pull requests](https://img.shields.io/github/issues-pr/ethanthatonekid/neo-cli)](https://github.com/EthanThatOneKid/neo-cli/pulls)[![GitHub All Releases](https://img.shields.io/github/downloads/ethanthatonekid/neo-cli/total)](https://github.com/EthanThatOneKid/neo-cli/releases)[![Buy me a Coffee](https://img.shields.io/badge/buy%20me%20a-coffee-%23FF813F)][bmac][![GitHub watchers](https://img.shields.io/github/watchers/ethanthatonekid/neo-cli?style=social)](https://github.com/EthanThatOneKid/neo-cli/watchers)[![GitHub forks](https://img.shields.io/github/forks/ethanthatonekid/neo-cli?style=social)](https://github.com/EthanThatOneKid/neo-cli/fork)

---

## Documentation 📃

Please refer to the [API docs](https://github.com/EthanThatOneKid/neo-cli/blob/master/docs/API.md).

---

## Running Neo Files from the Command Line 💻

### Installation ⚡

#### Install Bundled Program 🌌

> Install the Neo application to your machine.

1. Visit the [latest release][neo_site].
1. Download the `neo.exe` file and put it in a special place on your machine.
1. Install the browser binary to go with Neo.
```shell
neo --download --chromium # Or --firefox or --webkit
```

#### Build from Source 🏗

> Install Neo to your machine using [git](https://git-scm.com/downloads) and [npm](https://nodejs.org/en/)

```shell
git clone https://github.com/EthanThatOneKid/neo-cli # Clone this repository
cd neo # Navigate to this repository
npm i # Install dependencies
npm run build # Compile TypeScript to JavaScript
npm i -g # Globally install Neo module
```

### Usage 🐹

> After following the installation steps, the `neo` keyword should be accessible from anywhere on your machine

```shell
neo --help
neo path/to/neo-file.neo
neo https://neolang.dev/welcome.neo # Try a quick test ;)
```

---

## Changes in the Browser Extension Environment 🎨

The command-line interface version of the Neo language relies on a page object supplied by [Playwright](https://github.com/microsoft/playwright/blob/master/docs/api.md). The Neo language utilizes some functions given by this object in order to operate the simulated browser page. In order for Neo to run in the browser via a browser extension, this page object must be replicated for usage within the browser. In the Neo Companion extension, there must be a page object that contains all of the functions that are used by Neo from Playwright's page object.

---

## Developer's Note ✏

I really like Neopets, but sometimes, I am short on time and I am unable to do all my dailies manually. I created this language so I could script out all of my Neopets dailies and also because I thought it would be a fun project since I enjoy recreational programming.

Edit 1/18/20: During the development of this project, Neopets started using a security feature that makes Puppeteer/Playwright interaction entirely impossible. Because of this, instead of making this language exclusively for Neopets scripting, I decided to make it an all-purpose web-scripting language.

Edit 4/28/20: I have completed the modern version of the Neo language complete with API docs and all. Let the automation begin!

---

[![Buy me a Coffee](https://img.shields.io/badge/buy%20me%20a-coffee-%23FF813F)][bmac]

Developed with 💖 by [EthanThatOneKid][creator_site]

[neo_site]: https://github.com/EthanThatOneKid/neo-cli/releases/latest
[neo_repo]: https://github.com/EthanThatOneKid/neo-cli
[bmac]: http://buymeacoff.ee/etok
[creator_site]: http://ethandavidson.com/
