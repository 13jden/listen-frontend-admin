<template>
  <div class="hospital-management">
    <h1 class="title">医院管理</h1>
    <el-button type="primary" icon="el-icon-plus" @click="showAddHospitalDialog">添加医院</el-button>
    <el-table :data="hospitalList" border style="width: 100%" stripe>
      <el-table-column prop="id" label="医院ID" align="center" />
      <el-table-column prop="name" label="医院名称" align="center" />
      <el-table-column label="操作" width="200" align="center" class-name="action-column">
        <template #default="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="editHospital(scope.row)">修改</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="confirmDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      layout="prev, pager, next, jumper, total"
      @current-change="fetchHospitalList"
      class="pagination"
    />
    <!-- 添加医院的弹窗 -->
    <el-dialog title="添加医院" v-model="addHospitalDialogVisible">
      <el-input v-model="newHospitalName" placeholder="请输入医院名称" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddHospital">取消</el-button>
        <el-button type="primary" @click="handleAddHospital">添加</el-button>
      </span>
    </el-dialog>

    <!-- 修改医院名称的弹窗 -->
    <el-dialog title="修改医院" v-model="editHospitalDialogVisible">
      <el-input v-model="editedHospitalName" placeholder="请输入新的医院名称" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditHospital">取消</el-button>
        <el-button type="primary" @click="handleEditHospital">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getHospital, addHospital, updateHospital, deleteHospital } from '@/api/hospital';

const hospitalList = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const addHospitalDialogVisible = ref(false);
const editHospitalDialogVisible = ref(false);
const newHospitalName = ref('');
const editedHospitalName = ref('');
const editingHospitalId = ref(null);

const fetchHospitalList = async () => {
  try {
    const response = await getHospital();
    hospitalList.value = response;
  } catch (error) {
    ElMessage.error('获取医院列表失败');
  }
};

// 打开添加医院对话框
const showAddHospitalDialog = () => {
  addHospitalDialogVisible.value = true;
  newHospitalName.value = '';
};

// 添加医院
const handleAddHospital = async () => {
  if (!newHospitalName.value) {
    ElMessage.error('请输入医院名称');
    return;
  }

  try {
    await addHospital(newHospitalName.value);
    ElMessage.success('医院添加成功');
    addHospitalDialogVisible.value = false;
    fetchHospitalList();
  } catch (error) {
    ElMessage.error('添加医院失败');
  }
};

// 取消添加医院
const cancelAddHospital = () => {
  addHospitalDialogVisible.value = false;
  newHospitalName.value = '';
};

// 打开编辑医院对话框
const editHospital = (hospital) => {
  editingHospitalId.value = hospital.id;
  editedHospitalName.value = hospital.name;
  editHospitalDialogVisible.value = true;
};

// 保存修改医院名称
const handleEditHospital = async () => {
  if (!editedHospitalName.value) {
    ElMessage.error('请输入新的医院名称');
    return;
  }

  const hospital = {
    id: editingHospitalId.value,    // 传递医院ID
    name: editedHospitalName.value  // 传递修改后的医院名称
  };

  try {
    await updateHospital(hospital);  // 传递整个 hospital 对象
    ElMessage.success('医院名称修改成功');
    editHospitalDialogVisible.value = false;
    fetchHospitalList();
  } catch (error) {
    ElMessage.error('修改医院名称失败');
  }
};


// 取消修改医院
const cancelEditHospital = () => {
  editHospitalDialogVisible.value = false;
  editedHospitalName.value = '';
};

// 删除医院
const confirmDelete = (hospital) => {
  ElMessageBox.confirm('确定删除该医院吗?', '删除确认', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteHospital(hospital.id);
        ElMessage.success('删除成功');
        fetchHospitalList();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 初始化医院列表
onMounted(() => {
  fetchHospitalList();
});

</script>

<style scoped>
.hospital-management {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
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

.el-table__header th {
  background: #f5f7fa !important;
  color: #303133 !important;
}

.el-table__body td {
  background: #fff !important;
  color: #303133;
  border-bottom: 1px solid #ebeef5 !important;
}

.el-dialog {
  border-radius: 8px;
  background: #fff;
}

.el-dialog__header {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 15px 20px;
}

.el-dialog__title {
  color: #303133;
}

.el-dialog__body {
  padding: 20px;
  color: #606266;
}

.el-dialog__footer {
  border-top: 1px solid #e4e7ed;
  padding: 15px 20px;
  text-align: right;
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

:deep(.el-form-item__label) {
  color: #606266 !important;
}
</style>
