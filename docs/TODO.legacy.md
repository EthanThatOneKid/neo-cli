# ✔ Todo
* [x] implement `load` keyword; applies list value to variable from path/url to json, or txt.
  * Created: 1/18/20
  * Completed: 4/22/20
* [ ] documentation for using the language as a JavaScript API
  * Created: 1/18/20
  * Completed: TBA
* [x] documentation for using the language in the command line
  * Created: 1/18/20
  * Completed: 2/18/20
* [x] rewrite puppeteer to [playwright](https://github.com/microsoft/playwright)
  * Created: 2/23/20
  * Completed: 3/19/20
* [ ] rewrite codebase to [TypeScript](https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project)
  * Created: 3/31/20
  * Completed: TBA
* [x] allow for URLs to be fetched in `neo` function
  * Created: 3/31/20
  * Completed: 4/12/20
* [ ] implement `upload` keyword; [example](https://github.com/microsoft/playwright/blob/master/docs/examples/upload.js)
  * Created: 4/13/20
  * Completed: TBA
* [ ] implement `swipe` and `bake` keywords; `swipe` apply current page cookies to variable; `bake` apply variable value of type cook to current page. This is meant to save an authentication state; [example](https://github.com/microsoft/playwright/blob/master/docs/examples/authentication.js).
  * Created: 4/13/20
  * Completed: TBA
* [x] implement `maybe` and `if` keywords; `maybe` instantiates a block. `if` runs the block only if the condition is true.
  * Created: 4/13/20
  * Completed: 5/14/20
* [x] implement `do` and `foreach` keywords.
  * Created: 4/19/20
  * Completed: 4/22/20
* [ ] implement `pdf` keyword. [notes](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagepdfoptions)
  * Created: 4/20/20
  * Completed: TBA
* [x] error-handle for browser-launch
  * Created: 4/20/20
  * Completed: 5/17/20
* [x] implement `extract` keyword. Some variable types are *extractable* (list, cookie). demo: `extract <VAR_NAME>, <LIST/COOKIE VARIABLE NAME>, <KEY/INDEX>`
  * Created: 4/22/20
  * Completed: 4/23/20
* [ ] implement line number retention for precise errors
  * Created: 4/22/20
  * Completed: TBA
* [ ] allow for JavaScript functions to be instantiated in a neo file or loaded in using a keyword `js`.
  * Created: 4/23/20
  * Completed: TBA
* [ ] create visual studio code extension for syntax highlighting neo syntax.
  * Created: 4/29/20
  * Completed: TBA
* [x] implement `make`, `finish` and `play` keyword. This will be the language's function solution. Toys are created between the keywords `make` and `finsh` using the syntax `make log LOG_MESSAGE finish TOY_NAME, LOG_MESSAGE, ...` Toys can be extracted from neo files using the syntax `load URL, as, TOY_NAME`. Toys will be stored as type `toy`.
  * Created: 5/12/20
  * Completed: 5/14/20
* [ ] utilize [GitBook](https://www.gitbook.com/) for neo documentation
  * Created: 5/27/20
  * Completed: TBA
