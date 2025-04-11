<template>
  <div class="login-container">
    <div class="login-box">
      <h2>订单管理系统</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              prefix-icon="Picture"
              style="flex: 1; margin-right: 10px;"
            />
            <canvas
              ref="canvas"
              width="120"
              height="40"
              class="captcha-canvas"
              @click="refreshCaptcha"
            ></canvas>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            style="width: 100%"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 首次登录提示 -->
      <!-- <div class="login-tips">
        <p>初始账号：admin</p>
        <p>初始密码：Admin@123456</p>
        <p class="warning">请在首次登录后立即修改密码！</p>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Picture } from '@element-plus/icons-vue'
import { login } from '@/api/auth'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref(null)

const captchaText = ref('') // 存储正确的验证码文本
const canvas = ref(null)

const loginForm = ref({
  username: '',
  password: '',
  captcha: '' // 添加验证码字段
})

// 表单验证规则
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

// 生成随机验证码文本
const generateCaptchaText = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

// 绘制验证码
const drawCaptcha = () => {
  const ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height
  
  // 清空画布
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, width, height)
  
  // 生成新的验证码文本
  captchaText.value = generateCaptchaText()
  
  // 绘制文本
  ctx.font = '24px Arial'
  ctx.fillStyle = '#333'
  ctx.textBaseline = 'middle'
  
  // 随机偏移每个字符
  for (let i = 0; i < captchaText.value.length; i++) {
    const x = (width / 5) * (i + 1)
    const y = height / 2 + Math.random() * 8 - 4
    const rotate = (Math.random() - 0.5) * 0.3
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotate)
    ctx.fillText(captchaText.value[i], -8, 0)
    ctx.restore()
  }
  
  // 添加干扰线
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  if (canvas.value) {
    drawCaptcha()
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 验证码校验
  if (loginForm.value.captcha.toLowerCase() !== captchaText.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    refreshCaptcha()
    return
  }
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await login(loginForm.value)
    // 存储管理员信息和 token
    const adminInfo = {
      ...response.user_info,
      token: response.token,
      role: response.role
    }
    localStorage.setItem('admin', JSON.stringify(adminInfo))
    
    ElMessage.success(response.message || '登录成功')
    
    if (loginForm.value.password === 'Admin@123456') {
      ElMessage.warning('您正在使用初始密码，请及时修改！')
    }
    
    router.push('/')
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
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7f9;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-tips {
  margin-top: 20px;
  padding: 10px;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 13px;
  color: #909399;
}

.login-tips .warning {
  color: #e6a23c;
  font-weight: bold;
}

:deep(.el-input__wrapper) {
  background: #f5f7f9;
}

.captcha-canvas {
  cursor: pointer;
  border-radius: 4px;
  vertical-align: middle;
}

.captcha-container {
  display: flex;
  align-items: center;
}
</style>