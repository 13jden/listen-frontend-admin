<template>
  <div class="role-management">
    <div class="page-header">
      <h1 class="title">角色权限管理</h1>
      <div class="header-actions">
        <el-button type="primary" icon="Plus" @click="showAddDialog">添加角色</el-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-row :gutter="20">
      <el-col :span="8" v-for="role in roleList" :key="role.id">
        <el-card class="role-card" shadow="hover">
          <div class="role-header">
            <div class="role-icon" :style="{ backgroundColor: role.color }">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="role-info">
              <h3>{{ role.name }}</h3>
              <p>{{ role.description }}</p>
            </div>
          </div>
          
          <div class="role-stats">
            <div class="stat-item">
              <span class="stat-value">{{ role.userCount }}</span>
              <span class="stat-label">用户数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ role.menuCount }}</span>
              <span class="stat-label">菜单权限</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ role.btnCount }}</span>
              <span class="stat-label">按钮权限</span>
            </div>
          </div>

          <div class="role-actions">
            <el-button type="primary" size="small" @click="handleEditRole(role)">编辑</el-button>
            <el-button type="success" size="small" @click="handlePermission(role)">权限配置</el-button>
            <el-button type="danger" size="small" plain @click="handleDeleteRole(role)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 权限配置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限配置" width="700px" destroy-on-close>
      <div class="permission-dialog">
        <div class="dialog-header">
          <span class="role-name">角色：{{ currentRole?.name }}</span>
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
            全选
          </el-checkbox>
        </div>
        
        <el-tree
          ref="treeRef"
          :data="permissionTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          @check="handleTreeCheck"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span class="permission-name">{{ data.label }}</span>
              <span class="permission-type" :class="data.type">{{ data.type === 'menu' ? '菜单' : '按钮' }}</span>
            </span>
          </template>
        </el-tree>
      </div>
      
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermissions">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog v-model="roleDialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="角色颜色" prop="color">
          <el-color-picker v-model="roleForm.color" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoleForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'

// 角色列表数据（写死）
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限，可管理所有功能',
    color: '#f56c6c',
    userCount: 3,
    menuCount: 12,
    btnCount: 45,
    status: 1
  },
  {
    id: 2,
    name: '普通管理员',
    description: '负责日常管理操作，不包含系统配置',
    color: '#e6a23c',
    userCount: 8,
    menuCount: 8,
    btnCount: 30,
    status: 1
  },
  {
    id: 3,
    name: '医护人员',
    description: '可查看和管理患者信息及测试记录',
    color: '#67c23a',
    userCount: 25,
    menuCount: 5,
    btnCount: 20,
    status: 1
  },
  {
    id: 4,
    name: '研究人员',
    description: '可查看统计数据和导出报告',
    color: '#409eff',
    userCount: 12,
    menuCount: 4,
    btnCount: 15,
    status: 1
  }
])

// 权限树数据（写死）
const permissionTree = ref([
  {
    id: 1,
    label: '系统管理',
    type: 'menu',
    children: [
      { id: 11, label: '管理员管理', type: 'menu' },
      { id: 12, label: '角色权限', type: 'menu' },
      { id: 13, label: '系统日志', type: 'menu' }
    ]
  },
  {
    id: 2,
    label: '用户管理',
    type: 'menu',
    children: [
      { id: 21, label: '用户列表', type: 'menu' },
      { id: 22, label: '用户测试记录', type: 'menu' }
    ]
  },
  {
    id: 3,
    label: '测试音频',
    type: 'menu',
    children: [
      { id: 31, label: '音频管理', type: 'menu' },
      { id: 32, label: '批次管理', type: 'menu' }
    ]
  },
  {
    id: 4,
    label: '数据统计',
    type: 'menu',
    children: [
      { id: 41, label: '统计概览', type: 'menu' },
      { id: 42, label: 'AI分析', type: 'menu' }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

// 对话框状态
const permissionDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const currentRole = ref(null)
const checkAll = ref(false)
const isIndeterminate = ref(false)
const checkedPermissions = ref([11, 12, 21, 31])
const treeRef = ref(null)

const roleForm = reactive({
  name: '',
  description: '',
  color: '#409eff',
  status: 1
})

const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
}

const dialogTitle = ref('添加角色')

// 方法
const showAddDialog = () => {
  dialogTitle.value = '添加角色'
  roleForm.name = ''
  roleForm.description = ''
  roleForm.color = '#409eff'
  roleForm.status = 1
  roleDialogVisible.value = true
}

const handleEditRole = (role) => {
  dialogTitle.value = '编辑角色'
  roleForm.name = role.name
  roleForm.description = role.description
  roleForm.color = role.color
  roleForm.status = role.status
  roleDialogVisible.value = true
}

const handleDeleteRole = (role) => {
  ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handlePermission = (role) => {
  currentRole.value = role
  permissionDialogVisible.value = true
}

const handleCheckAllChange = (val) => {
  if (val) {
    const allIds = []
    const getAllIds = (nodes) => {
      nodes.forEach(node => {
        allIds.push(node.id)
        if (node.children) getAllIds(node.children)
      })
    }
    getAllIds(permissionTree.value)
    treeRef.value?.setCheckedKeys(allIds)
  } else {
    treeRef.value?.setCheckedKeys([])
  }
}

const handleTreeCheck = () => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
  const allChecked = [...checkedKeys, ...halfCheckedKeys]
  
  const getAllNodes = (nodes) => {
    let count = 0
    nodes.forEach(node => {
      count++
      if (node.children) count += getAllNodes(node.children)
    })
    return count
  }
  
  const total = getAllNodes(permissionTree.value)
  checkAll.value = allChecked.length === total
  isIndeterminate.value = allChecked.length > 0 && allChecked.length < total
}

const savePermissions = () => {
  ElMessage.success('权限保存成功')
  permissionDialogVisible.value = false
}

const submitRoleForm = async () => {
  ElMessage.success(dialogTitle.value === '添加角色' ? '添加成功' : '修改成功')
  roleDialogVisible.value = false
}

onMounted(() => {
  sessionStorage.setItem('activePath', '/home/role')
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.role-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.role-card:hover {
  transform: translateY(-5px);
}

.role-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.role-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.role-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #303133;
}

.role-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.role-stats {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.role-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.permission-dialog {
  max-height: 500px;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.permission-name {
  flex: 1;
}

.permission-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.permission-type.menu {
  background-color: #ecf5ff;
  color: #409eff;
}

.permission-type.btn {
  background-color: #f0f9eb;
  color: #67c23a;
}
</style>
