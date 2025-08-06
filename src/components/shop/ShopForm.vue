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
      <el-input v-model="formData.owner_password" type="password" show-password @input="formRef?.validateField('owner_password')" />
      <div class="el-form-item__help" v-if="!formData.owner_password">不填写则保持原密码不变</div>
    </el-form-item>

    <!-- 原有字段 -->
    <el-form-item label="店铺名称" prop="name" required>
      <el-input v-model="formData.name" />
    </el-form-item>

    <!-- 新增联系字段 -->
    <el-form-item label="联系电话" prop="contact_phone" >
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
    >
      <template #default>
        <div></div>
      </template>
    </el-date-picker>
    </el-form-item>

    <el-form-item label="店铺描述" prop="description">
      <el-input v-model="formData.description" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item label="店铺设置" prop="settings">
      <el-input v-model="formData.settings" type="textarea" :rows="3" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createShop, updateShop, getShopDetail } from '@/api/shop'  // 新增API引用

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
      settings: data.settings || '',
      valid_until: data.valid_until || new Date().toISOString()
    }
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
      settings: ''
    }
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
    errors.push('密码长度至少8位')
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

const formData = ref({
  owner_username: '',
      owner_password: '',
      name: '',
      contact_phone: '',
      contact_email: '',
      description: '',
      valid_until: new Date().toISOString(),
      address: '',
      settings: ''
})

const submit = () => {
  return new Promise((resolve, reject) => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        reject(new Error('表单验证失败'))
        return
      }

      try {
        const formValues = { ...formData.value }
        // 编辑店铺时，如果密码未填写则删除该字段，使用服务端旧密码
        if (formValues.id && !formValues.owner_password) {
          delete formValues.owner_password
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
defineExpose({
  submit
})
</script>