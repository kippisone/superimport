const path = require('path')

const superimport = require('../index.js')
const inspect = require('inspect.js')

const MODULE_DIRS = [
  path.join(__dirname, 'libs'),
  path.join(__dirname, 'modules')
];

describe('superimport', () => {
  describe('moduleExists', () => {
    it('check if module exists in one of the paths', () => {
      inspect(superimport.moduleExists('testLib.js', MODULE_DIRS)).isTrue()
    });

    it('check if module not exists in one of the paths', () => {
      inspect(superimport.moduleExists('testNotFoundLib.js', MODULE_DIRS)).isFalse()
    });
  });

  describe('getModulePath', () => {
    it('check if module exists in one of the paths', () => {
      inspect(superimport.getModulePath('testLib.js', MODULE_DIRS)).isEql(path.join(__dirname, 'modules/testLib.js'))
    });

    it('check if module not exists in one of the paths', () => {
      inspect(superimport.getModulePath('testNotFoundLib.js', MODULE_DIRS)).isNull()
    });
  });

  describe('superimport', () => {
    it('imports an existing module from one of the paths', () => {
      inspect(superimport('testLib.js', MODULE_DIRS)).isEql('one')
      inspect(superimport('otherLib.js', MODULE_DIRS)).isEql('two')
    });

    it('imports a not existing module from one of the paths', () => {
      inspect(superimport).withArgs('notFoundLib.js', MODULE_DIRS).doesThrow(/Module 'notFoundLib.js' was not found!/)
    });

    it('imports a broken module from one of the paths', () => {
      inspect(superimport).withArgs('shittyLib.js', MODULE_DIRS).doesThrow(/NOT_FOUND_CONSTANT is not defined/)
    });
  });

  describe('importAll()', () => {
    it('imports all modules from a certain folder', () => {
      const modules = superimport.importAll('./modules/sub/')
      inspect(modules).isArray()
      inspect(modules).hasLength(2)
      inspect(modules).hasAnyValues([{
        name: 'bar',
        filename: path.join(__dirname, './modules/sub/bar.js')
      }])
    })

    it('imports all modules from a certain folder recursive', () => {
      const modules = superimport.importAll('./modules/sub/', true)
      inspect(modules).isArray()
      inspect(modules).hasLength(4)
      inspect(modules).hasAnyValues([{
        name: 'bar',
        filename: path.join(__dirname, './modules/sub/bar.js')
      }, {
        name: 'blub',
        filename: path.join(__dirname, './modules/sub/blub.js')
      }])
    })

    it('imports all modules from certain folders recursive', () => {
      const modules = superimport.importAll(['./modules/sub/'])
      inspect(modules).isArray()
      inspect(modules).hasLength(2)
      inspect(modules).hasAnyValues([{
        name: 'bar',
        filename: path.join(__dirname, './modules/sub/bar.js')
      }, {
        name: 'foo',
        filename: path.join(__dirname, './modules/sub/foo.js')
      }])
    })

    it('throws an error if folder does not exists', () => {
      inspect(superimport.importAll).withArgs('./notfound/').doesThrow()
    })

    it('does not throws an error if silent flag is set', () => {
      inspect(superimport.importAll('./notfound/', { silent: true })).isEql([])
    })
  })
});
