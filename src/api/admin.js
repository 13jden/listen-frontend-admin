import { httpGet, httpPost } from '../utils/http'; // 假设你已经封装了 http 请求方法

// 获取验证码
export const getCheckCode = async () => {
  try {
    const response = await httpGet('/checkcode');
    return response.data; // 返回验证码的图片数据和验证码的 key
  } catch (error) {
    throw new Error('获取验证码失败');
  }
};

// 登录接口
export const login = async (form) => {
  try {
    const response = await httpGet('/admin/login', form);
    console.log(response);
    return response;
  } catch (error) {
    throw new Error('登录失败');
  }
};

// 获取登录数据
export const getdata = async () => {
  try {
    const response = await httpGet('/admin/getIndexdata');
    return response.data;
  } catch (error) {
    throw new Error('获取数据失败');
  }
};