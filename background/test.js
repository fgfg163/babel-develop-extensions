chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.tabs.executeScript(tabId, {
    code: `
    let theScript = document.createElement('script');
    theScript.innerHTML = 'for (var i = 0; i < 5000; i++) { console.log(i); }';
    document.querySelector('*').appendChild(theScript);
    `,
    allFrames: true,
    runAt: 'document_start',
  });
});