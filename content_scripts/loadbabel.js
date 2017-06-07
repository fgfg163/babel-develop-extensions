const sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
};

const runScript = function (node, parentNode = document.body) {
  let params = node;
  if (typeof (params.tagName) === 'string') {
    params = {};
    [...node.attributes].forEach((attr) => {
      params[attr.name] = attr.value;
    });
    if (!node.src) {
      params.innerHTML = node.innerHTML;
    }
  }

  if (params.src) {
    return new Promise((resolve) => {
      const theScript = document.createElement('script');
      Object.entries(params).forEach(([key, value]) => {
        theScript[key] = value;
      });
      theScript.onload = () => {
        setTimeout(() => {
          resolve();
        }, 0);
      };
      theScript.onerror = resolve;
      parentNode.appendChild(theScript);
    });
  } else {
    const theScript = document.createElement('script');
    Object.entries(params).forEach(([key, value]) => {
      theScript[key] = value;
    });
    parentNode.appendChild(theScript);
    return 0;
  }
};


const parseDom = function (text) {
  const theIframe = document.createElement('iframe');
  theIframe.style.position = 'fixed';
  theIframe.style.top = '0';
  theIframe.style.left = '0';
  theIframe.style.right = '0';
  theIframe.style.bottom = '0';
  theIframe.style.width = '100%';
  theIframe.style.height = '100%';
  document.body.appendChild(theIframe);
  const newScript = theIframe.contentDocument.createElement('script');
  newScript.innerHTML = 'window.sss = "aaaabbbb"';
  theIframe.contentDocument.body.appendChild(newScript)
  theIframe.contentDocument.write(text);
  theIframe.contentDocument.close(text);
  setTimeout(() => {
    const newScript = theIframe.contentDocument.createElement('script');
    newScript.innerHTML = 'console.log(window.sss)';
    theIframe.contentDocument.body.appendChild(newScript)
  }, 1000);
  return theIframe.contentDocument;
};

const replaceOldScript = async (oldScript) => {
  const [res] = await getRes(oldScript.src);
  const newScript = oldScript.cloneNode();
  newScript.setAttribute('data-src', newScript.src);
  newScript.removeAttribute('src');
  newScript.innerHTML = res;
  oldScript.parentNode.replaceChild(newScript, oldScript);
  return newScript;
}

const sendMessagePromise = function (msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, resolve);
  });
};

(async () => {
  // await runScript({ src: chrome.extension.getURL('/lib/await-require.js') });
  const { value: lastMainFrameDetails } = await sendMessagePromise({ type: 'GET_LAST_MAIN_FRAME_DETAILS' });
  let pageOptions = {};
  if (lastMainFrameDetails[0].method === 'POST') {
    const headers = {};
    lastMainFrameDetails[1].requestHeaders.forEach((e) => {
      headers[e.name] = e.value;
    });
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    pageOptions = {
      method: lastMainFrameDetails[0].method,
      headers: headers,
      data: lastMainFrameDetails[0].requestBody.formData,
    }
  }
  const [res] = await getRes(window.location.href, pageOptions);
  const resRoot = parseDom(res);
  // const scriptList = [...resRoot.getElementsByTagName('script')];
  // const scriptLoadList = await Promise.all(
  //   scriptList.map((theScript) => {
  //     if (theScript.src) {
  //       return replaceOldScript(theScript);
  //     }
  //     return theScript;
  //   })
  // );
  // document.close();
  // document.write(resRoot.innerHTML);
  // document.close();
})();


chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    if (sender.tab) {
      switch (request.type) {
        case 'GET_SCRIPT': {
          const [res] = await getRes(request.url);
          sendResponse({ type: 'RESPONSE_GET_SCRIPT', value: res });
          break;
        }
        case 'GET_LOCAL_SCRIPT': {
          const theUrl = chrome.extension.getURL(request.url);
          const [res] = await getRes(theUrl);
          sendResponse({ type: 'RESPONSE_GET_LOCAL_SCRIPT', value: res });
          break;
        }
        default:
      }
    }
  }
);