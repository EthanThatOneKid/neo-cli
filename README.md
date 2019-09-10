# 🐱‍👤 Neo
> Neo, a scripting language for Neopets

---

## 📃 Documentation

### 🔑 Keywords
#### `~~`
* usage: `~~ arg1`

The `~~` keyword is this language's commenting solution. The line will be ignored in compilation.

#### `await`
* usage: `await`

The `await` keyword is to be used after a form submission. This allows the following page to be completely loaded before any further operations take place.

#### `click`
* usage: `click arg1`
* [*](#required) `arg1` is a [css selector](#css-selectors) representing the element to be clicked.

The `click` keyword clicks a specified html element on the current page.

#### `depo`
* usage: `depo arg1`
* `arg1` is an integer specifying how much NP shall be deposited into the bank.

The `depo` keyword is used to deposit NP into the bank. If `arg1` is not given, all of the current NP will be deposited.

#### `eachpet` and `endeach`
* usage: `eachpet ... endeach`
* alternate usage: `eachpet err arg1 ... endeach`

The `eachpet` keyword begins a loop that executes the instructions following the keyword up to the usage of the `endeach` keyword for each neopet owned.
In the case of an error, you may wish to specify a special error message if it occurs within the loop. To do this, follow the conventions of the [`err`](#err) keyword in the same line as the `eachpet` keyword (as seen in the alternate usage above).

#### `err`
* usage: `err arg1`
* `arg1` is a custom error message to be used in the case that the script cannot execute properly.

The `err` keyword specifies an error message to be used in the case that the following instructions cannot execute properly. If `arg1` is not defined,  the error message provided by the compiler will be the default error message.

#### `goto`
* usage: `goto arg1`
* [*](#required) `arg1` is a url that the page is taken to.

The `goto` keyword takes the page to a specified url.

#### `field`
* usage: `field arg1, arg2`
* `arg1` represents the [css selector](#css-selectors) of an input element which will be filled.
* `arg2` represents the content that the input field will be filled with.

The `field` keyword allows input fields on the webpage to be filled with whatever.

#### `log`
* usage: `log arg1`
* `arg1` is a custom message to be viewed during runtime.

The `log` keyword allows for descriptions to be made as the script is running. It is recommended to use this keyword for debugging. By default, `arg1` will be a generic log.

#### `login`
* usage: `login arg1, arg2`
* [*](#required) `arg1` is the represents the account's username.
* [*](#required) `arg2` is the represents the account's password.

The `login` keyword logs the current webpage instance in to Neopets. It is recommended that the global variables [NEO_USERNAME and NEO_PASSWORD](#secret_username-and-secret_password) are used in place of `arg1` and `arg2` respectively if possible.

#### `neo`
* usage: `neo arg1`
* `arg1` can represent one of two things. If it is the relative path to a directory, it will loop through each file with the `.neo` extention. If it is a relative path to a file with the `.neo` extention, it will execute the instructions within that file.

The `neo` keyword is this language's object orientation solution. It allows for smaller modules/abstractions to be defined in organized files for better readabilty/design.

#### `read`
* usage: `read arg1`
* [*](#required) `arg1` is a [css selector](#css-selectors) representing the element that contains the desired text.

The `read` keyword is meant to be used for debugging or descriptive purposes and logs text from the webpage during runtime.

#### `rep` and `until`
* usage: `rep ... until arg1, arg2`
* alternate usage: `rep err arg3 ... until arg1, arg2`
* [*](#required) `arg1` can represent one of two things. If it is an integer, the following instructions will execute that many times until the `until` keyword is used. If `arg1` is a [css selector](#css-selector), then the loop will continue until the text inside of the css selector's element is *not* equivalent to `arg2`.
* `arg2` is the text being used to test against `arg1`'s element's inner text. 

This argument is only required if `arg1` is a [css selector](#css-selector).
The `rep` keyword starts a loop that executes the instructions between itself and the following `until` keyword. It can either execute a set of instructions a specified number of times, or keep executing a set of instructions until an element on the page *does not* match a specified string.
In the case of an error, you may wish to specify a special error message if it occurs within the loop. To do this, follow the conventions of the [`err`](#err) keyword in the same line as the `rep` keyword (as seen in the alternate usage above).

#### `rew`
* usage: `rew arg1`
* [*](#required) `arg1` is a [css selector](#css-selectors) representing the element that contains the reward text.

The `rew` keyword is meant to save the reward text from the task that is being executed. It is recommended to use this keyword for further detailing the data collection.

#### `sav`
* usage: `sav arg1, arg2`
* [*](#required) `arg1` is the name arbitrarily given to the value that is being saved.
* [*](#required) `arg2` is the a [css selector](#css-selectors) representing the element containing the desired text.

The `sav` keyword saves a desirable datapoint to the data collection for further detailing.

#### `savstat`
* usage: `savstat`

The `savstat` keyword records the current number of NP in the bank and the current number of unique items in the safety deposit box.

#### `sel`
* usage: `sel arg1, arg2`
* [*](#required) `arg1` is the [css selector](#css-selectors) representing the select element being operated on.
* `arg2` is the option text to be selected. If `arg2` is not given or unavailable, a random option will be chosen.

The `sel` keyword sets a select element to a specified or random option.

#### `swap`
* usage: `swap arg1`
* `arg1` is the name of neopet that is being swapped into.

The `swap` keyword sets the neopet in play to the one specified by `arg1`. If `arg1` is not given, the process will choose a random one.

#### `title`
* usage: `title arg1`
* `arg1` is the title overlooking all of the following instructions.

The `title` keyword is used for detail-oriented purposes during runtime and in the data collection.

### 🌎 Global Variables
#### `NEO_USERNAME` and `NEO_PASSWORD`
These global variables should be manually defined in the relative [.env file](#env). The variables are provided in order to log in to Neopets during runtime.
#### `PET_NAME`
This global variable represents the name of the Neopet currently in play.
#### `DATE`
This global variable represents the date that the script is being ran on.
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

---

Developed with 💖 by EthanThatOneKid