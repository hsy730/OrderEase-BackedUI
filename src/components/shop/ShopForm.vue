<template>
  <el-form ref="formRef" :model="formData" label-width="120px">
    <!-- 新增店主账户字段 -->
    <el-form-item label="店主账号" prop="owner_username" required>
      <el-input v-model="formData.owner_username" />
    </el-form-item>
    
    <el-form-item label="店主密码" prop="owner_password" required>
      <el-input v-model="formData.owner_password" type="password" show-password />
    </el-form-item>

    <!-- 原有字段 -->
    <el-form-item label="店铺名称" prop="name" required>
      <el-input v-model="formData.name" />
    </el-form-item>

    <!-- 新增联系字段 -->
    <el-form-item label="联系电话" prop="contact_phone" required>
      <el-input v-model="formData.contact_phone" />
    </el-form-item>
    
    <el-form-item label="联系邮箱" prop="contact_email" required>
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
import { ref } from 'vue';
defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit'])

const formRef = ref()

const rules = {
  owner_username: [{ required: true, message: '请输入店主账号', trigger: 'blur' }],
  owner_password: [{ required: true, message: '请输入店主密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  contact_email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const submit = () => {
  formRef.value.validate(valid => {
    if (valid) {
      emit('submit', formData.value)
    } else {
      return false
    }
  })
}
</script>