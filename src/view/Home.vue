<template>
  <div>
    <el-container class="home-container">
      <!-- Header -->
      <el-header class="header">
        <el-row>
          <el-col :span="16">
            <p class="system-name">听力测试后台管理系统</p>
          </el-col>
          <el-col :offset="12" :span="8" style="min-width: 150px">
            <el-dropdown style="float: right; margin: 20px 10px">
              <template #dropdown>
                <el-dropdown-menu>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-header>

      <el-container style="overflow: auto">
        <!-- 菜单 -->
        <el-aside class="aside">
          <el-menu
            router
            :default-active="activePath"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/home/index">
              <el-icon>
                <House />
              </el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/home/user">
              <el-icon>
                <User />
              </el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/home/audio">
              <el-icon>
                <Headset />
              </el-icon>
              <span>测试音频管理</span>
            </el-menu-item>
            <el-menu-item index="/home/test">
              <el-icon>
                <Clipboard />
              </el-icon>
              <span>测试情况</span>
            </el-menu-item>
            <el-menu-item index="/home/hospital">
              <el-icon>
                <Clipboard />
              </el-icon>
              <span>医院管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 主内容区域 -->
        <el-container>
          <el-main class="main">
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 挂载 DOM 之前
onBeforeMount(() => {
  // 初始化 activePath
  activePath.value = sessionStorage.getItem('activePath') || '/home/index';
});

let isCollapse = ref(false);
let activePath = ref('/home/index');

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 更新 activePath
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

// 退出登录
const logout = () => {
  sessionStorage.clear();
  router.push('/login');
};
</script>

<style scoped>
.home-container {
  position: fixed; /* 改为 fixed 确保占满视口 */
  top: 0;
  left: 0;
  width: 100vw; /* 确保占满整个视口宽度 */
  height: 100vh; /* 确保占满整个视口高度 */
  display: flex;
  flex-direction: column; /* 保证父容器纵向布局 */
}

/* Header 样式 */
.header {
  background: #304156;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* 防止 Header 被压缩 */
  width: 100%;
}

.system-name {
  height: 100%;
  position: relative;
  color: #fff;
  font-size: 26px;
  font-weight: bold;
}

.user-avatar {
  cursor: pointer;
}

/* 菜单栏样式 */
.aside {
  background: #304156;
  width: 200px; /* 固定宽度 */
  transition: width 0.3s ease;
  flex-shrink: 0; /* 防止菜单栏被压缩 */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  margin: 5px 0;
  border-radius: 4px;
}

.el-menu-item.is-active {
  background-color: #409EFF !important;
  color: #fff !important;
}

.el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 折叠按钮样式 */
.toggle-button {
  background-color: #263445;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  color: #bfcbd9;
  border-bottom: 1px solid #1f2d3d;
}

.toggle-button:hover {
  background-color: #1f2d3d;
}

/* 主内容区域样式 */
.main {
  padding: 20px;
  background: #f0f2f5;
  flex-grow: 1; /* 确保内容区域占满剩余空间 */
  overflow-y: auto;
}
</style>
