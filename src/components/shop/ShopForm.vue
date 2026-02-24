<template>
  <div class="shop-form-container">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="shop-form">
      <div class="form-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="section-title">
            <h3>店主账户</h3>
            <p>设置店铺管理员的登录账号</p>
          </div>
        </div>
        <div class="section-content">
          <div class="form-row">
            <el-form-item label="店主账号" prop="owner_username" class="form-item">
              <el-input v-model="formData.owner_username" placeholder="请输入店主账号" />
            </el-form-item>
            <el-form-item v-if="!props.shopId" label="店主密码" prop="owner_password" class="form-item">
              <el-input v-model="formData.owner_password" type="password" show-password placeholder="请输入密码" @input="formRef?.validateField('owner_password')" />
            </el-form-item>
            <el-form-item v-else label="店主密码" prop="owner_password" class="form-item">
              <el-input v-model="formData.owner_password" type="password" show-password placeholder="不填写则保持原密码不变" @input="formRef?.validateField('owner_password')" />
            </el-form-item>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="section-title">
            <h3>基本信息</h3>
            <p>店铺的基本资料</p>
          </div>
        </div>
        <div class="section-content">
          <div class="form-row">
            <el-form-item label="店铺名称" prop="name" class="form-item">
              <el-input v-model="formData.name" placeholder="请输入店铺名称" />
            </el-form-item>
            <el-form-item label="有效期至" prop="valid_until" class="form-item">
              <el-date-picker
                v-model="formData.valid_until"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ssZ"
                placeholder="选择有效期"
                :disabled="!isAdminRole()"
                class="full-width"
              />
            </el-form-item>
          </div>
          <el-form-item label="店铺描述" prop="description" class="form-item full-width">
            <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入店铺描述" />
          </el-form-item>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <div class="section-title">
            <h3>联系方式</h3>
            <p>店铺的联系信息</p>
          </div>
        </div>
        <div class="section-content">
          <div class="form-row">
            <el-form-item label="联系电话" prop="contact_phone" class="form-item">
              <el-input v-model="formData.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="联系邮箱" prop="contact_email" class="form-item">
              <el-input v-model="formData.contact_email" type="email" placeholder="请输入联系邮箱" />
            </el-form-item>
          </div>
          <el-form-item label="店铺地址" prop="address" class="form-item full-width">
            <el-input v-model="formData.address" placeholder="请输入店铺地址" />
          </el-form-item>
        </div>
      </div>

      <div class="form-section" v-if="isAdminRole()">
        <div class="section-header">
          <div class="section-icon settings">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div class="section-title">
            <h3>店铺设置</h3>
            <p>高级配置选项（JSON格式）</p>
          </div>
        </div>
        <div class="section-content">
          <el-form-item prop="settings" class="form-item full-width">
            <el-input v-model="settingsStr" type="textarea" :rows="5" placeholder="请输入JSON格式的设置" @input="handleSettingsInput" />
            <div v-if="settingsError" class="settings-error">{{ settingsError }}</div>
          </el-form-item>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <div class="section-icon image">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div class="section-title">
            <h3>店铺图片</h3>
            <p>上传店铺展示图片</p>
          </div>
        </div>
        <div class="section-content">
          <div class="image-upload-wrapper">
            <el-upload
              v-if="formData.id"
              class="shop-image-upload"
              :action="null"
              :http-request="handleUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <SmartImage 
                v-if="formData.image_url" 
                :src="getImageUrl(formData.image_url)" 
                alt="店铺图片"
                class="preview-image"
                @error="handleImageError"
              />
              <div v-else class="upload-placeholder">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>点击上传图片</span>
              </div>
            </el-upload>
            <div v-else class="upload-disabled-tip">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>请先保存店铺信息后再上传图片</span>
            </div>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createShop, updateShop, getShopDetail, uploadShopImage, getShopImageUrl } from '@/api/shop'
import SmartImage from '@/components/SmartImage.vue'
import { isAdminRole } from '@/utils/auth'

const props = defineProps({
  shopId: {
    type: [Number, String],
    default: null
  }
})

const fetchShopDetail = async () => {
  if (!props.shopId) return
  try {
    const data = await getShopDetail(props.shopId)
    formData.value = { 
      ...data,
      id: data.id || null,
      owner_username: data.owner_username || '',
      name: data.name || '',
      contact_phone: data.contact_phone || '',
      contact_email: data.contact_email || '',
      address: data.address || '',
      description: data.description || '',
      settings: data.settings || {},
      valid_until: data.valid_until || new Date().toISOString(),
      image_url: data.image_url || ''
    }
    settingsStr.value = JSON.stringify(formData.value.settings, null, 2)
  } catch (error) {
    ElMessage.error('获取店铺详情失败')
    console.error('获取店铺详情错误:', error)
  }
}

watch(() => props.shopId, (newVal) => {
  if (newVal) {
    fetchShopDetail()
  } else {
    formData.value = {
      owner_username: '',
      owner_password: '',
      name: '',
      contact_phone: '',
      contact_email: '',
      description: '',
      valid_until: new Date().toISOString(),
      address: '',
      settings: {},
      image_url: ''
    }
    settingsStr.value = '{}'
  }
})

onMounted(() => {
  if (props.shopId) {
    fetchShopDetail()
  }
})

const emit = defineEmits(['submit'])
const formRef = ref(null)

const validatePassword = (rule, value, callback) => {
  const errors = []
  
  if (!props.shopId && !value) {
    errors.push('请输入密码')
  }
  
  if (value && value.length < 8) {
    errors.push('长度至少8位')
  }
  
  if (value && !/(?=.*[0-9])/.test(value)) {
    errors.push('必须包含数字')
  }
  
  if (value && !/(?=.*[A-Z])/.test(value)) {
    errors.push('必须包含大写字母')
  }
  
  if (value && !/(?=.*[a-z])/.test(value)) {
    errors.push('必须包含小写字母')
  }
  
  if (value && !/(?=.*[@#$%^&*])/.test(value)) {
    errors.push('必须包含特殊字符（如：@#$%^&*等）')
  }
  
  if (errors.length > 0) {
    callback(new Error('密码' + errors.join('，')))
  } else {
    callback()
  }
}

const formRules = computed(() => ({
  owner_password: [
    { 
      validator: (rule, value, callback) => {
        if (props.shopId && !value) {
          callback();
          return;
        }
        validatePassword(rule, value, callback);
      }, 
      trigger: 'input' 
    }
  ]
}))

const validatePhone = (rule, value, callback) => {
  if (!value) {
    return callback();
  }
  const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;
  if (phoneRegex.test(value)) {
    callback();
  } else {
    callback(new Error('请输入有效的电话号码'));
  }
};

const handleImageError = () => {
  ElMessage.error('图片加载失败');
};

const formData = ref({
  owner_username: '',
  owner_password: '',
  name: '',
  contact_phone: '',
  contact_email: '',
  description: '',
  valid_until: new Date().toISOString(),
  address: '',
  settings: {},
  image_url: ''
})

const settingsStr = ref('')
const settingsError = ref('')

const submit = () => {
  return new Promise((resolve, reject) => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        reject(new Error('表单验证失败'))
        return
      }

      if (settingsError.value) {
        ElMessage.error('店铺设置JSON格式不正确，请检查后重试')
        reject(new Error('店铺设置JSON格式不正确'))
        return
      }

      try {
        const formValues = { ...formData.value }
        if (formValues.id && !formValues.owner_password) {
          delete formValues.owner_password
        }
        if (typeof formValues.settings === 'string') {
          try {
            formValues.settings = JSON.parse(formValues.settings)
          } catch (e) {
            formValues.settings = {}
          }
        }
        if (formValues.id) {
          await updateShop(formValues)
          ElMessage.success('店铺更新成功')
        } else {
          await createShop(formValues)
          ElMessage.success('店铺创建成功')
        }
        emit('submit')
        resolve(true)
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.response?.data?.message || '操作失败')
        reject(error)
      }
    })
  })
}

const handleUpload = async ({ file }) => {
  if (formData.value.id) {
    try {
      const res = await uploadShopImage(formData.value.id, file)
      formData.value.image_url = res.url
      ElMessage.success('图片上传成功')
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
    }
  } else {
    ElMessage.warning('请先保存店铺信息')
  }
}

const getImageUrl = (path) => {
  return path ? getShopImageUrl(path) : ''
}

const handleSettingsInput = (value) => {
  try {
    settingsError.value = ''
    const parsed = JSON.parse(value)
    formData.value.settings = parsed
  } catch (e) {
    settingsError.value = 'JSON格式不正确: ' + e.message
  }
}

defineExpose({
  submit
})
</script>

<style scoped>
.shop-form-container {
  padding: 4px 0;
}

.shop-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  color: #3b82f6;
  flex-shrink: 0;
}

.section-icon.settings {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  color: #8b5cf6;
}

.section-icon.image {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #34c759;
}

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.section-title p {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.section-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

.form-item {
  margin-bottom: 0;
}

.form-item.full-width {
  width: 100%;
}

.shop-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  padding-bottom: 8px;
}

.shop-form :deep(.el-input__wrapper),
.shop-form :deep(.el-textarea__inner) {
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.shop-form :deep(.el-input__wrapper:hover),
.shop-form :deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 0, 0, 0.2);
}

.shop-form :deep(.el-input__wrapper.is-focus),
.shop-form :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.shop-form :deep(.el-input__inner),
.shop-form :deep(.el-textarea__inner) {
  font-size: 14px;
  color: #1d1d1f;
}

.shop-form :deep(.el-input__inner::placeholder),
.shop-form :deep(.el-textarea__inner::placeholder) {
  color: #86868b;
}

.full-width {
  width: 100%;
}

.image-upload-wrapper {
  width: 100%;
}

.shop-image-upload {
  width: 160px;
  height: 160px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-image-upload:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.02);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #86868b;
}

.upload-placeholder svg {
  color: #3b82f6;
}

.upload-placeholder span {
  font-size: 13px;
}

.upload-disabled-tip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  color: #86868b;
  font-size: 14px;
}

.upload-disabled-tip svg {
  color: #ff9500;
  flex-shrink: 0;
}

.settings-error {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 8px;
}

@media screen and (max-width: 768px) {
  .form-section {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .shop-image-upload {
    width: 100%;
    height: 200px;
  }
}
</style>
