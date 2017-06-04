;(function (global, document) {
  const theOptions = {
    getScript: (url, options = {}) => (
      new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'GET_SCRIPT', url, }, function (response) {
          console.log(response);
          resolve(response);
        });
      })
    ),
  };

  const domBody = document.getElementsByTagName('body')[0];

  const moduleList = {};

  const path = {
    resolve: (...param) => {
      let thePathArr = [];
      param.filter(e => (typeof (e) === 'string' && !!e))
        .forEach((element) => {
          if (element.slice(0, 1) === '/') {
            thePathArr = [''];
          }
          element.split('/').filter(e => !!e).forEach((ePath) => {
            const lastPath = thePathArr[thePathArr.length - 1];
            if (!lastPath || lastPath === '.' || lastPath === '..') {
              thePathArr.push(ePath);
            } else if (ePath === '.') {
              // nothing
            } else if (ePath === '..') {
              thePathArr.pop();
            } else {
              thePathArr.push(ePath);
            }
          });
        });
      return thePathArr.join('/');
    },
    dirname: (param = '') => {
      return param.match(/^.*\//)[0] || '/';
    },
  };

  const transImportToRequire = (text) => {
    let hasImport = false;
    let hasExport = false;
    const result = text.split('\n').map((line) => {
      const trimLine = line.trim();
      if (trimLine.slice(0, 6) === 'import') {
        hasImport = true;
        let newLine = trimLine
          .replace(/^import\s+?/, 'const ')
          .replace(/from\s*?("|')(.*)("|')/, '= require($1$2$3)')
          .replace(/require\(("|')(.*)("|')\);?/, '_interopRequireDefault(await require($1$2$3));');
        return newLine
      } else if (trimLine.slice(0, 6) === 'export') {
        hasExport = true;
        let newLine = trimLine
          .replace(/^export\s+?default/, 'module.exports.default = ')
          .replace(/^export\s+?(?:const|let|var)\s+?([^\s]*) \s*= /, 'module.exports.$1 = ')
          .replace(/^export\s+?function\s+?([^\s]*)/, 'module.exports.$1 = function')
        return newLine
      }
      return line;
    });
    result.unshift(`"use strict"`);
    if (hasExport) {
      result.unshift(`Object.defineProperty(exports, "__esModule", {\n  value: true\n});`);
    }
    if (hasImport) {
      result.unshift(`function _interopRequireDefault(obj) {\n  return obj && obj.__esModule ? obj : { default: obj };\n}`);
    }
    return result.join('\n');
  };

  const requireFactory = (baseId) => ((relativeId) => {
    const id = path.resolve(path.dirname(baseId), relativeId);
    if (moduleList[id]) {
      return moduleList[id].exports;
    }

    let exportsHandle;

    const exportsPromise = Promise.all([
      new Promise((resolve) => {
        exportsHandle = resolve;
      }),
      (async (id) => {
        const [res] = await theOptions.getScript(id);
        const theScript = document.createElement('script');
        theScript.innerHTML = `\n;define('${id}',async function (require, module, exports) {\n${transImportToRequire(res)}\n});\n`;
        domBody.appendChild(theScript);
      })(id),
    ]).then(([res]) => {
      moduleHandle.state = 'resolve';
      return res;
    }).catch((err) => {
      moduleHandle.state = 'reject';
      console.error(err);
    });

    const moduleHandle = {
      id,
      state: 'pending',
      exportsHandle,
      exports: {},
    };

    moduleList[id] = moduleHandle;
    return exportsPromise;
  });


  // mod is a async function
  global.define = async (id, mod) => {
    if (typeof (mod) !== 'function') {
      throw TypeError('Module must be a async function or return a promise');
    }
    const module = moduleList[id];
    const require = requireFactory(id);
    const moduleHandle = mod(require, module, module.exports);
    if (typeof (moduleHandle) !== 'object' || typeof (moduleHandle.then) !== 'function') {
      throw TypeError('Module must return a promise');
    }
    await moduleHandle;

    module.exportsHandle(module.exports);
  };

  global.awaitRequire = (options = {}) => {
    const globalPath = global.location.href.replace(global.location.origin, '');

    let entry = [];
    if (typeof (options.entry) === 'string') {
      entry = [options.entry];
    } else if (Array.isArray(options.entry)) {
      entry = options.entry;
    }
    entry.forEach((id) => {
      requireFactory(path.dirname(globalPath))(id);
    });
  };
})(window, window.document);