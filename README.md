# superimport

[![Build Status](https://travis-ci.org/Andifeind/superimport.svg?branch=master)](https://travis-ci.org/Andifeind/superimport)

Tries to import a node module from the parent module dir or current working dir.
This was build for the [logtopus](https://github.com/Andifeind/logtopus) logger.
We need a way to load *optional modules* from the `$PROJECT_DIR/node_modules/` dir which is using logtopus, to load optional dependencies.

For example:

The logtopus module should load `logtopus-redis-logger`, but not from its own node_modules directory.
It should be load from `$PROJECT_DIR/node_modules` folder. This gives developers the
opportunity to load *optional dependencies* from the $PROJECT folder.

The logtopus module loads an optional module with `superimport`

```js
// logtopus/index.js
const superimport = require('superimport');
const redisLogger = superimport('logtopus-redis-logger');
```

A third part module uses logtopus and contains the *optional module* as a dependency

```js
// mymodule/example.js
const logtopus = require('logtopus');
```

In this example tries logtopus to require `logtopus-redis-logger` in this order:

1) `mymodule/node_modules/logtopus-redis-logger`  
2) `<cwd>/node_modules/logtopus-redis-logger`  
3) `../node_modules/logtopus-redis-logger` (goes up until `/node_modules`)  
4) return null

And optional second argument overrides the directories which may contain an *optional module*

```js
const dirs = ['../foo/node_modules', '../bar/libs/'];
const mod = superimport('somemodule', dirs);
```
