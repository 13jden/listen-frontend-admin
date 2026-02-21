<template>
  <div class="login-page">
    <!-- 背景动画 -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-container">
      <!-- 系统标题 -->
      <div class="system-title">
        <div class="title-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" fill="currentColor"/>
            <path d="M19 12C19 14.7614 16.7614 17 14 17H10C7.23858 17 5 14.7614 5 12V12C5 9.23858 7.23858 7 10 7H14C16.7614 7 19 9.23858 19 12Z" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
        <h1>听力测试后台管理系统</h1>
        <p>Hearing Test Management System</p>
      </div>

      <!-- 登录卡片 -->
      <el-card class="login-card" shadow="hover">
        <div class="card-header">
          <h2>欢迎登录</h2>
          <span>Welcome Back</span>
        </div>
        
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="formRef" 
          @keyup.enter="handleLogin"
          class="login-form"
        >
          <el-form-item prop="name">
            <el-input 
              v-model="form.name" 
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item prop="checkCode">
            <div class="code-input-wrapper">
              <el-input 
                v-model="form.checkCode" 
                placeholder="请输入验证码"
                size="large"
                :prefix-icon="CircleCheck"
                @keyup.enter="handleLogin"
              />
              <div class="code-image" @click="refreshCheckCode" title="点击刷新验证码">
                <img v-if="checkCodeImage" :src="checkCodeImage" alt="验证码" />
                <div v-else class="code-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large"
              @click="handleLogin" 
              :loading="loading" 
              :disabled="loading"
              class="login-button"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="card-footer">
          <span>© 2024 听力测试管理系统</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { User, Lock, CircleCheck, Loading } from '@element-plus/icons-vue';
import router from '../router/index';
import { getCheckCode, login } from '../api/admin';
import { ElMessage } from 'element-plus';

const form = ref({
  name: '',
  password: '',
  checkCode: '',
});

const rules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
};

const loading = ref(false);
const checkCodeImage = ref('');
const checkCodeKey = ref('');
const formRef = ref(null);

onMounted(async () => {
  await refreshCheckCode();
});

// 刷新验证码
const refreshCheckCode = async () => {
  try {
    const data = await getCheckCode();
    checkCodeImage.value = data.checkCode;
    checkCodeKey.value = data.checkCodeKey;
    form.value.checkCode = '';
  } catch (error) {
    ElMessage.error('验证码加载失败');
  }
};

// 登录处理函数
const handleLogin = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  if (!form.value.name || !form.value.password || !form.value.checkCode) {
    ElMessage.error('请填写所有字段');
    return;
  }

  loading.value = true;
  const loginData = {
    ...form.value,
    checkCodeKey: checkCodeKey.value,
  };

  try {
    const response = await login(loginData);
    if (response.code === 1) {
      sessionStorage.setItem('admin', JSON.stringify(response.data));
      router.push('/home');
    } else {
      ElMessage.error(response.message || '登录失败');
      await refreshCheckCode();
    }
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请检查用户名、密码或验证码');
    await refreshCheckCode();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
  z-index: 9999;
}

/* 背景动画形状 */
.bg-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #4f46e5;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #06b6d4;
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #8b5cf6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* 系统标题 */
.system-title {
  text-align: center;
  color: #fff;
  animation: fadeInDown 0.6s ease-out;
}

.title-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  color: #06b6d4;
}

.title-icon svg {
  width: 100%;
  height: 100%;
}

.system-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #fff 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.system-title p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0;
}

/* 登录卡片 */
.login-card {
  width: 420px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 5px 0;
}

.card-header span {
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 2px;
}

/* 表单样式 */
.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 4px 12px;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 12px rgba(6, 182, 212, 0.2);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #06b6d4;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 验证码输入框包装 */
.code-input-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-input-wrapper :deep(.el-input) {
  flex: 1;
}

.code-image {
  width: 120px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.code-image:hover {
  border-color: #06b6d4;
  transform: scale(1.02);
}

.code-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.code-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #0f3460 0%, #06b6d4 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

/* 卡片底部 */
.card-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.card-footer span {
  font-size: 12px;
  color: #9ca3af;
}

/* 动画 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    width: 90vw;
    margin: 0 20px;
  }
  
  .system-title h1 {
    font-size: 22px;
  }
  
  .code-input-wrapper {
    flex-direction: column;
  }
  
  .code-image {
    width: 100%;
    height: 40px;
  }
}
</style>
