# 🐱‍👤 Neo
> Neo, a scripting language for web automation ~~

---

## 📃 Documentation

### 🔑 Keywords
#### `~~` ❌
* usage: `~~ arg1`

The `~~` keyword is this language's commenting solution. The line will be ignored in compilation.

#### `await`
* usage: `await`

The `await` keyword is to be used after a form submission. This allows the following page to be completely loaded before any further operations take place.

#### `click`
* usage: `click arg1`
* [*](#required) `arg1` is a [css selector](#css-selectors) representing the element to be clicked.

The `click` keyword clicks a specified html element on the current page.

#### `dialog`
* usage: `dialog arg1`
* `arg1` is either *accept* or *dismiss*

The `dialog` keyword prepares the script to handle a dialog box as specified. If `arg1` is invalid, it will default to *accept*. ⚠ Note: this keyword must come before any action that invokes a dialog box since the keyword merely prepares the script.

#### `field`
* usage: `field arg1, arg2`
* `arg1` represents the [css selector](#css-selectors) of an input element which will be filled.
* `arg2` represents the content that the input field will be filled with.

The `field` keyword allows input fields on the webpage to be filled with whatever.

#### `goto`
* usage: `goto arg1`
* [*](#required) `arg1` is a url that the page is taken to.

The `goto` keyword takes the page to a specified url.

#### `load`
* usage: `load arg1, arg2`
* [*](#required) `arg1` is a relative file path that contains the desired data.
* `arg2` is the variable name that is associated with the incoming list.

The path given by `arg2` should point to a file with either a `txt` or a `json` extention. When loading a `txt` file, the generated list's items are each line of the text file (deliminated by line breaks). When loading a `json` file, all of the top-level key-value pairs are saved as global variables.

#### `log`
* usage: `log arg1`
* `arg1` is a custom message to be viewed during runtime.

The `log` keyword allows for descriptions to be made as the script is running. It is recommended to use this keyword for debugging. By default, `arg1` will be a generic log.

#### `neo`
* usage: `neo arg1`
* `arg1` can represent one of two things. If it is the relative path to a directory, it will loop through each file with the `.neo` extension. If it is a relative path to a file with the `.neo` extension, it will execute the instructions within that file.

The `neo` keyword is this language's object orientation solution. It allows for smaller modules/abstractions to be defined in organized files for better readability/design.

#### `pause`
* usage: `pause arg1`
* `arg1` represents the number of milliseconds to pause the instructions for.

The `pause` keyword is like the `await` keyword in that it pauses the time between the next instruction for a specified number of milliseconds. This can be used instead of `await` if the webpage has janky loading.

#### `read`
* usage: `read arg1`
* [*](#required) `arg1` is a [css selector](#css-selectors) representing the element that contains the desired text.

The `read` keyword is meant to be used for debugging or descriptive purposes and logs text from the webpage during runtime.

#### `rep` and `until`
* usage: `rep ... until arg1, arg2`
* alternate usage: `rep err arg3 ... until arg1, arg2`
* [*](#required) `arg1` can represent one of two things. If it is an integer, the following instructions will execute that many times until the `until` keyword is used. If `arg1` is a [css selector](#css-selector), then the loop will continue until the text inside of the css selector's element is *not* equivalent to `arg2`.
* `arg2` is the text being used to test against `arg1`'s element's inner text. This argument is only required if `arg1` is a [css selector](#css-selector).

The `rep` keyword starts a loop that executes the instructions between itself and the following `until` keyword. It can either execute a set of instructions a specified number of times, or keep executing a set of instructions until an element on the page *does not* match a specified string.
In the case of an error, you may wish to specify a special error message if it occurs within the loop. To do this, follow the conventions of the [`err`](#err) keyword in the same line as the `rep` keyword (as seen in the alternate usage above).

#### `sav`
* usage: `sav arg1, arg2`
* [*](#required) `arg1` is the name arbitrarily given to the value that is being saved.
* [*](#required) `arg2` is the a [css selector](#css-selectors) representing the element containing the desired text.

The `sav` keyword saves a desirable data point to the data collection for further detailing.

#### `sel`
* usage: `sel arg1, arg2`
* [*](#required) `arg1` is the [css selector](#css-selectors) representing the select element being operated on.
* `arg2` is the option text to be selected. If `arg2` is not given or unavailable, a random option will be chosen.

The `sel` keyword sets a select element to a specified or random option.

#### `shoot`
* usage `shoot arg1`
* `arg1` is the relative path that the screen shot shall be stored.

The `shoot` keyword is meant for debugging purposes. It takes a screenshot of the current screen and saves it to a specified relative path.

#### `title`
* usage: `title arg1`
* [*](#required) `arg1` is the title overlooking all of the following instructions.

The `title` keyword is used for detail-oriented purposes during runtime and in the data collection.

#### `var`
* usage: `var arg1, arg2, arg3`
* [*](#required) `arg1` represents the datatype being stored. It can either be `int` or `string`. Defaults to `string`.
* [*](#required) `arg2` represents the name that the data will be stored under.
* [*](#required) `arg3` is the [css selector](#css-selectors) that holds the desired data.

The `var` keyword is used to create variables that can be accessed by later calls. It is suggested that the variable name does not conflict with any keywords.

### 🌎 Global Variables
#### `DATE`
This global variable represents the date that the script is being ran on.
#### `RELATIVE_PATH`
This global variable represents the relative path based on where the interpreter was ran.
#### `NEO_...`
Any variables defined in the [.env file](#env) that are prefaced with "NEO_" will be included as a global variable.

---

## 🔍 Reference
### Required
Some arguments are required for certain keywords.
### CSS Selectors
CSS Selectors are strings of text used to target certain HTML elements. In the case of this language, they are used to select an element to be operated on or read.
### .env
A .env file (literally named ".env") is a file that contains secret information that should not be committed to a git repository. The contents of the file should look like this:
```
SECRET_USERNAME=YOUR_NEOPETS_USERNAME_HERE
SECRET_PASSWORD=YOUR_NEOPETS_PASSWORD_HERE
```

---

## ✏ Developer's Note
I really like Neopets, but sometimes, I am short on time and I am unable to do all my dailies manually. I created this language so I could script out all of my Neopets dailies and also because I thought it would be a fun project since I enjoy recreational programming.

Edit 1/18/20: During the development of this project, Neopets started using a security feature that makes puppeteer interaction entirely impossible. Because of this, instead of making this language exclusively for Neopets scripting, I decided to make it an all-purpose web-scripting language.

---

## ✅ Todo
* [ ] implement `load` keyword
    * Created: 1/18/20
    * Completed: TBA
* [ ] documentation for using the language as a JavaScript API
    * Created: 1/18/20
    * Completed: TBA
* [ ] documentation for using the language in the command line
    * Created: 1/18/20
    * Completed: TBA

---

Developed with 💖 by EthanThatOneKid
