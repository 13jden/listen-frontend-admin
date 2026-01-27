<template>
  <div class="dashboard">
    <!-- 头部 -->
    <div class="header">
      <h2>实时概况</h2>
      <p>更新时间：{{ updateTime }}</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats">
      <!-- 第一行 -->
      <el-col :span="12" v-for="(item, index) in statsData.slice(0, 2)" :key="item.label">
        <el-card class="stat-card" :style="getCardStyle(index)" @click="handleCardClick(index)">
          <div class="stat-header">
            <span>{{ item.label }}</span>
          </div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-footer">
            较上期
            <span class="stat-change" :class="{'up': item.change > 0, 'down': item.change < 0}">
              {{ item.change > 0 ? '▲' : '▼' }}{{ Math.abs(item.change) }}%
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats">
      <!-- 第二行 -->
      <el-col :span="12" v-for="(item, index) in statsData.slice(2, 4)" :key="item.label">
        <el-card class="stat-card" :style="getCardStyle(index + 2)" @click="handleCardClick(index + 2)">
          <div class="stat-header">
            <span>{{ item.label }}</span>
          </div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-footer">
            较上期
            <span class="stat-change" :class="{'up': item.change > 0, 'down': item.change < 0}">
              {{ item.change > 0 ? '▲' : '▼' }}{{ Math.abs(item.change) }}%
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '../router/index';
import { getdata } from '../api/admin';
import { da } from 'element-plus/es/locales.mjs';

// 更新时间
const updateTime = ref('2025/02/19');

const statsData = ref([]);
// 获取卡片背景样式
const getCardStyle = (index) => {
  const gradients = [
    'linear-gradient(135deg, #5a7df7, #76cefa)',
    'linear-gradient(135deg, #abf2a5, #abf2a5)',
    'linear-gradient(135deg, #ffc1a6, #ffb3ba)',
    'linear-gradient(135deg, #9796f0, #9796f0)',
  ];
  return {
    background: gradients[index % gradients.length],
    color: '#fff',
  };
};


const handleCardClick = (index) => {
  let targetRoute = '';
  switch (index) {
    case 0:
      targetRoute = '/home/user'; // 新注册人数页面
      break;
    case 1:
      targetRoute = '/home/user'; // 今日测试数页面
      break;
    case 2:
      targetRoute = '/home/test'; // 总测试数页面
      break;
    case 3:
      targetRoute = '/home/test'; // 新增反馈页面
      break;
    default:
      break;
  }
  sessionStorage.setItem('activePath',targetRoute);
  router.push(targetRoute); 
};


// 调用接口获取数据
const fetchData = async () => {
  try {
    const response = await getdata();
    const data = response; // 假设接口返回的数据格式为 { newUserNum, userImprove, userNum, userNumImprove, newTestTimes, newTimesImprove, allTestTimes, allTimesImprove }

    // 更新 statsData
    statsData.value = [
      { label: '新注册人数', value: data.newUserNum, change: data.userImprove },
      { label: '总人数',value: data.userNum, change: data.userNumImprove  },
      { label: '今日测试数',value: data.newTestTimes, change: data.newTimesImprove  },
      { label: '总测试数', value: data.allTestTimes, change: data.allTimesImprove }, // 根据实际需求调整
    ];
    const date = new Date(data.time);
    updateTime.value = date.toLocaleDateString('zh-CN'); 
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 在组件挂载时调用接口
onMounted(() => {
  sessionStorage.setItem('activePath', '/home/index');
  fetchData();
});
</script>

<style scoped>
/* 页面容器 */
.dashboard {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 头部 */
.header {
  margin-bottom: 24px;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  text-align: center;
}

.header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #193273;
  margin-bottom: 8px;
}

.header p {
  font-size: 14px;
  color: #666;
}

/* 统计卡片 */
.stats {
  margin-bottom: 24px;
  width: 100%;
  max-width: 1200px;
}

.stat-card {
  padding: 40px; /* 放大内边距 */
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: #fff;
  height: 200px; /* 固定高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.stat-header {
  font-size: 20px; /* 放大字体 */
  margin-bottom: 16px;
}

.stat-value {
  font-size: 48px; /* 放大字体 */
  font-weight: bold;
  margin: 16px 0;
}

.stat-footer {
  font-size: 16px; /* 放大字体 */
}

.stat-change {
  margin-left: 5px;
}

.stat-change.up {
  color: #52c41a;
}

.stat-change.down {
  color: #f5222d;
}
</style>
