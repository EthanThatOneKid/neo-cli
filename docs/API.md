# Neo Documentation 🐱‍👤

> Welcome to the official Neo language API documentation.

## Global Variables 🌎
There are some global variables accessible right out of the box.
`DATE` provides a very readable date of type `text`.
`CWD` provides the current working directory of type `url` from which the Neo script was ran.
`NEO_...`: Any variables defined in the `.env` file that are prefaced with "NEO_" will be included as a global variable.

## Native Types ⛄
There are multiple types natively accessible in the Neo language.
* `int` holds an integer numeric value.
* `text` holds a string alphanumeric value.
* `boo` holds a boolean; a true or false condition.
* `url` holds text for an absolute URL or path on the current system.
* `sel` holds text for a CSS selector.
* `list` holds array data for any of the above types.

## Commenting 🙈
To comment in a Neo file (text that will be ignored by the compiler), simply type `~~`.
The following text between the tildas and the next line break will be ignored by the compiler.
The reason why tildas were chosen to be the comment token of the Neo language is because they symbolize good vibes 🤙.

## CSS Selectors 🎯
CSS Selectors are strings of text used to target certain HTML elements.
In the case of this language, they are used to select an element to be operated on or read.

## .env 🔐
A .env file (literally named ".env") is a file that contains secret information that should not be committed to a git repository.
The contents of the file should look like this:
```
SECRET_USERNAME=YOUR_NEOPETS_USERNAME_HERE
SECRET_PASSWORD=YOUR_NEOPETS_PASSWORD_HERE
```

## Keyword Table of Contents
* [click](#click)
* [dialog](#dialog)
* [do/foreach](#doforeach)
* [edit](#edit)
* [extract](#extract)
* [field](#field)
* [goto](#goto)
* [load](#load)
* [log](#log)
* [maybe/if](#maybeif)
* [neo](#neo)
* [pause](#pause)
* [read](#read)
* [rep/until](#repuntil)
* [sav](#sav)
* [select](#select)
* [shoot](#shoot)
* [var](#var)

## API
### `click`
Usage: `click [BUTTON_SELECTOR: sel]*`
> Clicks an element on the page.

Arguments:
1. `BUTTON_SELECTOR`: `sel` (*required*)... CSS selector representing page element intended to be clicked.

---

### `dialog`
Usage: `dialog [CHOICE: text]`
> Accepts or dismisses future dialog evocations.

Arguments:
1. `CHOICE`: `text`... Can either be `accept` or `dismiss`. Defaults to `accept`.

---

### `do/foreach`
Usage:
```
do
	~~ Block of Code
foreach [LOOP_LIST: list]*, [CUR_ITEM_NAME: text], [CUR_INDEX_NAME: text]
```
> Loops through the contents of a list variable.

Arguments:
1. `LOOP_LIST`: `list` (*required*)... Name of list variable to be interpolated.
1. `CUR_ITEM_NAME`: `text`... Variable name dedicated to the current item in the list per interpolation.
1. `CUR_INDEX_NAME`: `text`... Variable name dedicated to the current index in the list per interpolation.

---

### `edit`
Usage: `edit [EDIT_LIST: list]*, [OPERATION: text]*, [APPENDATION: text]`
> Manipulates the contents of a list by adding to the front, removing from the front, adding to the end, and removing from the end.

Arguments:
1. `EDIT_LIST`: `list` (*required*)... Name of list variable to be operated on.
1. `OPERATION`: `text` (*required*)... Can only be `push`, `pop`, `shift`, or `unshift`. Push appends to the back, pop removes from the back, shift removes from the front, and unshift appends to the front.
1. `APPENDATION`: `text`... Item to be added to the list.

---

### `extract`
Usage: `extract [NEW_VARIABLE_NAME: text]*, [REFERENCE_VARIABLE: text]*, [INDEX: text]*, [END_INDEX: text]`
> Extracts a value or a slice out of a list-y typed variable.

Arguments:
1. `NEW_VARIABLE_NAME`: `text` (*required*)... Name of the new variable being created.
1. `REFERENCE_VARIABLE`: `text` (*required*)... Name of the variable being extracted from. Cannot be of types int or boo.
1. `INDEX`: `text` (*required*)... Position in the variable at which to extract a new value from.
1. `END_INDEX`: `text`... Position at which to end the extraction. If this argument is given, the new variable will be a slice of the reference variable from the index given in the previous argument to the one in this argument.

---

### `field`
Usage: `field [INPUT_SELECTOR: sel]*, [INPUT_VALUE: text]*`
> Populates an element on the page.

Arguments:
1. `INPUT_SELECTOR`: `sel` (*required*)... CSS selector representing page element intended to be populated.
1. `INPUT_VALUE`: `text` (*required*)... Value being populated into the given input field.

---

### `goto`
Usage: `goto [URL_TO_GO: url]*`
> Navigates to a new website.

Arguments:
1. `URL_TO_GO`: `url` (*required*)... The URL that the page shall navigate to.

---

### `load`
Usage: `load [SOURCE_LOCATION: url]*, [INTENDED_TYPE: text], [LIST_VAR_NAME: text]`
> Loads list contents from an extraneous file.

Arguments:
1. `SOURCE_LOCATION`: `url` (*required*)... URL or path to file containing list data. The file must either be a one-dimensional JSON list or a text file with the items separated by line breaks.
1. `INTENDED_TYPE`: `text`... The type token of the list elements. For example, a list of `int`s.
1. `LIST_VAR_NAME`: `text`... The variable name that is taking on the value of the list.

---

### `log`
Usage: `log [MESSAGE: text]*`
> Logs a message to the command-line interface.

Arguments:
1. `MESSAGE`: `text` (*required*)... Message to be logged in the command-line interface.

---

### `maybe/if`
Usage:
```
maybe
	~~ Block of Code
if [CONDITION: boo]*
```
> Allows internal commands to run hinging on a condition. This is the language's 'if/then' solution.

Arguments:
1. `CONDITION`: `boo` (*required*)... If the condition is truth-y, then the internal commands will be ran.

---

### `neo`
Usage: `neo [SOURCE_LOCATION: url]*`
> Runs external Neo files. This is the language's modularization solution.

Arguments:
1. `SOURCE_LOCATION`: `url` (*required*)... URL or path or directory to Neo file. If given a directory, every Neo file will be ran. If given a URL or path, the retrieved Neo file will be ran.

---

### `pause`
Usage: `pause [TIMEOUT: int]`
> Pauses the script from continuing for a given amount of milliseconds.

Arguments:
1. `TIMEOUT`: `int`... Timeout for how long to pause the script in milliseconds.

---

### `read`
Usage: `read [INTENDED_TYPE: text]*, [NEW_VARIABLE_NAME: text]*, [CONTENT_SELECTOR: sel]`
> Stores the text content of a page element as a variable.

Arguments:
1. `INTENDED_TYPE`: `text` (*required*)... Type to be assumed when value is stored as a variable.
1. `NEW_VARIABLE_NAME`: `text` (*required*)... Name of variable being attributed the read value.
1. `CONTENT_SELECTOR`: `sel`... CSS selector of representing page element that shall be read from.

---

### `rep/until`
Usage:
```
rep
	~~ Block of Code
until [MAXIMUM_REPEATS: int]*, [WATCHED_SELECTOR: sel], [TEST_TEXT: text]
```
> Repeats a block of code until a targeted page element's text content matches (or includes) a given text value.

Arguments:
1. `MAXIMUM_REPEATS`: `int` (*required*)... The maximum number of loops before deciding to continue.
1. `WATCHED_SELECTOR`: `sel`... CSS selector representing page element being checked against.
1. `TEST_TEXT`: `text`... Text that the targeted page element's text content is checked against.

---

### `sav`
Usage: `sav [SAVE_LOCATION: url]*, [SAVED_LIST: list]*`
> Saves (or appends) value of a list as a file.

Arguments:
1. `SAVE_LOCATION`: `url` (*required*)... Path of file to be appended or created. If the file has a JSON extention, the values will be appended to the JSON, but otherwise will be appended with line breaks as deliminators.
1. `SAVED_LIST`: `list` (*required*)... List of items to be saved in file form.

---

### `select`
Usage: `select [SELECT_SELECTOR: sel]*, [OPTION_VALUE: text]`
> Selects an option from a `select` page element

Arguments:
1. `SELECT_SELECTOR`: `sel` (*required*)... CSS selector representing an element on the page with a tag of `select`.
1. `OPTION_VALUE`: `text`... The option in the `select` element to be selected.

---

### `shoot`
Usage: `shoot [SAVE_LOCATION: url]`
> Takes a screenshot of the current page.

Arguments:
1. `SAVE_LOCATION`: `url`... Path for image file to be saved.

---

### `var`
Usage: `var [INTENDED_TYPE: text]*, [VAR_NAME: text]*, [VAR_VALUE: text]*`
> Sets a new variable in the scope of the Neo script.

Arguments:
1. `INTENDED_TYPE`: `text` (*required*)... Type for variable value to take on.
1. `VAR_NAME`: `text` (*required*)... Name for variable to be called under.
1. `VAR_VALUE`: `text` (*required*)... Raw value for variable to take on initially.

---

---
Generated with 💖 by EthanThatOneKid