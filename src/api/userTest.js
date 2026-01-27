import { httpGet,httpPost } from '../utils/http'; // 假设你已经封装了 http 请求方法

// 获取用户列表（分页）
export const getUserTestList = async (PageNum = 1, PageSize = 20) => {
  try {
    const response = await httpGet('/usertest/getUserTest', { PageNum, PageSize });
    return response.data; // 返回用户列表数据
  } catch (error) {
    throw new Error('获取用户测试信息失败');
  }
};
export const getUserTestDetail = async (testId) => {
    try {
      const response = await httpGet('/testdetail/getDetail', { testId});
      return response.data; // 返回用户列表数据
    } catch (error) {
      throw new Error('获取测试详细信息失败');
    }
  };

export const searchUserTest = async (keyWord,PageNum,PageSize) => {
    try {
      const response = await httpGet('/usertest/searchUserTest', { keyWord, PageNum, PageSize});
      console.log(response.data);
      return response.data; // 返回用户列表数据
    } catch (error) {
      throw new Error('获取测试详细信息失败');
    }
  };