const xhrPromise = (url, option = {}) => (
  new Promise((resolve, reject) => {
    let theUrl = url;
    const {
      data = {},
      header = {},
    } = option;
    let {
      method,
    } = option;
    method = method ? method.toUpperCase() : 'GET';


    const xhr = new XMLHttpRequest();

    const formData = new FormData();

    if (method === 'GET') {
      if (Object.keys(data).length > 0) {
        const search = theUrl.match(/\?([^#]*)/)[1] || '';
        const searchParams = new URLSearchParams(search);
        Object.entries(data).forEach(([key, value]) => {
          searchParams.append(key, value);
        });
        theUrl = `${theUrl}?${searchParams.toString()}`;
      }
    } else {
      Object.entries(data).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
    }
    xhr.open(method, theUrl, true);
    if (header) {
      Object.entries(header).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    xhr.onload = (event) => {
      resolve([event.currentTarget.responseText, event.currentTarget]);
    }
    xhr.onerror = (event) => {
      reject([event.currentTarget]);
    }
    xhr.send(formData);
  })
);

const loadScript = (params, parentNode) => {
  let pstart;
  if (params.src) {
    pstart = xhrPromise(params.src);
  } else {
    pstart = Promise.resolve([params.innerHTML]);
  }

  return pstart.then(([result]) => {
    const theNewScript = window.document.createElement('script');
    Object.entries(params).forEach(([key, value]) => {
      theNewScript[key] = value;
    });
    const babelObj = Babel.transform(result, {
      presets: ['react', 'stage-2'],
      plugins: ['transform-es2015-modules-commonjs'],
    });
    console.log(babelObj);
    theNewScript.innerHTML = `
      (function(){
      ${babelObj.code}
      })();`;
    return theNewScript;
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

  const theScriptPromiseList = theScriptList.map(element => loadScript(element));

  const theBody = document.getElementsByTagName('body')[0];

  for (const elementPromise of theScriptPromiseList) {
    const element = await elementPromise;
    runScript(element, theBody);
  }
})();