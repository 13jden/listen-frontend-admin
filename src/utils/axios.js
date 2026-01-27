import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',  // 你的API基础地址
  timeout: 5000,  // 请求超时设置
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在请求发送之前做些什么，比如添加 token
    const token = sessionStorage.getItem('token');  // 从 sessionStorage 获取 token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    return response.data;
  },
  (error) => {
    // 对响应错误做些什么
    return Promise.reject(error);
  }
);

export default instance;
