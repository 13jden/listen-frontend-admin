import { httpGet,httpPost, httpDelete} from '../utils/http'; // 假设你已经封装了 http 请求方法

// 获取用户列表（分页）
export const getUserList = async (pageNum = 1, pageSize = 20) => {
  try {
    const response = await httpGet('/user/list', { pageNum, pageSize });
    return response.data; // 返回用户列表数据
  } catch (error) {
    throw new Error('获取用户列表失败');
  }
};

// 模糊搜索用户
export const searchUser = async (word, pageNum = 1, pageSize = 20) => {
  try {
    const response = await httpGet('/user/search', { word, pageNum, pageSize });
    return response.data; // 返回搜索结果
  } catch (error) {
    throw new Error('搜索用户失败');
  }
};

// 获取医院list
export const getHospital = async () => {
  try {
    const response = await httpGet('/hospital/list');
    return response.data; // 返回搜索结果
  } catch (error) {
    throw new Error('查找失败');
  }
};

// 更新用户
export const updateUser = async (user) => {
  try {
    const response = await httpPost('/user/update', user); // 发送 POST 请求到后端
    return response.data; // 返回后端的成功消息
  } catch (error) {
    throw new Error('更新用户失败');
  }
};

// 删除用户
export const deleteUser = async (userId) => {
  try {
    const response = await httpDelete('/user/delete', { userId }); // 发送 DELETE 请求到后端
    return response.data; // 返回后端的成功消息
  } catch (error) {
    throw new Error('删除用户失败');
  }
};
