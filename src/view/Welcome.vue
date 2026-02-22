<template>
  <div class="dashboard">
    <!-- 头部 -->
    <div class="header">
      <div class="header-content">
        <div class="header-text">
          <h2>实时概况</h2>
          <p>更新时间：{{ updateTime }}</p>
        </div>
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" fill="currentColor"/>
            <path d="M19 12C19 14.7614 16.7614 17 14 17H10C7.23858 17 5 14.7614 5 12V12C5 9.23858 7.23858 7 10 7H14C16.7614 7 19 9.23858 19 12Z" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats">
      <el-col :span="12" v-for="(item, index) in statsData.slice(0, 2)" :key="item.label">
        <el-card class="stat-card" :class="'card-' + index" @click="handleCardClick(index)">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><component :is="getIcon(index)" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-header">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-footer">
                较上期
                <span class="stat-change" :class="{'up': item.change > 0, 'down': item.change < 0}">
                  {{ item.change > 0 ? '↑' : '↓' }}{{ Math.abs(item.change) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats">
      <el-col :span="12" v-for="(item, index) in statsData.slice(2, 4)" :key="item.label">
        <el-card class="stat-card" :class="'card-' + (index + 2)" @click="handleCardClick(index + 2)">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><component :is="getIcon(index + 2)" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-header">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-footer">
                较上期
                <span class="stat-change" :class="{'up': item.change > 0, 'down': item.change < 0}">
                  {{ item.change > 0 ? '↑' : '↓' }}{{ Math.abs(item.change) }}%
                </span>
              </div>
            </div>
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
import { User, UserFilled, Document, TrendCharts } from '@element-plus/icons-vue';

const updateTime = ref('中...');

const statsData = ref([]);

const getIcon = (index) => {
  const icons = [User, UserFilled, Document, TrendCharts];
  return icons[index % icons.length];
};

const handleCardClick = (index) => {
  let targetRoute = '';
  switch (index) {
    case 0:
      targetRoute = '/home/user';
      break;
    case 1:
      targetRoute = '/home/user';
      break;
    case 2:
      targetRoute = '/home/test';
      break;
    case 3:
      targetRoute = '/home/test';
      break;
    default:
      break;
  }
  sessionStorage.setItem('activePath', targetRoute);
  router.push(targetRoute); 
};

// 初始化默认数据
statsData.value = [
  { label: '新注册人数', value: '--', change: 0 },
  { label: '总人数', value: '--', change: 0 },
  { label: '今日测试数', value: '--', change: 0 },
  { label: '总测试数', value: '--', change: 0 },
];

// 调用接口获取数据
const fetchData = async () => {
  try {
    const response = await getdata();
    const data = response || {};
    
    statsData.value = [
      { label: '新注册人数', value: data.newUserNum ?? 0, change: data.userImprove ?? 0 },
      { label: '总人数', value: data.userNum ?? 0, change: data.userNumImprove ?? 0 },
      { label: '今日测试数', value: data.newTestTimes ?? 0, change: data.newTimesImprove ?? 0 },
      { label: '总测试数', value: data.allTestTimes ?? 0, change: data.allTimesImprove ?? 0 },
    ];
    
    if (data.time) {
      const date = new Date(data.time);
      updateTime.value = date.toLocaleDateString('zh-CN');
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    statsData.value = [
      { label: '新注册人数', value: 0, change: 0 },
      { label: '总人数', value: 0, change: 0 },
      { label: '今日测试数', value: 0, change: 0 },
      { label: '总测试数', value: 0, change: 0 },
    ];
  }
};

onMounted(() => {
  sessionStorage.setItem('activePath', '/home/index');
  fetchData();
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  min-height: 100%;
}

/* 头部 */
.header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 24px 32px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h2 {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.header-text p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.header-icon {
  width: 60px;
  height: 60px;
  color: rgba(6, 182, 212, 0.5);
}

.header-icon svg {
  width: 100%;
  height: 100%;
}

/* 统计卡片 */
.stats {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

/* 卡片颜色 */
.card-0 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-1 {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

.card-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 28px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-header {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.stat-footer {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.stat-change {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}

.stat-change.up {
  color: #52c41a;
}

.stat-change.down {
  color: #f5222d;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-icon {
    display: none;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-value {
    font-size: 28px;
  }
}
</style>
