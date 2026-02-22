<template>
  <div class="home-wrapper">
    <el-container class="home-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" fill="currentColor"/>
                <path d="M19 12C19 14.7614 16.7614 17 14 17H10C7.23858 17 5 14.7614 5 12V12C5 9.23858 7.23858 7 10 7H14C16.7614 7 19 9.23858 19 12Z" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            <span class="system-name">听力测试后台管理系统</span>
          </div>
          
          <div class="user-section">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="36" class="user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ adminName }}</span>
                <el-icon class="arrow"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><UserFilled /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-container class="content-wrapper">
        <!-- 菜单 -->
        <el-aside class="aside">
          <el-menu
            router
            :default-active="activePath"
            class="el-menu-vertical"
            :collapse="isCollapse"
            background-color="transparent"
            text-color="rgba(255, 255, 255, 0.7)"
            active-text-color="#06b6d4"
          >
            <!-- 首页 -->
            <el-menu-item index="/home/index">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>

            <!-- 系统管理分组 -->
            <el-sub-menu index="/system">
              <template #title>
                <el-icon><Tools /></el-icon>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/home/admin">
                <el-icon><UserFilled /></el-icon>
                <span>管理员管理</span>
              </el-menu-item>
              <el-menu-item index="/home/role">
                <el-icon><Lock /></el-icon>
                <span>角色权限</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 用户管理 -->
            <el-menu-item index="/home/user">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>

            <!-- 测试音频管理 -->
            <el-menu-item index="/home/audio">
              <el-icon><Headset /></el-icon>
              <span>测试音频管理</span>
            </el-menu-item>

            <!-- 测试记录 -->
            <el-menu-item index="/home/test">
              <el-icon><Document /></el-icon>
              <span>测试记录</span>
            </el-menu-item>

            <!-- 医院管理 -->
            <el-menu-item index="/home/hospital">
              <el-icon><Bell /></el-icon>
              <span>医院管理</span>
            </el-menu-item>

            <!-- 数据统计分组 -->
            <el-sub-menu index="/statistics">
              <template #title>
                <el-icon><DataLine /></el-icon>
                <span>数据统计</span>
              </template>
              <el-menu-item index="/home/statistics">
                <el-icon><TrendCharts /></el-icon>
                <span>数据概览</span>
              </el-menu-item>
              <el-menu-item index="/home/ai-analysis">
                <el-icon><MagicStick /></el-icon>
                <span>AI辅助分析</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <!-- 主内容区域 -->
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  House, User, Headset, Document, Tools, DataLine,
  UserFilled, Lock, TrendCharts, MagicStick, Bell,
  ArrowDown, SwitchButton
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const adminName = ref('管理员');
const isCollapse = ref(false);
const activePath = ref('/home/index');

// 挂载 DOM 之前
onBeforeMount(() => {
  activePath.value = sessionStorage.getItem('activePath') || '/home/index';
  
  // 获取登录用户信息
  const adminStr = sessionStorage.getItem('admin');
  if (adminStr) {
    try {
      const admin = JSON.parse(adminStr);
      adminName.value = admin.name || '管理员';
    } catch (e) {
      console.error('解析用户信息失败', e);
    }
  }
});

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath;
    sessionStorage.setItem('activePath', newPath);
  },
  { immediate: true }
);

// 保存链接的激活状态
const saveActiveNav = (path) => {
  sessionStorage.setItem('activePath', path);
  activePath.value = path;
};

// 跳转到测试情况页面
const goToTestResults = (medicalId) => {
  saveActiveNav('/home/test');
  router.push({
    name: 'TestResults',
    query: { medicalId },
  });
};

// 用户菜单操作
const handleCommand = (command) => {
  if (command === 'logout') {
    sessionStorage.clear();
    router.push('/login');
    ElMessage.success('已退出登录');
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能开发中');
  }
};

// 退出登录
const logout = () => {
  sessionStorage.clear();
  router.push('/login');
};
</script>

<style scoped>
.home-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f0f23;
}

/* Header 样式 */
.header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  height: 64px;
  padding: 0 24px;
}

.header-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #06b6d4;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.system-name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #06b6d4, #8b5cf6);
}

.username {
  color: #fff;
  font-size: 14px;
}

.arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 菜单栏样式 */
.aside {
  width: 220px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow-y: auto;
  overflow-x: hidden;
}

.aside::-webkit-scrollbar {
  width: 4px;
}

.aside::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 220px;
}

.el-menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.el-menu-item:hover {
  background: rgba(6, 182, 212, 0.1) !important;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2)) !important;
  border-left: 3px solid #06b6d4;
}

.el-menu-item .el-icon {
  color: inherit;
}

/* 子菜单样式 */
:deep(.el-sub-menu__title) {
  border-radius: 8px;
  margin: 4px 12px;
}

:deep(.el-sub-menu__title:hover) {
  background: rgba(6, 182, 212, 0.1) !important;
}

:deep(.el-menu--inline) {
  background: rgba(0, 0, 0, 0.2) !important;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #06b6d4 !important;
}

/* 主内容区域样式 */
.main {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow-y: auto;
  overflow-x: hidden;
}

.main::-webkit-scrollbar {
  width: 8px;
}

.main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.main::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
</style>
