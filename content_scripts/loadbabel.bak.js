

const loadScript = (params) => {
  let pstart;
  if (params.src) {
    pstart = getScript(params.src);
  } else {
    pstart = Promise.resolve([params.innerHTML]);
  }

  return pstart.then(([result]) => {
    const theNewScript = window.document.createElement('script');
    Object.entries(params).forEach(([key, value]) => {
      theNewScript[key] = value;
    });
    theNewScript.removeAttribute('src');
    theNewScript.innerHTML = result;
    return theNewScript;
  });
};

const runScript = (theNewScript, parentNode) => {
  parentNode.appendChild(theNewScript);
  // setTimeout(() => {
  //   parentNode.removeChild(theNewScript);
  // }, 0);
}

const loadScriptWithSrc = (params) => {
  const theScript = document.createElement('script');
  Object.entries(params).forEach(([key, value]) => {
    theScript[key] = value;
  });
  return theScript;
};

(async () => {
  const theScriptList = [];
  const theScriptPromiseList = theScriptList.map(element => loadScriptWithSrc(element));
  const theBody = document.getElementsByTagName('body')[0];

  for (const elementPromise of theScriptPromiseList) {
    const element = await elementPromise;
    runScript(element, theBody);
  }
})();

chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    if (sender.tab) {
      switch (request.type) {
        case 'GET_SCRIPT': {
          const [res] = await getScript(request.url);
          sendResponse({ type: 'RESPONSE_GET_SCRIPT', value: res });
          break;
        }
        case 'GET_LOCAL_SCRIPT': {
          const theUrl = chrome.extension.getURL(request.url);
          const [res] = await getScript(theUrl);
          sendResponse({ type: 'RESPONSE_GET_LOCAL_SCRIPT', value: res });
          break;
        }
        default:
      }
    }
  }
);