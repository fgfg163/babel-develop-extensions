(function (window, document) {
  const defines = {};
  const require = function (id) {
    if (defines[id]) {
      return defines[id];
    } else {
      return new Promise.resolve(1);
    }
  };
  window.define = (id, defineModule) => {
    defines[id] = Promise.resolve(defineModule);
  };
})(window, document);