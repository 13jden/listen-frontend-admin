<template>
  <div class="admin-management">
    <div class="page-header">
      <h1 class="title">管理员管理</h1>
      <div class="header-actions">
        <el-button type="primary" icon="Plus" @click="showAddDialog">添加管理员</el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.roleId" placeholder="请选择角色" clearable style="width: 150px">
            <el-option label="超级管理员" :value="1" />
            <el-option label="普通管理员" :value="2" />
            <el-option label="医护人员" :value="3" />
            <el-option label="研究人员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="序号" width="80" align="center" />
        <el-table-column prop="username" label="用户名" align="center" min-width="120" />
        <el-table-column prop="realName" label="真实姓名" align="center" min-width="100" />
        <el-table-column prop="phone" label="手机号" align="center" min-width="120" />
        <el-table-column prop="email" label="邮箱" align="center" min-width="160" />
        <el-table-column prop="roleName" label="角色" align="center" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.roleId)" size="small">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hospitalName" label="所属医院" align="center" min-width="140" />
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" min-width="160" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link icon="Delete" @click="handleDelete(row)">删除</el-button>
            <el-button type="warning" size="small" link icon="Key" @click="handleResetPassword(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" :value="1" />
            <el-option label="普通管理员" :value="2" />
            <el-option label="医护人员" :value="3" />
            <el-option label="研究人员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属医院" prop="hospitalId">
          <el-select v-model="formData.hospitalId" placeholder="请选择医院" style="width: 100%" clearable>
            <el-option v-for="h in hospitals" :key="h.id" :label="h.name" :value="h.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  username: '',
  roleId: null,
  status: null
})

// 表格数据（写死）
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    phone: '13800138000',
    email: 'admin@example.com',
    roleId: 1,
    roleName: '超级管理员',
    hospitalName: '总院',
    status: 1,
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    username: 'doctor_zhang',
    realName: '张医生',
    phone: '13800138001',
    email: 'zhang@example.com',
    roleId: 3,
    roleName: '医护人员',
    hospitalName: '第一医院',
    status: 1,
    createTime: '2024-02-20 14:30:00'
  },
  {
    id: 3,
    username: 'researcher_li',
    realName: '李研究员',
    phone: '13800138002',
    email: 'li@example.com',
    roleId: 4,
    roleName: '研究人员',
    hospitalName: '研究中心',
    status: 1,
    createTime: '2024-03-10 09:15:00'
  },
  {
    id: 4,
    username: 'manager_wang',
    realName: '王管理员',
    phone: '13800138003',
    email: 'wang@example.com',
    roleId: 2,
    roleName: '普通管理员',
    hospitalName: '第二医院',
    status: 1,
    createTime: '2024-03-25 16:45:00'
  },
  {
    id: 5,
    username: 'nurse_zhao',
    realName: '赵护士',
    phone: '13800138004',
    email: 'zhao@example.com',
    roleId: 3,
    roleName: '医护人员',
    hospitalName: '第一医院',
    status: 0,
    createTime: '2024-04-05 11:20:00'
  }
])

// 医院列表（写死）
const hospitals = ref([
  { id: 1, name: '总院' },
  { id: 2, name: '第一医院' },
  { id: 3, name: '第二医院' },
  { id: 4, name: '研究中心' }
])

const loading = ref(false)
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 5
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加管理员')
const isEdit = ref(false)
const formRef = ref(null)

const formData = reactive({
  id: null,
  username: '',
  realName: '',
  phone: '',
  email: '',
  roleId: null,
  hospitalId: null,
  password: '',
  confirmPassword: '',
  status: 1
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const getRoleType = (roleId) => {
  const types = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'info' }
  return types[roleId] || ''
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.roleId = null
  searchForm.status = null
  handleSearch()
}

const handleSizeChange = () => {
  handleSearch()
}

const handleCurrentChange = () => {
  handleSearch()
}

const showAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加管理员'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑管理员'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除管理员 "${row.username}" 吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleResetPassword = (row) => {
  ElMessageBox.confirm(`确定要重置管理员 "${row.username}" 的密码吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为 123456')
  }).catch(() => {})
}

const handleStatusChange = (row) => {
  ElMessage.success(`已将 "${row.username}" 状态设置为 ${row.status === 1 ? '启用' : '禁用'}`)
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
    }
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    username: '',
    realName: '',
    phone: '',
    email: '',
    roleId: null,
    hospitalId: null,
    password: '',
    confirmPassword: '',
    status: 1
  })
}

onMounted(() => {
  sessionStorage.setItem('activePath', '/home/admin')
})
</script>

<style scoped>
.admin-management {
  padding: 20px;
  background: #fff;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  font-size: 14px;
  background: transparent !important;
  border-radius: 12px;
}

:deep(.el-table th) {
  background: #f5f7fa !important;
  font-weight: 600;
  color: #303133 !important;
}

:deep(.el-table__body td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-table__body tr:hover > td) {
  background: rgba(6, 182, 212, 0.1) !important;
}

:deep(.el-table::before) {
  display: none;
}

:deep(.el-input__wrapper) {
  background: #fff !important;
  border: 1px solid #dcdfe6 !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #303133 !important;
}

:deep(.el-button--primary) {
  background: #409eff;
  border: none;
}

:deep(.el-dialog) {
  background: #fff;
  border-radius: 8px;
}

:deep(.el-dialog__title) {
  color: #303133;
}

:deep(.el-form-item__label) {
  color: #606266 !important;
}

:deep(.el-switch) {
  --el-switch-on-color: #67c23a;
}
</style>
