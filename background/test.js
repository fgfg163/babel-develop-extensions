chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading') {
    if (tab.url.slice(0, 7) === 'http://' || tab.url.slice(0, 8) === 'https://') {
      chrome.tabs.executeScript(tabId, {
        code: ';(' + function () {
          let theScript = document.createElement('script');
          theScript.innerHTML = 'for (var i = 0; i < 5000; i++) { console.log(i); }';
          document.querySelector('*').appendChild(theScript);
        }.toString() + ')();',
        allFrames: true,
        runAt: 'document_start',
      });
    }
  }
});