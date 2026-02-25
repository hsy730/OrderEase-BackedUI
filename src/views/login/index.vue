<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <div class="login-banner">
      <div class="banner-content">
        <div class="banner-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5H5.4125H19.4125H19.425L19.825 3H21.825L21.425 5H21.4125H7.4125H7.4L3 21H1L5.4 5H3V3ZM8.4125 7H18.4125L17.6125 11H9.2125L8.4125 7ZM9.6125 13H17.2125L16.4125 17H10.4125L9.6125 13Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="logo-text">OrderEase</h1>
        </div>
        <p class="banner-slogan">智能订单管理系统</p>
        <div class="banner-features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <span>高效订单管理</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <span>数据智能分析</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <span>实时业务监控</span>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-form-wrapper">
      <div class="login-form-container slide-in-up">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>登录到您的账户以继续</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              size="large"
              prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-group">
              <el-input
                v-model="loginForm.captcha"
                placeholder="验证码"
                size="large"
                prefix-icon="Picture"
                clearable
              />
              <div class="captcha-wrapper" @click="refreshCaptcha">
                <canvas
                  ref="canvas"
                  width="120"
                  height="40"
                  class="captcha-canvas"
                ></canvas>
                <div class="captcha-overlay">
                  <el-icon><Refresh /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              size="large"
              class="login-button"
              @click="handleLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <div class="password-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>密码需包含大小写字母、数字和特殊字符</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Picture, ShoppingCart, DataAnalysis, TrendCharts, InfoFilled, Refresh } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { saveAdminInfo } from '@/utils/auth'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginFormRef = ref(null)

const captchaText = ref('')
const canvas = ref(null)

const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: '密码必须包含大小写字母、数字和特殊字符',
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
  ]
}

const generateCaptchaText = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

const drawCaptcha = () => {
  const ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height

  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f0f9ff')
  gradient.addColorStop(1, '#e0f2fe')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  captchaText.value = generateCaptchaText()

  ctx.font = 'bold 24px Arial'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < captchaText.value.length; i++) {
    const x = (width / 5) * (i + 1)
    const y = height / 2 + Math.random() * 6 - 3
    const rotate = (Math.random() - 0.5) * 0.4

    // 随机颜色
    const colors = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6']
    ctx.fillStyle = colors[i % colors.length]

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotate)
    ctx.fillText(captchaText.value[i], -8, 0)
    ctx.restore()
  }

  // 添加干扰线
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`
    ctx.lineWidth = 1
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  // 添加噪点
  for (let i = 0; i < 30; i++) {
    ctx.beginPath()
    ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

const refreshCaptcha = () => {
  if (canvas.value) {
    drawCaptcha()
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  if (loginForm.value.captcha.toLowerCase() !== captchaText.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    refreshCaptcha()
    return
  }

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const response = await login(loginForm.value)
    const adminInfo = {
      ...response.user_info,
      token: response.token,
      role: response.role
    }
    saveAdminInfo(adminInfo)
    userStore.setUserInfo(adminInfo)

    ElMessage.success({
      message: response.message || '登录成功',
      duration: 2000,
      showClose: true
    })

    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.error || '登录失败')
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 左侧横幅区域 */
.login-banner {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: hidden;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.banner-content {
  position: relative;
  z-index: 2;
  color: white;
  max-width: 400px;
}

.banner-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.logo-text {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.banner-slogan {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 48px;
  font-weight: 300;
}

.banner-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(8px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.feature-item span {
  font-size: 15px;
  font-weight: 500;
}

.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
}

/* 右侧表单区域 */
.login-form-wrapper {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.form-header p {
  font-size: 14px;
  color: #6b7280;
}

.login-form {
  margin-bottom: 24px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-input--large .el-input__wrapper) {
  padding: 10px 16px;
}

:deep(.el-input--large) {
  font-size: 15px;
}

.captcha-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-wrapper {
  position: relative;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.captcha-wrapper:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.captcha-canvas {
  display: block;
  border-radius: 12px;
}

.captcha-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-size: 20px;
}

.captcha-wrapper:hover .captcha-overlay {
  opacity: 1;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  margin-top: 8px;
}

.form-footer {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.password-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.password-tips .el-icon {
  color: #3b82f6;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-banner {
    display: none;
  }

  .login-form-wrapper {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .login-form-wrapper {
    padding: 24px;
  }

  .login-form-container {
    max-width: 100%;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .captcha-group {
    flex-direction: column;
  }

  .captcha-wrapper {
    width: 100%;
  }

  .captcha-canvas {
    width: 100%;
  }
}
</style>
