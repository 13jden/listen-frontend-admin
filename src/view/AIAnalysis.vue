<template>
  <div class="ai-analysis-container">
    <el-row :gutter="20">
      <!-- 左侧：分析条件配置 -->
      <el-col :span="6">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>分析条件</span>
            </div>
          </template>
          
          <el-form :model="analysisConfig" label-width="80px">
            <el-form-item label="年龄段">
              <el-select v-model="analysisConfig.ageGroup" placeholder="请选择年龄段" style="width: 100%">
                <el-option label="全部" value="" />
                <el-option label="儿童(0-12岁)" value="child" />
                <el-option label="青少年(13-18岁)" value="teenager" />
                <el-option label="青年(19-40岁)" value="young" />
                <el-option label="中年(41-65岁)" value="middle" />
                <el-option label="老年(65岁以上)" value="elderly" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="医院">
              <el-select v-model="analysisConfig.hospital" placeholder="请选择医院" style="width: 100%" multiple>
                <el-option label="第一医院" value="1" />
                <el-option label="第二医院" value="2" />
                <el-option label="第三医院" value="3" />
                <el-option label="研究中心" value="4" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="analysisConfig.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="分析类型">
              <el-checkbox-group v-model="analysisConfig.analysisTypes">
                <el-checkbox label="error_pattern">错误模式分析</el-checkbox>
                <el-checkbox label="score_trend">得分趋势</el-checkbox>
                <el-checkbox label="recommendation">智能建议</el-checkbox>
                <el-checkbox label="prediction">预测分析</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" style="width: 100%" @click="startAnalysis" :loading="analyzing">
                <el-icon v-if="!analyzing"><MagicStick /></el-icon>
                {{ analyzing ? '分析中...' : '开始AI分析' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <!-- 快捷分析按钮 -->
          <el-divider>快捷分析</el-divider>
          <div class="quick-actions">
            <el-button size="small" @click="quickAnalysis('today')">今日概况</el-button>
            <el-button size="small" @click="quickAnalysis('week')">本周趋势</el-button>
            <el-button size="small" @click="quickAnalysis('month')">本月报告</el-button>
            <el-button size="small" @click="quickAnalysis('compare')">对比分析</el-button>
          </div>
        </el-card>
        
        <!-- 历史分析记录 -->
        <el-card class="history-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>历史分析</span>
            </div>
          </template>
          <div class="history-list">
            <div v-for="item in historyList" :key="item.id" class="history-item" @click="viewHistory(item)">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-time">{{ item.time }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 中间：分析结果 -->
      <el-col :span="12">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>AI 分析结论</span>
              <el-button type="primary" size="small" icon="Refresh" @click="refreshAnalysis">重新分析</el-button>
            </div>
          </template>
          
          <div v-if="!hasResult" class="empty-result">
            <el-icon :size="60" color="#c0c4cc"><Document /></el-icon>
            <p>请配置分析条件，点击"开始AI分析"</p>
          </div>
          
          <div v-else class="analysis-result">
            <!-- 核心发现 -->
            <div class="result-section">
              <h3 class="section-title">
                <el-icon><Aim /></el-icon>
                核心发现
              </h3>
              <el-card shadow="never" class="finding-card">
                <p>{{ analysisResult.summary }}</p>
              </el-card>
            </div>
            
            <!-- 易错类型分析 -->
            <div class="result-section">
              <h3 class="section-title">
                <el-icon><Warning /></el-icon>
                易错类型分析
              </h3>
              <div class="error-tags">
                <el-tag v-for="err in analysisResult.errorTypes" :key="err.type" 
                  :color="err.color" effect="dark" class="error-tag">
                  {{ err.type }}
                  <span class="error-count">{{ err.count }}次</span>
                  <span class="error-percent">({{ err.percent }}%)</span>
                </el-tag>
              </div>
              <el-progress :percentage="75" :stroke-width="20" :color="errorProgressColors" style="margin-top: 15px;" />
              <p class="result-desc">在所有测试中，平均错误率为 75%，主要集中在语音识别和语义理解方面。</p>
            </div>
            
            <!-- 得分趋势 -->
            <div class="result-section">
              <h3 class="section-title">
                <el-icon><TrendCharts /></el-icon>
                得分趋势分析
              </h3>
              <div ref="scoreTrendChartRef" class="mini-chart"></div>
            </div>
            
            <!-- 智能建议 -->
            <div class="result-section">
              <h3 class="section-title">
                <el-icon><ChatDotRound /></el-icon>
                智能建议
              </h3>
              <el-card shadow="never" class="advice-card">
                <ul class="advice-list">
                  <li v-for="(advice, idx) in analysisResult.recommendations" :key="idx">
                    <el-icon color="#67c23a"><CircleCheck /></el-icon>
                    {{ advice }}
                  </li>
                </ul>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：详细数据 -->
      <el-col :span="6">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>数据明细</span>
            </div>
          </template>
          
          <div class="detail-stats">
            <div class="detail-item">
              <div class="detail-value">{{ detailStats.totalUsers }}</div>
              <div class="detail-label">分析用户数</div>
            </div>
            <div class="detail-item">
              <div class="detail-value">{{ detailStats.totalTests }}</div>
              <div class="detail-label">测试总数</div>
            </div>
            <div class="detail-item">
              <div class="detail-value">{{ detailStats.avgScore }}</div>
              <div class="detail-label">平均得分</div>
            </div>
            <div class="detail-item">
              <div class="detail-value">{{ detailStats.improvement }}</div>
              <div class="detail-label">提升幅度</div>
            </div>
          </div>
        </el-card>
        
        <!-- 问题诊断 -->
        <el-card class="diagnosis-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>问题诊断</span>
            </div>
          </template>
          
          <div class="diagnosis-list">
            <div v-for="(item, idx) in diagnosisList" :key="idx" class="diagnosis-item">
              <div class="diagnosis-icon" :style="{ backgroundColor: item.color }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="diagnosis-info">
                <div class="diagnosis-title">{{ item.title }}</div>
                <div class="diagnosis-desc">{{ item.desc }}</div>
              </div>
              <el-tag :type="item.severity" size="small">{{ item.level }}</el-tag>
            </div>
          </div>
        </el-card>
        
        <!-- 操作按钮 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>导出操作</span>
            </div>
          </template>
          <div class="export-actions">
            <el-button type="primary" plain icon="Document" style="width: 100%; margin-bottom: 10px;">导出分析报告</el-button>
            <el-button type="success" plain icon="Printer" style="width: 100%;">打印预览</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 分析配置
const analysisConfig = reactive({
  ageGroup: '',
  hospital: [],
  dateRange: [],
  analysisTypes: ['error_pattern', 'recommendation']
})

// 状态
const analyzing = ref(false)
const hasResult = ref(false)
const scoreTrendChartRef = ref(null)

// 历史记录
const historyList = ref([
  { id: 1, title: '本月听力测试分析报告', time: '2024-06-15 14:30' },
  { id: 2, title: '第一季度数据分析', time: '2024-04-01 10:20' },
  { id: 3, title: '儿童群体专项分析', time: '2024-03-20 16:45' },
  { id: 4, title: '各医院对比报告', time: '2024-03-10 09:15' }
])

// 分析结果
const analysisResult = ref({
  summary: '根据对 3,856 名用户的 12,458 次测试数据分析，发现整体听力表现呈上升趋势。青年组平均得分 82.5 分，老年组平均得分 65.3 分。错误类型主要集中在前后鼻音混淆（占比 23.5%）和声调错误（占比 18.2%）。建议加强针对性语音训练，特别是对老年群体的语速控制训练。',
  errorTypes: [
    { type: '前后鼻音混淆', count: 856, percent: 23.5, color: '#f56c6c' },
    { type: '声调错误', count: 698, percent: 18.2, color: '#e6a23c' },
    { type: '平翘舌不分', count: 625, percent: 16.3, color: '#409eff' },
    { type: '儿化音错误', count: 512, percent: 13.3, color: '#67c23a' },
    { type: '轻声过重', count: 456, percent: 11.9, color: '#909399' }
  ],
  recommendations: [
    '建议在测试中增加前后鼻音辨别的专项训练模块',
    '针对老年用户群体，建议适当放慢测试语音播放速度',
    '可引入多音字专项测试，提升语义理解准确率',
    '建议医护人员关注测试得分低于 60 分的用户，进行跟进回访',
    '可建立个人听力档案，追踪长期听力变化趋势'
  ]
})

// 错误进度条颜色
const errorProgressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#409eff', percentage: 60 },
  { color: '#67c23a', percentage: 80 },
  { color: '#67c23a', percentage: 100 }
]

// 数据明细
const detailStats = ref({
  totalUsers: '3,856',
  totalTests: '12,458',
  avgScore: '78.6',
  improvement: '+5.2%'
})

// 问题诊断
const diagnosisList = ref([
  {
    title: '老年群体得分偏低',
    desc: '65岁以上用户平均得分仅65.3分',
    level: '严重',
    severity: 'danger',
    color: '#f56c6c',
    icon: 'Warning'
  },
  {
    title: '部分音频语速过快',
    desc: '部分测试音频语速超出标准范围',
    level: '中等',
    severity: 'warning',
    color: '#e6a23c',
    icon: 'Timer'
  },
  {
    title: '医院数据不同步',
    desc: '第三医院数据更新延迟',
    level: '轻微',
    severity: 'info',
    color: '#409eff',
    icon: 'Refresh'
  }
])

// 开始分析
const startAnalysis = async () => {
  analyzing.value = true
  hasResult.value = false
  
  // 模拟AI分析过程
  setTimeout(() => {
    analyzing.value = false
    hasResult.value = true
    ElMessage.success('AI分析完成')
    nextTick(() => {
      initScoreTrendChart()
    })
  }, 2000)
}

// 快捷分析
const quickAnalysis = (type) => {
  ElMessage.info(`正在执行${type}分析...`)
  startAnalysis()
}

// 查看历史
const viewHistory = (item) => {
  ElMessage.success(`正在加载：${item.title}`)
  hasResult.value = true
  nextTick(() => {
    initScoreTrendChart()
  })
}

// 重新分析
const refreshAnalysis = () => {
  startAnalysis()
}

// 初始化得分趋势图
const initScoreTrendChart = () => {
  if (!scoreTrendChartRef.value) return
  
  const chart = echarts.init(scoreTrendChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value', min: 60, max: 100 },
    series: [{
      type: 'line',
      data: [72, 74, 75, 78, 80, 82],
      smooth: true,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#409eff' },
      markLine: {
        data: [{ type: 'average', name: '平均值' }],
        lineStyle: { color: '#67c23a' }
      }
    }]
  }
  chart.setOption(option)
}

onMounted(() => {
  sessionStorage.setItem('activePath', '/home/ai-analysis')
})
</script>

<style scoped>
.ai-analysis-container {
  padding: 20px;
}

.config-card, .result-card, .detail-card, .history-card, .diagnosis-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.empty-result {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-result p {
  margin-top: 20px;
}

.analysis-result {
  padding: 10px 0;
}

.result-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.finding-card {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}

.finding-card p {
  line-height: 1.8;
  color: #303133;
}

.error-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.error-tag {
  padding: 8px 15px;
  font-size: 14px;
}

.error-count, .error-percent {
  margin-left: 8px;
  opacity: 0.8;
  font-size: 12px;
}

.result-desc {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
}

.mini-chart {
  height: 200px;
  width: 100%;
}

.advice-card {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.advice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.advice-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-actions .el-button {
  margin: 0;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item:last-child {
  border-bottom: none;
}

.history-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.detail-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.detail-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.diagnosis-list {
  max-height: 350px;
  overflow-y: auto;
}

.diagnosis-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.diagnosis-item:last-child {
  border-bottom: none;
}

.diagnosis-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.diagnosis-info {
  flex: 1;
}

.diagnosis-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.diagnosis-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.export-actions {
  display: flex;
  flex-direction: column;
}
</style>
