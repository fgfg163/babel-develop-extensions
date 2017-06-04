const getRes = function (url, options = {}) {
  return new Promise((resolve, reject) => {
    let theUrl = url;
    const { data = {}, headers = {} } = options;
    let { method } = options;
    method = method ? method.toUpperCase() : 'GET';

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    let formData;

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
      if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        const formDataObj = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          formDataObj.append(key, value);
        });
        formData = formDataObj.toString();
      } else {
        formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
    }
    xhr.open(method, theUrl, true);
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
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
};