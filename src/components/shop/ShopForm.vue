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
      />
    </el-form-item>

    <el-form-item label="店铺描述" prop="description">
      <el-input v-model="formData.description" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item label="店铺设置" prop="settings">
      <el-input v-model="formData.settings" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit'])

const submit = () => {
  emit('submit', formData.value)
}
</script>