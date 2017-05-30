const loadScript = (params, parentNode) => {
  return new Promise((resolve, reject) => {
    const theNewScript = window.document.createElement('script');
    Object.entries(params).forEach(([key, value]) => {
      theNewScript[key] = value;
    });
    const babelObj = Babel.transform(params.innerHTML, {
      presets: ['react', 'stage-2'],
      plugins: ['transform-es2015-modules-commonjs'],
    });
    console.log(babelObj);
    if (params.innerHTML) {
      theNewScript.innerHTML = `
      (function(){
      ${babelObj.code}
      })();`;
    }
    resolve(theNewScript);
  });
};

const runScript = (theNewScript, parentNode) => {
  parentNode.appendChild(theNewScript);
  // setTimeout(() => {
  //   parentNode.removeChild(theNewScript);
  // }, 0);
}

(async () => {
  const theScriptList = Array.prototype.filter.call(window.document.querySelectorAll('script'), e => e.type === 'text/babel');

  const theScriptPromiseList = theScriptList.map((element) => {
    if (element.innerHTML !== '') {
      const param = {
        innerHTML: element.innerHTML,
        type: 'text/javascript',
      };
      return loadScript(param);
    }
  });

  const theBody = document.getElementsByTagName('body')[0];

  for (const elementPromise of theScriptPromiseList) {
    const element = await elementPromise;
    runScript(element, theBody);
  }
})();