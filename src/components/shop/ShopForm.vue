<template>
  <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
    <!-- 新增店主账户字段 -->
    <el-form-item label="店主账号" prop="owner_username" required>
      <el-input v-model="formData.owner_username" />
    </el-form-item>
    <!-- 条件显示密码框 -->
    <el-form-item v-if="!props.shopId" label="店主密码" prop="owner_password" required>
      <el-input v-model="formData.owner_password" type="password" show-password @input="formRef?.validateField('owner_password')" />
    </el-form-item>
    <el-form-item v-else label="店主密码" prop="owner_password">
      <el-input v-model="formData.owner_password" type="password" show-password @input="formRef?.validateField('owner_password')" placeholder="不填写则保持原密码不变" />
    </el-form-item>

    <!-- 原有字段 -->
    <el-form-item label="店铺名称" prop="name" required>
      <el-input v-model="formData.name" />
    </el-form-item>

    <!-- 新增联系字段 -->
    <el-form-item label="联系电话" prop="contact_phone" :rules="[{ validator: validatePhone, trigger: 'blur' }]">
      <el-input v-model="formData.contact_phone" />
    </el-form-item>
    
    <el-form-item label="联系邮箱" prop="contact_email" >
      <el-input v-model="formData.contact_email" type="email" />
    </el-form-item>

    <el-form-item label="店铺地址" prop="address" >
      <el-input v-model="formData.address" />
    </el-form-item>

    <!-- 新增有效期选择 -->
    <el-form-item label="有效期至" prop="valid_until" required>
      <el-date-picker
        v-model="formData.valid_until"
        type="datetime"
        value-format="YYYY-MM-DDTHH:mm:ssZ"
        placeholder="选择有效期"
      />
    </el-form-item>

    <el-form-item label="店铺描述" prop="description">
      <el-input v-model="formData.description" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item label="店铺设置" prop="settings">
      <el-input v-model="settingsStr" type="textarea" :rows="3" @input="handleSettingsInput" />
      <div v-if="settingsError" class="settings-error">{{ settingsError }}</div>
    </el-form-item>

    <el-form-item label="店铺图片">
      <el-upload
        v-if="formData.id"
        class="shop-image-upload"
        :action="null"
        :http-request="handleUpload"
        :show-file-list="false"
        accept="image/*"
      >
        <AuthImage 
          v-if="formData.image_url" 
          :src="getImageUrl(formData.image_url)" 
          alt="店铺图片"
          class="preview-image"
          @error="handleImageError"
        />
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
      <div v-else class="upload-tip">请先保存店铺信息后再上传图片</div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { createShop, updateShop, getShopDetail, uploadShopImage } from '@/api/shop'  // 新增API引用
import { API_BASE_URL, API_PREFIX } from '@/config'
import AuthImage from '@/components/AuthImage.vue'

// 修改props接收方式
const props = defineProps({
  shopId: {
    type: [Number, String],
    default: null
  }
})

// 完善数据获取逻辑
const fetchShopDetail = async () => {
  if (!props.shopId) return
  try {
    const data = await getShopDetail(props.shopId)
    // 处理所有字段，确保空值和null被正确转换
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
    // 将settings对象转换为字符串显示
    settingsStr.value = JSON.stringify(formData.value.settings, null, 2)
    console.log('店铺详情数据:', formData.value)
  } catch (error) {
    ElMessage.error('获取店铺详情失败')
    console.error('获取店铺详情错误:', error)
  }
}

// 新增监听shopId变化
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
    // 重置settingsStr
    settingsStr.value = '{}'
  }
})

// 新增挂载时获取详情
onMounted(() => {
  if (props.shopId) {
    fetchShopDetail()
  }
})
const emit = defineEmits(['submit'])
const formRef = ref(null) // 添加表单引用

// 密码验证函数 - 合并所有错误提示
const validatePassword = (rule, value, callback) => {
  const errors = []
  
  // 检查是否必填
  if (!props.shopId && !value) {
    errors.push('请输入密码')
  }
  
  // 检查密码长度
  if (value && value.length < 8) {
    errors.push('长度至少8位')
  }
  
  // 检查是否包含数字
  if (value && !/(?=.*[0-9])/.test(value)) {
    errors.push('必须包含数字')
  }
  
  // 检查是否包含大写字母
  if (value && !/(?=.*[A-Z])/.test(value)) {
    errors.push('必须包含大写字母')
  }
  
  // 检查是否包含小写字母
  if (value && !/(?=.*[a-z])/.test(value)) {
    errors.push('必须包含小写字母')
  }
  
  // 检查是否包含特殊字符
  if (value && !/(?=.*[@#$%^&*])/.test(value)) {
    errors.push('必须包含特殊字符（如：@#$%^&*等）')
  }
  
  // 如果有错误，合并并返回
  if (errors.length > 0) {
    callback(new Error('密码' + errors.join('，')))
  } else {
    callback()
  }
}

// 表单验证规则
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

// 验证电话格式
const validatePhone = (rule, value, callback) => {
  if (!value) {
    return callback();
  }
  // 匹配中国大陆手机号和固定电话的正则表达式
  const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;
  if (phoneRegex.test(value)) {
    callback();
  } else {
    callback(new Error('请输入有效的电话号码'));
  }
};

// 处理图片加载错误
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

// 用于显示的settings字符串
const settingsStr = ref('')
// 用于显示的settings错误信息
const settingsError = ref('')

const submit = () => {
  return new Promise((resolve, reject) => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        reject(new Error('表单验证失败'))
        return
      }

      // 检查settings JSON格式
      if (settingsError.value) {
        ElMessage.error('店铺设置JSON格式不正确，请检查后重试')
        reject(new Error('店铺设置JSON格式不正确'))
        return
      }

      try {
        const formValues = { ...formData.value }
        // 编辑店铺时，如果密码未填写则删除该字段，使用服务端旧密码
        if (formValues.id && !formValues.owner_password) {
          delete formValues.owner_password
        }
        // 确保settings字段是对象格式
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

// 暴露submit方法给父组件
// 处理图片上传
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

// 获取图片完整URL
const getImageUrl = (path) => {
  return path ? `${API_BASE_URL}${API_PREFIX}/admin/shop/image?path=${path}` : ''
}

// 处理settings输入
const handleSettingsInput = (value) => {
  try {
    // 清除之前的错误信息
    settingsError.value = ''
    
    // 尝试解析输入的JSON字符串
    const parsed = JSON.parse(value)
    formData.value.settings = parsed
  } catch (e) {
    // 如果解析失败，显示错误信息
    settingsError.value = 'JSON格式不正确: ' + e.message
    console.log('Settings JSON解析失败:', e)
  }
}

defineExpose({
  submit
})
</script>

<style scoped>
.shop-image-upload {
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-tip {
  color: #909399;
  font-size: 14px;
}

.settings-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
</style>