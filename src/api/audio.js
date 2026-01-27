import { httpGet, httpPost,httpDelete } from '../utils/http'; // 假设你已经封装了 http 请求方法

// 获取音频列表（分页）
export const getAudioList = async (pageNum = 1, pageSize = 20) => {
  try {
    const response = await httpGet('/audio/list', { pageNum, pageSize });
    return response.data; // 返回音频列表数据
  } catch (error) {
    throw new Error('获取音频列表失败');
  }
};

// 获取音频列表（模糊）
export const searchAudioList = async (keyWord,pageNum = 1, pageSize = 20) => {
  try {
    const response = await httpGet('/audio/search', { keyWord,pageNum, pageSize });
    return response.data; // 返回音频列表数据
  } catch (error) {
    throw new Error('获取音频列表失败');
  }
};

// 上传音频文件
export const uploadAudio = async (file) => {
  const formData = new FormData();
  formData.append('testAudio', file); // 确保 file 是 File 对象
  try {
    const response = await httpPost('/audio/uploadFile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // 返回上传的文件名
  } catch (error) {
    throw new Error('音频文件上传失败');
  }
};

// 添加音频
export const addAudio = async (content, adminId, fileName) => {
  try {
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('content', content); // 添加音频描述
    formData.append('adminId', adminId); // 添加管理员 ID
    formData.append('fileName', fileName); // 添加文件名

    // 发送 POST 请求
    const response = await httpPost('/audio/addFile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log(response);
    return response.data; // 返回音频数据
  } catch (error) {
    throw new Error('添加音频失败');
  }
};
// 删除临时音频文件
export const deleteTempFile = async (fileName) => {
    try {
      const response = await httpDelete('/audio/deleteTempFile', { fileName });
      return response.data; // 返回删除成功消息
    } catch (error) {
      throw new Error('删除临时文件失败');
    }
  };
  
// 删除音频
export const deleteAudio = async (id) => {
  try {
    const response = await httpDelete('/audio/deleteFile', { id });
    return response.data; // 删除成功的消息
  } catch (error) {
    throw new Error('删除音频失败');
  }
};

export const updateAudio = async (audio) => {
  try {
    const response = await httpPost('/audio/update',  audio,{
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data; // 返回音频列表数据
  } catch (error) {
    throw new Error('修改音频失败');
  }
};