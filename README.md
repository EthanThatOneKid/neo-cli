# Neo 🐱‍👤
> Neo, a scripting language for web automation ~~

---

## Documentation 📃
Please refer to the [API docs](docs/API.md).

---

## Running Neo Files from the Command Line 💻
### Installation ⚡

#### Install Bundled Program 🌌
> Coming soon!

#### Build from Source 🏗
> Install Neo to your machine using [git](https://git-scm.com/downloads) and [npm](https://nodejs.org/en/)
```shell
git clone https://github.com/EthanThatOneKid/neo # Clone this repository
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
```

---

## Changes in the Browser Extension Environment 💄
The command-line interface version of the Neo language relies on a page object supplied by [Playwright](https://github.com/microsoft/playwright/blob/master/docs/api.md). The Neo language utilizes some functions given by this object in order to operate the simulated browser page. In order for Neo to run in the browser via a browser extension, this page object must be replicated for usage within the browser. In the Neo Companion extension, there must be a page object that contains all of the functions that are used by Neo from Playwright's page object.

---

## Developer's Note ✏
I really like Neopets, but sometimes, I am short on time and I am unable to do all my dailies manually. I created this language so I could script out all of my Neopets dailies and also because I thought it would be a fun project since I enjoy recreational programming.

Edit 1/18/20: During the development of this project, Neopets started using a security feature that makes Puppeteer/Playwright interaction entirely impossible. Because of this, instead of making this language exclusively for Neopets scripting, I decided to make it an all-purpose web-scripting language.

Edit 4/28/20: I have completed the modern version of the Neo language complete with API docs and all. Let the automation begin!

---

<a href="https://www.buymeacoffee.com/etok" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 25px !important;" ></a>

Developed with 💖 by EthanThatOneKid