import axios from './axios';

// GET 请求
export const httpGet = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

// POST 请求
export const httpPost = (url, data) => {
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

// PUT 请求
export const httpPut = (url, data) => {
  return new Promise((resolve, reject) => {
    axios
      .put(url, data)
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

// DELETE 请求
export const httpDelete = (url, params) => {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, { params })
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};
