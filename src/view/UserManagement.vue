<template> 
  <div class="user-management">
    <h1 class="title">用户管理</h1>

    <!-- 搜索框 + 高级筛选按钮 -->
    <div class="search-box">
      <el-input
        v-model="searchWord"
        placeholder="请输入姓名/病历号/医院名/手机号搜索"
        clearable
        @clear="fetchUserList"
        @keyup.enter="searchUsers"
        style="width: 300px; margin-right: 10px;"
      ></el-input>
      <el-button type="primary" @click="searchUsers">查询</el-button>
      <el-button @click="toggleAdvanced" style="margin-left: 10px;">
        <el-icon><Filter /></el-icon>
        高级筛选
      </el-button>
    </div>

    <!-- 高级筛选面板 -->
    <el-collapse-transition>
      <el-card v-show="showAdvanced" class="advanced-search-card">
        <el-form :inline="true" :model="advancedForm" class="advanced-form">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="年龄区间">
                <el-input-number v-model="advancedForm.ageMin" :min="0" :max="120" placeholder="最小" style="width: 90px" />
                <span style="margin: 0 5px">-</span>
                <el-input-number v-model="advancedForm.ageMax" :min="0" :max="120" placeholder="最大" style="width: 90px" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="测试次数">
                <el-input-number v-model="advancedForm.testTimesMin" :min="0" placeholder="最少" style="width: 90px" />
                <span style="margin: 0 5px">-</span>
                <el-input-number v-model="advancedForm.testTimesMax" :min="0" placeholder="最多" style="width: 90px" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="医院">
                <el-select v-model="advancedForm.hospitalId" placeholder="请选择医院" clearable style="width: 180px">
                  <el-option
                    v-for="hospital in hospitals"
                    :key="hospital.id"
                    :label="hospital.name"
                    :value="hospital.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="得分区间">
                <el-input-number v-model="advancedForm.scoreMin" :min="0" :max="100" placeholder="最低" style="width: 90px" />
                <span style="margin: 0 5px">-</span>
                <el-input-number v-model="advancedForm.scoreMax" :min="0" :max="100" placeholder="最高" style="width: 90px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="注册时间">
                <el-date-picker
                  v-model="advancedForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 350px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <el-button type="primary" @click="doAdvancedSearch">应用筛选</el-button>
                <el-button @click="resetAdvanced">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </el-collapse-transition>

    <!-- 用户列表表格 -->
    <el-table :data="userList" border style="width: 100%" stripe>
      <el-table-column prop="userId" label="序号" width="80" align="center" />
      <el-table-column prop="number" label="手机号" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="hospital" label="医院" align="center" />
      <el-table-column prop="medicalId" label="医疗编号" align="center" />
      <el-table-column prop="score" label="测试平均分" align="center" />
      <el-table-column prop="testTimes" label="测试次数" align="center">
        <template #default="scope">
          <el-link type="primary" @click="goToTestResults(scope.row.medicalId)">
            {{ scope.row.testTimes }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="170"
        align="center"
        class-name="action-column"
      >
        <template #default="scope">
          <div style="display: flex; align-items: center; gap: 5px;">
            <el-button 
              size="small" 
              type="primary" 
              icon="el-icon-edit" 
              @click="editUser(scope.row)"
            >修改</el-button>
            <el-button 
              size="small" 
              type="danger" 
              icon="el-icon-delete" 
              @click="confirmDelete(scope.row)"
            >删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      layout="prev, pager, next, jumper, total"
      @current-change="fetchUserList"
      class="pagination"
    />

    <!-- 编辑弹窗 -->
    <el-dialog
      title="编辑用户"
      v-model="dialogVisible"
      width="50%"
      @close="resetForm"
    >
      <el-form :model="editForm" ref="form" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.number" placeholder="请输入手机号" />
        </el-form-item>

        <!-- 医院选择框 -->
        <el-form-item label="医院">
          <el-select v-model="editForm.hospitalId" placeholder="请选择医院">
            <el-option
              v-for="hospital in hospitals"
              :key="hospital.id"
              :label="hospital.name"
              :value="hospital.id"
            />
          </el-select>
        </el-form-item>

        <!-- 去掉病历号和测试分数 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUserChanges">保存</el-button>
        </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getUserList, searchUser, getHospital, updateUser, deleteUser } from "@/api/user";
import { ElButton, ElDialog, ElForm, ElInput, ElFormItem, ElLink, ElSelect, ElOption, ElInputNumber, ElDatePicker } from 'element-plus';
import { ElMessage,ElMessageBox } from 'element-plus';
import { Filter } from '@element-plus/icons-vue';

import router from '../router/index';

const searchWord = ref(""); // 搜索关键词
const userList = ref([]); // 用户列表
const dialogVisible = ref(false); // 控制弹窗是否可见
const showAdvanced = ref(false); // 高级筛选显示状态
const editForm = reactive({
  userId: "",
  name: "",
  number: "",
  hospitalId: "",
}); // 编辑表单的数据
const hospitals = ref([]); // 存储医院列表

// 高级筛选表单
const advancedForm = reactive({
  ageMin: null,
  ageMax: null,
  testTimesMin: null,
  testTimesMax: null,
  hospitalId: null,
  scoreMin: null,
  scoreMax: null,
  dateRange: []
});

// 切换高级筛选显示
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value;
};

// 执行高级筛选
const doAdvancedSearch = () => {
  console.log('高级筛选条件：', advancedForm);
  ElMessage.success('筛选条件已应用');
  fetchUserList();
};

// 重置高级筛选
const resetAdvanced = () => {
  advancedForm.ageMin = null;
  advancedForm.ageMax = null;
  advancedForm.testTimesMin = null;
  advancedForm.testTimesMax = null;
  advancedForm.hospitalId = null;
  advancedForm.scoreMin = null;
  advancedForm.scoreMax = null;
  advancedForm.dateRange = [];
  ElMessage.info('筛选条件已重置');
};

// 重置表单数据
const resetForm = () => {
  editForm.name = '';
  editForm.number = '';
  editForm.hospitalId = '';
};

// 分页
const pagination = reactive({
  currentPage: 1, // 当前页
  pageSize: 20, // 每页数量
  total: 0, // 总记录数
});

const goToTestResults = (medicalId) => {
  sessionStorage.setItem('activePath', '/home/test');
  router.push({
    name: 'TestResults',
    query: { medicalId },
  });
};

// 获取用户列表
const fetchUserList = async () => {
  try {
    const data = await getUserList(pagination.currentPage, pagination.pageSize);
    userList.value = data.records.map((user) => ({
      ...user
    }));
    pagination.total = data.total;
  } catch (error) {
    console.error("获取用户列表失败：", error);
  }
  console.log('用户列表已更新:');
};

// 搜索用户
const searchUsers = async () => {
  if (!searchWord.value.trim()) {
    fetchUserList();
    return;
  }

  try {
    const data = await searchUser(
      searchWord.value,
      pagination.currentPage,
      pagination.pageSize
    );
    userList.value = data.records.map((user) => ({
      ...user
    }));
    pagination.total = data.total;
  } catch (error) {
    console.error("搜索用户失败：", error);
  }
};

// 编辑用户
const editUser = (user) => {
  console.log("点击了编辑按钮，用户信息：", user); // 检查是否触发
  editForm.userId = user.userId;
  editForm.name = user.name;
  editForm.number = user.number;
  editForm.hospitalId = user.hospitalId;

  dialogVisible.value = true; // 显示弹窗
};

// 获取医院列表
const fetchHospitals = async () => {
  try {
    const data = await getHospital(); // 调用 getHospital 接口获取医院数据
    hospitals.value = data; // 设置医院数据
  } catch (error) {
    console.error("获取医院列表失败：", error);
  }
};

// 保存编辑的用户信息
const saveUserChanges = async () => {
  try {
    // 这里你需要调用接口将编辑后的数据保存到后端
    console.log("保存用户数据：", editForm);
    await updateUser(editForm); // 调用更新接口保存数据
    dialogVisible.value = false; // 关闭弹窗
    fetchUserList(); // 重新获取用户列表
  } catch (error) {
    console.error("保存用户信息失败：", error);
  }
};

// 删除用户
const confirmDelete = (user) => {
  ElMessageBox.confirm(
    '你确定要删除这个用户吗？',  // 确认框的提示信息
    '警告',  // 确认框标题
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',  // 警告类型
    }
  )
  .then(() => {
    console.log("删除用户：", user);
    deleteUser(user.userId);  // 删除用户逻辑
    fetchUserList();  // 刷新用户列表
    ElMessage.success('删除成功'); // 删除成功提示
    fetchUserList();  // 刷新用户列表
  })
};


// 初始化
onMounted(() => {
  sessionStorage.setItem('activePath', '/home/user');
  fetchUserList();
  fetchHospitals(); // 初始化时获取医院列表
});
</script>

<style scoped>
.user-management {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.search-box {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  margin-bottom: 20px;
  width: 100%; /* 宽度设置为100%，或者根据需要调整 */
}

.advanced-search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.advanced-form {
  padding: 10px 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.action-column {
  display: flex;
  justify-content: space-around;
}

.el-table {
  margin-top: 20px;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.el-table--border {
  border-radius: 8px;
}

.el-table__header th {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #303133;
}
</style>