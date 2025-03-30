<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="80px"
    label-position="top"
  >
    <el-form-item label="店铺名称" prop="name">
      <el-input v-model="formData.name" />
    </el-form-item>
    
    <el-form-item label="店铺地址" prop="address">
      <el-input v-model="formData.address" type="textarea" :rows="3" />
    </el-form-item>
    
    <el-form-item label="联系方式" prop="contact">
      <el-input v-model="formData.contact" />
    </el-form-item>
    
    <div class="form-footer">
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)

const rules = {
  name: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    emit('submit', props.formData)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.form-footer {
  margin-top: 20px;
  text-align: right;
}
</style>