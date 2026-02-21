<template>
  <div class="statistics-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="stat in statCards" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="28"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                <el-icon><component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="医院">
          <el-select v-model="filterForm.hospital" placeholder="请选择医院" clearable style="width: 180px">
            <el-option label="全部医院" value="" />
            <el-option label="第一医院" value="1" />
            <el-option label="第二医院" value="2" />
            <el-option label="第三医院" value="3" />
            <el-option label="研究中心" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄段">
          <el-select v-model="filterForm.ageGroup" placeholder="请选择年龄段" clearable style="width: 150px">
            <el-option label="全部年龄段" value="" />
            <el-option label="儿童(0-12岁)" value="child" />
            <el-option label="青少年(13-18岁)" value="teenager" />
            <el-option label="青年(19-40岁)" value="young" />
            <el-option label="中年(41-65岁)" value="middle" />
            <el-option label="老年(65岁以上)" value="elderly" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Download" @click="handleExport">导出报告</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 年龄段听力表现分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">年龄段听力表现分布</span>
              <el-radio-group v-model="ageChartType" size="small">
                <el-radio-button value="bar">柱状图</el-radio-button>
                <el-radio-button value="line">折线图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="ageChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 测试完成情况 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">测试完成情况</span>
            </div>
          </template>
          <div ref="completionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <!-- 月度测试趋势 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">月度测试趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 常见听辨偏差 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">常见听辨偏差类型 TOP10</span>
            </div>
          </template>
          <div ref="errorChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <!-- 医院测试量对比 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">各医院测试量对比</span>
            </div>
          </template>
          <div ref="hospitalChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 得分分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">测试得分分布</span>
            </div>
          </template>
          <div ref="scoreDistChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="chart-header">
          <span class="chart-title">详细数据报表</span>
        </div>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="date" label="日期" align="center" />
        <el-table-column prop="testCount" label="测试人数" align="center" />
        <el-table-column prop="testTimes" label="测试次数" align="center" />
        <el-table-column prop="avgScore" label="平均分" align="center" />
        <el-table-column prop="completionRate" label="完成率" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate" :color="getProgressColor(row.completionRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="及格率" align="center">
          <template #default="{ row }">
            <el-tag :type="row.passRate >= 60 ? 'success' : 'danger'">{{ row.passRate }}%</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 顶部统计卡片数据
const statCards = ref([
  { title: '总测试人数', value: '3,856', trend: 12.5, color: '#409eff', icon: 'User' },
  { title: '总测试次数', value: '12,458', trend: 8.3, color: '#67c23a', icon: 'List' },
  { title: '平均得分', value: '78.6', trend: 3.2, color: '#e6a23c', icon: 'TrendCharts' },
  { title: '完成率', value: '92.3%', trend: 1.8, color: '#f56c6c', icon: 'CircleCheck' }
])

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  hospital: '',
  ageGroup: ''
})

// 图表类型切换
const ageChartType = ref('bar')

// 图表DOM引用
const ageChartRef = ref(null)
const completionChartRef = ref(null)
const trendChartRef = ref(null)
const errorChartRef = ref(null)
const hospitalChartRef = ref(null)
const scoreDistChartRef = ref(null)

// 图表实例
let ageChart = null
let completionChart = null
let trendChart = null
let errorChart = null
let hospitalChart = null
let scoreDistChart = null

// 表格数据
const tableData = ref([
  { date: '2024-01', testCount: 320, testTimes: 856, avgScore: 76.5, completionRate: 89, passRate: 72 },
  { date: '2024-02', testCount: 298, testTimes: 780, avgScore: 78.2, completionRate: 91, passRate: 75 },
  { date: '2024-03', testCount: 356, testTimes: 920, avgScore: 77.8, completionRate: 88, passRate: 73 },
  { date: '2024-04', testCount: 389, testTimes: 1025, avgScore: 79.5, completionRate: 93, passRate: 78 },
  { date: '2024-05', testCount: 412, testTimes: 1156, avgScore: 80.1, completionRate: 94, passRate: 80 },
  { date: '2024-06', testCount: 378, testTimes: 986, avgScore: 81.2, completionRate: 92, passRate: 82 }
])

// 进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#409eff'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 初始化图表
const initCharts = () => {
  // 年龄段听力表现分布
  ageChart = echarts.init(ageChartRef.value)
  const ageOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['平均得分', '最高得分', '最低得分'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['儿童', '青少年', '青年', '中年', '老年'] },
    yAxis: { type: 'value', max: 100 },
    series: [
      { name: '平均得分', type: 'bar', data: [85, 82, 79, 75, 68], itemStyle: { color: '#409eff' } },
      { name: '最高得分', type: 'bar', data: [98, 96, 95, 92, 88], itemStyle: { color: '#67c23a' } },
      { name: '最低得分', type: 'bar', data: [62, 58, 55, 48, 42], itemStyle: { color: '#f56c6c' } }
    ]
  }
  ageChart.setOption(ageOption)

  // 测试完成情况
  completionChart = echarts.init(completionChartRef.value)
  const completionOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      name: '完成情况',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}' },
      data: [
        { value: 11498, name: '已完成', itemStyle: { color: '#67c23a' } },
        { value: 658, name: '进行中', itemStyle: { color: '#e6a23c' } },
        { value: 302, name: '未完成', itemStyle: { color: '#f56c6c' } }
      ]
    }]
  }
  completionChart.setOption(completionOption)

  // 月度测试趋势
  trendChart = echarts.init(trendChartRef.value)
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['测试人数', '测试次数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [
      { name: '测试人数', type: 'line', data: [320, 298, 356, 389, 412, 378], smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#409eff' } },
      { name: '测试次数', type: 'line', data: [856, 780, 920, 1025, 1156, 986], smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#67c23a' } }
    ]
  }
  trendChart.setOption(trendOption)

  // 常见听辨偏差
  errorChart = echarts.init(errorChartRef.value)
  const errorOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: ['前后鼻音混淆', '平翘舌不分', '轻声过重', '儿化音错误', '声调错误', '元音弱化', '辅音遗漏', '送气音问题', '清浊音混淆', '音节丢失'].reverse() },
    series: [{
      type: 'bar',
      data: [856, 742, 698, 625, 589, 512, 456, 398, 325, 286].reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#f56c6c' },
          { offset: 1, color: '#e6a23c' }
        ])
      }
    }]
  }
  errorChart.setOption(errorOption)

  // 医院测试量对比
  hospitalChart = echarts.init(hospitalChartRef.value)
  const hospitalOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['测试人数', '测试次数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['第一医院', '第二医院', '第三医院', '研究中心', '妇幼保健院'] },
    yAxis: { type: 'value' },
    series: [
      { name: '测试人数', type: 'bar', data: [1256, 986, 756, 548, 310], itemStyle: { color: '#409eff' } },
      { name: '测试次数', type: 'bar', data: [3256, 2586, 1956, 1428, 1232], itemStyle: { color: '#67c23a' } }
    ]
  }
  hospitalChart.setOption(hospitalOption)

  // 得分分布
  scoreDistChart = echarts.init(scoreDistChartRef.value)
  const scoreDistOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['0-20', '21-40', '41-60', '61-80', '81-100'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [
        { value: 125, itemStyle: { color: '#f56c6c' } },
        { value: 486, itemStyle: { color: '#e6a23c' } },
        { value: 1856, itemStyle: { color: '#409eff' } },
        { value: 3256, itemStyle: { color: '#67c23a' } },
        { value: 2145, itemStyle: { color: '#909399' } }
      ],
      barWidth: '50%',
      itemStyle: { borderRadius: [8, 8, 0, 0] }
    }]
  }
  scoreDistChart.setOption(scoreDistOption)
}

// 响应窗口大小变化
const handleResize = () => {
  ageChart?.resize()
  completionChart?.resize()
  trendChart?.resize()
  errorChart?.resize()
  hospitalChart?.resize()
  scoreDistChart?.resize()
}

// 搜索
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 导出
const handleExport = () => {
  ElMessage.success('报告导出成功')
}

onMounted(() => {
  sessionStorage.setItem('activePath', '/home/statistics')
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  ageChart?.dispose()
  completionChart?.dispose()
  trendChart?.dispose()
  errorChart?.dispose()
  hospitalChart?.dispose()
  scoreDistChart?.dispose()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.filter-card {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.table-card {
  border-radius: 12px;
}

:deep(.el-progress-bar__outer) {
  border-radius: 10px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
}
</style>
