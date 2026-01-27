import { httpGet, httpPost, httpDelete } from '../utils/http';

// 获取医院列表
export const getHospital = async () => {
  try {
    const response = await httpGet('/hospital/list');
    return response.data; // 返回医院列表数据
  } catch (error) {
    throw new Error('查找失败');
  }
};

// 添加医院
export const addHospital = async (hospitalName) => { 
    try {
      // 传递一个包含 hospitalName 的对象
      const response = await httpGet('/hospital/add', { hospitalName });
      return response.data; // 返回添加成功的结果
    } catch (error) {
      throw new Error('添加失败');
    }
  };
  

// 修改医院
export const updateHospital = async (hospital) => {
    try {
      console.log(hospital);
      const response = await httpPost('/hospital/update',  hospital ,{ 
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data; // 返回添加成功的结果
    } catch (error) {
      throw new Error('修改失败');
    }
  };

// 删除医院
export const deleteHospital = async (hospitalId) => {
  try {
    const response = await httpDelete(`/hospital/delete?hospitalId=${hospitalId}`);
    return response.data; // 返回删除成功的结果
  } catch (error) {
    throw new Error('删除失败');
  }
};
