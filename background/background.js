const tabList = {};
const tabRequestBodyList = {};
const tabRequestHeaderList = {};

chrome.webRequest.onBeforeRequest.addListener(
  function (details, a, b, c) {
    if (details.type === 'main_frame') {
      tabList[details.tabId] = true;
      tabRequestBodyList[details.tabId] = details;
    } else if ((details.type === 'script' || details.type === 'stylesheet') && tabList[details.tabId]) {
      return { cancel: true };
    } else if (details.type === 'xmlhttprequest') {
      delete tabList[details.tabId];
      delete tabRequestBodyList[details.tabId];
    }
  },
  { urls: ['http://*/*', 'https://*/*'] },
  ["blocking", "requestBody"],
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details, a, b, c) {
    if (details.type === 'main_frame') {
      tabRequestHeaderList[details.tabId] = details;
    } else if (details.type === 'xmlhttprequest') {
      delete tabRequestHeaderList[details.tabId];
    }
  },
  { urls: ['http://*/*', 'https://*/*'] },
  ["requestHeaders"],
);

chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    if (sender.tab) {
      switch (request.type) {
        case 'GET_LAST_MAIN_FRAME_DETAILS': {
          sendResponse({
            type: 'RESPONSE_LAST_MAIN_FRAME_DETAILS',
            value: [
              tabRequestBodyList[sender.tab.id],
              tabRequestHeaderList[sender.tab.id]
            ],
          });
          break;
        }
        default:
      }
    }
  }
);