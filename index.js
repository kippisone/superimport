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

let readDir = function(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    let filePath = path.join(dir, file);
    let stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(readDir(filePath));
    }
    else {
      if (/\.js(on)?$/.test(file)) {
        files.push(filePath);
      }
    }
  });

  return files;
};

module.exports = function(moduleName, paths) {
  paths = paths || module.parent.paths.concat(getPaths());
  for (let dir of paths) {
    try {
      return require(path.join(dir, moduleName));
    } catch (err) {
      // Ignore errors
    }
  }

  throw new Error(`Module ${moduleName} not found!\nYou can install it by using the command 'npm install ${moduleName} --save'\n\n`);
};

module.exports.importAll = function(dir, recursive) {
  let files = readDir(dir).map(f => require(f));
  console.log(files, dir)
  files.apply = function(ctx, args) {
    files.forEach(file => file.apply(ctx, args));
  };

  files.call = function(ctx) {
    let args = Array.prototype.slice.call(arguments, 1);
    files.apply(ctx, args);
  };

  return files;
};
