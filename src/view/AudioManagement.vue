<template>
  <div class="audio-management">
    <h1 class="title">音频管理</h1>
    <div class="box1">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入音频内容搜索"
          clearable
          @keyup.enter="handleSearch"
          style="width: 300px; margin-right: 10px;"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
      <el-button type="primary" class="upload-button" icon="el-icon-upload" @click="showUploadDialog" >上传音频</el-button>
    
    </div>
      <!-- 上传音频对话框 -->
      <el-dialog title="上传音频" v-model="uploadDialogVisible">
            <el-upload
            class="upload-demo"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :file-list="fileList"
            :limit="1"
            :auto-upload="true"
            :http-request="handleUpload"
            ref="upload"
            >
              <el-button type="primary" icon="el-icon-upload">选择文件</el-button>
              <div v-if="fileList.length === 0" class="el-upload__tip" style="margin-top: 10px;">
                请上传音频文件
              </div>
              <div v-if="fileList.length > 0" style="margin-top: 10px;">
                已选择文件：{{ fileList[0].name }}
              </div>
            </el-upload>
          
        <el-input v-model="audioContent" placeholder="请输入音频描述" style="margin-top: 20px;" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelUpload">取消</el-button>
          <el-button type="primary" @click="handleAddAudio">上传</el-button>
        </span>
      </el-dialog>
    
    <el-table :data="audioList" border style="width: 100%" stripe>
      <el-table-column prop="id" label="音频id" align="center" />
      <el-table-column prop="content" label="音频内容" align="center" />
      <el-table-column prop="adminName" label="上传人" align="center" />
      <el-table-column prop="uploadTime" label="上传时间" align="center" />
      <el-table-column prop="testTimes" label="测试次数" align="center" />
      <el-table-column prop="score" label="测试平均分" align="center" />
      <el-table-column label="播放测试音频" align="center">
            <template #default="scope">
              <el-button type="text" @click="playAudio(scope.row.path)">播放</el-button>
            </template>
          </el-table-column>
      <el-table-column label="操作" width="200" align="center" class-name="action-column">
        <template #default="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="editAudio(scope.row)">修改</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="confirmDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      layout="prev, pager, next, jumper, total"
      @current-change="fetchAudioList"
      class="pagination"
    />

    <!-- 编辑音频对话框 -->
    <el-dialog title="编辑音频" v-model="editDialogVisible">
      <el-input v-model="audioContent" placeholder="请输入音频描述" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateAudio">保存修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAudioList, uploadAudio,searchAudioList,addAudio, deleteAudio, deleteTempFile, updateAudio } from '@/api/audio';

const searchKeyword = ref(''); // 搜索框绑定的关键字
const audioList = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});
const uploadDialogVisible = ref(false);
const editDialogVisible = ref(false);
const fileList = ref([]);
const audioContent = ref('');
let uploadedFileName = ref('');
const id = ref('');
const fetchAudioList = async () => {
  try {
    let data;
    if (searchKeyword.value) {
      // 如果有搜索关键字，调用搜索接口
      data = await searchAudioList(searchKeyword.value, pagination.currentPage, pagination.pageSize);
    } else {
      // 否则调用普通列表接口
      data = await getAudioList(pagination.currentPage, pagination.pageSize);
    }
    audioList.value = data.records.map((audio) => ({
      ...audio,
      uploadTime: new Date(audio.time).toLocaleString(),
    }));
    pagination.total = data.total;
  } catch (error) {
    ElMessage.error('获取音频列表失败');
  }
};

const showUploadDialog = () => {
  uploadDialogVisible.value = true;
  fileList.value = [];
  audioContent.value = '';
  uploadedFileName.value = '';
};

const handleBeforeUpload = (file) => {
  const isAudio = file.type.startsWith('audio/');
  if (!isAudio) {
    ElMessage.error('请选择音频文件');
  }
  return isAudio;
};

const handleUpload = async (file) => {
  try {
    const response = await uploadAudio(file.file);
    uploadedFileName.value = response;
    console.log(response);
    handleUploadSuccess(response);
  } catch (error) {
    handleUploadError(error);
  }
};

// 播放音频
const playAudio = (audioPath) => {
  if (!audioPath) {
    console.error('音频路径为空');
    return;
  }
  const audio = new Audio(audioPath);
  audio.play().catch((error) => {
    console.error('播放音频失败：', error);
  });
};

// 取消上传
const cancelUpload = async () => {
  if (uploadedFileName.value) {
    try {
      await deleteTempFile(uploadedFileName.value);
    } catch (error) {
      ElMessage.error('删除临时文件失败');
    }
  }
  uploadDialogVisible.value = false;
  fileList.value = [];
  audioContent.value = '';
  uploadedFileName.value = '';
};

const handleUploadSuccess = (response) => {
  if (response!=null) {
    ElMessage.success('文件上传成功');
  } 
};

const handleUploadError = () => {
};


const handleAddAudio = async () => {
  if (!uploadedFileName.value) {
    ElMessage.error('请先上传文件');
    return;
  }
  if (!audioContent.value) {
    ElMessage.error('请填写音频描述');
    return;
  }
  const admin =  JSON.parse(sessionStorage.getItem('admin'));
  console.log(admin.adminId);
  try {
    
    // 添加音频信息
    const response = await addAudio(audioContent.value,admin.adminId,uploadedFileName.value); // 调用添加接口
    console.log(response);
    if(response!=null){
      ElMessage.success('音频上传成功');
      uploadDialogVisible.value = false;
      fetchAudioList(); // 刷新列表
    }
  } catch (error) {
    console.log("错误");
    ElMessage.error('音频上传失败');
  }

};

const handleUpdateAudio = async () => {
  if (!audioContent.value) {
    ElMessage.error('请填写音频描述');
    return;
  }

  try {
    await updateAudio({
      content: audioContent.value,
      id: id.value,
    });
    ElMessage.success('音频修改成功');
    editDialogVisible.value = false;
    fetchAudioList();
  } catch (error) {
    ElMessage.error('修改音频失败');
  }
};

const editAudio = (audio) => {
  audioContent.value = audio.content;
  uploadedFileName.value = audio.fileName;
  id.value = audio.id;
  editDialogVisible.value = true;
};

const confirmDelete = (audio) => {
  ElMessageBox.confirm('确定删除该音频吗?', '删除确认', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteAudio(audio.id);
        ElMessage.success('删除成功');
        fetchAudioList();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1; // 重置为第一页
  fetchAudioList(); // 重新获取数据
};

onMounted(() => {
  sessionStorage.setItem('activePath', '/home/audio');
  fetchAudioList();
});

</script>



<style scoped>
.box1{
  display: flex;
  width: 100%;
}
.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 300px;
  width: 60%;
}

.search-box .el-input {
  flex-grow: 1; /* 让搜索框占据可用空间 */
  margin-right: 10px;
}

.upload-button {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 100px;
  margin-top: 30px;
}

.upload-demo{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
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

.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 15px 20px;
}

.el-dialog__body {
  padding: 20px;
}

.el-dialog__footer {
  border-top: 1px solid #e4e7ed;
  padding: 15px 20px;
  text-align: right;
}

</style>