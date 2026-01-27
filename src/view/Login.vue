<template>
  <div>
    <el-container class="login-container">
      <el-main class="login-main">
        <el-card class="login-card">
          <h2 class="title">登录</h2>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
            <el-form-item label="用户名" prop="name">
              <el-input v-model="form.name" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item label="验证码" prop="checkCode">
              <el-input v-model="form.checkCode" placeholder="请输入验证码" />
              <img :src="checkCodeImage" alt="验证码" @click="refreshCheckCode" class="checkcode-img" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogin" :loading="loading" :disabled="loading">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '../router/index';
import { getCheckCode, login } from '../api/admin';  // 导入封装的接口
import { ElMessage } from 'element-plus';

const form = ref({
  name: '',
  password: '',
  checkCode: '',  // 验证码
});

const rules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
};

const loading = ref(false);
const checkCodeImage = ref('');
const checkCodeKey = ref('');

onMounted(async () => {
  // 页面加载时，获取验证码
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
  // 校验表单
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
      sessionStorage.setItem('admin',JSON.stringify(response.data));
      const admin = sessionStorage.getItem('admin');
      console.log(admin);
      router.push('/home');  
    } else {
      ElMessage.error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请检查用户名、密码或验证码');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 页面容器 */
.login-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #193273, #699fdd);
  animation: gradient 10s ease infinite;
  left: 0%;
  top: 0%;
  overflow: hidden;
}

/* 主内容区域 */
.login-main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
}

/* 登录卡片 */
.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background-color: #fff;
}

/* 标题 */
.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #193273;
}

/* 验证码图片 */
.checkcode-img {
  margin-top: 10px;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ddd;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* 登录按钮 */
.el-button--primary {
  width: 100%;
  background-color: #193273;
  border-color: #193273;
  font-size: 16px;
  font-weight: bold;
}

.el-button--primary:hover {
  background-color: #699fdd;
  border-color: #699fdd;
}

/* 输入框样式 */
.el-input {
  width: 100%;
  border-radius: 5px;
}

.el-input__inner {
  border: 1px solid #ddd;
}

.el-input__inner:focus {
  border-color: #193273;
  box-shadow: 0 0 5px rgba(25, 50, 115, 0.5);
}

/* 加载动画 */
.el-button--primary.is-loading::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 背景渐变动画 */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>