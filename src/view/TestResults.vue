<template>
  <div class="test-management">
    <h1 class="title">用户测试管理</h1>

    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入病历号或姓名查询"
        clearable
        @keyup.enter="handleSearch"
        style="width: 300px; margin-right: 10px;"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <!-- 左右布局 -->
    <div class="layout">
      <!-- 左侧：用户测试信息表格 -->
      <div :class="['left-panel',{expanded:isExpanded}]">
        <el-table :data="testList" border style="width: 100%" stripe @row-click="handleRowClick">
          <el-table-column prop="testId" label="测试号" align="center" />
          <el-table-column prop="medicalId" label="病历号" align="center" />
          <el-table-column prop="name" label="姓名" align="center" />
          <el-table-column prop="score" label="得分" align="center" />
          <el-table-column prop="starTime" label="测试开始时间" align="center" />
          <el-table-column prop="endTime" label="测试结束时间" align="center" />
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="prev, pager, next, jumper, total"
          @current-change="fetchTestList"
          class="pagination"
        />
      </div>

      <!-- 右侧：测试详细信息 -->
      <div :class="['right-panel', { expanded: isExpanded }]">
        <h2 class="detail-title" @click="togglePanel">测试详细信息   {{ selectedTestId }}</h2>
        <el-table :data="testDetailList" border style="width: 100%" stripe v-if="testDetailList.length > 0">
          <el-table-column prop="index" label="题目序号" align="center"/>
          <el-table-column prop="audioContent" label="音频内容" align="center" :formatter="audioContentFormatter" />
          <el-table-column prop="userContent" label="用户回答" align="center" :formatter="userContentFormatter" />
          <el-table-column prop="score" label="得分" align="center" />
          <el-table-column prop="time" label="时间" align="center" />
          <el-table-column label="播放测试音频" align="center">
            <template #default="scope">
              <el-button type="text" @click="playAudio(scope.row.audioPath)">播放</el-button>
            </template>
          </el-table-column>
          <el-table-column label="播放用户音频" align="center">
            <template #default="scope">
              <el-button type="text" @click="playAudio(scope.row.userAudioPath)">播放</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="no-data">请点击左侧表格查看详细信息</div>

        <!-- 放大/收回图标 -->
        <div class="expand-icon" @click="togglePanel">
          <el-icon :is="isExpanded ? ArrowLeft : ArrowRight" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getUserTestList, getUserTestDetail, searchUserTest } from '@/api/userTest';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'; // 引入图标
import { useRoute } from "vue-router";
const route = useRoute();
const selectedTestId = ref(null); // 用于存储当前选中的 testId
const testList = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});
const medicalId = ref('');
const testDetailList = ref([]);
const searchKeyword = ref(''); // 搜索框绑定的关键字
const isExpanded = ref(false); // 控制右侧面板展开/收回的状态

// 获取用户测试列表
const fetchTestList = async () => {
  try {
    let data;
    if (searchKeyword.value) {
      // 如果有搜索关键字，调用搜索接口
      data = await searchUserTest(searchKeyword.value, pagination.currentPage, pagination.pageSize);
    } else {
      // 否则调用普通列表接口
      data = await getUserTestList(pagination.currentPage, pagination.pageSize);
    }
    console.log(data);
    testList.value = data.records.map((test) => ({
      ...test,
      endTime: test.endTime ? new Date(test.endTime).toLocaleString() : '用户未完成', // 格式化时间
      starTime: new Date(test.starTime).toLocaleString()
    }));
    pagination.total = data.total;
  } catch (error) {
    console.error('获取用户测试列表失败：', error);
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1; // 重置为第一页
  fetchTestList(); // 重新获取数据
};

// 点击表格行，获取测试详细信息
const handleRowClick = async (row) => {
  selectedTestId.value = row.testId; // 更新选中的 testId
  try {
    const data = await getUserTestDetail(row.testId);
    console.log('API 返回的数据：', data);

    testDetailList.value = data.map((detail) => ({
      ...detail,
      time: detail.time ? new Date(detail.time).toLocaleString() : '无',
    }));
  } catch (error) {
    console.error('获取测试详细信息失败：', error);
  }
};

// 音频内容格式化函数
const audioContentFormatter = (row, column, cellValue) => {
  if (!cellValue) return '';  // 如果音频内容为空，返回空，不显示
  return `${cellValue}`;
};

// 用户回答格式化函数
const userContentFormatter = (row, column, cellValue) => {
  if (!cellValue) return '';  // 如果用户回答为空，返回空，不显示
  return `${cellValue}`;
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

// 初始化
onMounted(() => {
  sessionStorage.setItem('activePath', '/home/test');
  medicalId.value = route.query.medicalId || '';
  if (medicalId.value) {
    searchKeyword.value = medicalId.value;
    fetchTestList(); // 根据 medicalId 搜索测试数据
  }
  else
    fetchTestList();
});

// 切换右侧面板展开/收回
const togglePanel = () => {
  isExpanded.value = !isExpanded.value;
  console.log("点击了："+isExpanded.value);
};
</script>

<style scoped>
.test-management {
  padding: 20px;
  background-color: #f5f7fa;
  width: 100%;
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
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.layout {
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
}

.left-panel {
  flex: 1.5;
}

.right-panel {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
}
.left-panel.expanded {
  flex: 1;
}

.right-panel.expanded {
  flex: 5 !important;
  /* 展开时右侧面板占更大空间 */
}

.detail-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
}

.no-data {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.el-table {
  margin-top: 20px;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.el-table__header th {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #303133;
}

.expand-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 24px;
  color: #409eff;
}

.expand-icon:hover {
  color: #66b1ff;
}
</style>
