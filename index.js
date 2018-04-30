'use strict';

let path = require('path');
let fs = require('fs');

let getPaths = function() {
  let curDir = process.cwd();
  let dirs = [curDir + '/node_modules'];

  while (true) {
    curDir = path.join(curDir, '..');
    dirs.push(curDir + '/node_modules');

    if (curDir === '/') {
      return dirs;
    }
  }
}

function readDir(dir, recursive) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (recursive) {
        files = files.concat(readDir(filePath));
      }
    }
    else {
      if (/\.js(on)?$/.test(file)) {
        files.push(filePath);
      }
    }
  });

  return files;
}

module.exports = function(moduleName, importDirs) {
  const modulePath = getModulePath(moduleName, importDirs);
  if (modulePath === null) {
    throw new Error(`Module '${moduleName}' was not found!\n`);
  }

  return require(modulePath);
};

function importAll(dirs, recursive) {
  let files = []
  if (!Array.isArray(dirs)) {
    dirs = [dirs]
  }

  dirs.forEach((dir) => {
    if (dir[0] === '.') {
      dir = path.resolve(path.dirname(module.parent.filename), dir)
    }


    readDir(dir, recursive).filter(f => /\.(js|node)$/.test(f)).map(f => {
      const m = require(f)
      m.filename = f
      files.push(m)
    });
  })

  files.apply = function(ctx, args) {
    files.forEach(file => file.apply(ctx, args))
  }

  files.call = function(ctx) {
    const args = Array.prototype.slice.call(arguments, 1)
    files.apply(ctx, args)
  }

  return files
}

function moduleExists(moduleName, paths) {
  return !!getModulePath(moduleName, paths)
}

function getModulePath(moduleName, paths) {
  paths = paths || module.parent.paths.concat(getPaths());
  for (let dir of paths) {
    try {
      const modulePath = path.join(dir, moduleName)
      fs.accessSync(modulePath)
      return modulePath
    } catch (err) {
      // Ignore errors
    }
  }

  return null
}

module.exports.importAll = importAll
module.exports.moduleExists = moduleExists
module.exports.getModulePath = getModulePath
