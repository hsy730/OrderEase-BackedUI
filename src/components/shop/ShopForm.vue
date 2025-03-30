<template>
  <el-form ref="formRef" :model="formData" label-width="100px">
    <el-form-item label="店铺名称" prop="name" required>
      <el-input v-model="formData.name" />
    </el-form-item>
    
    <el-form-item label="店铺地址" prop="address" required>
      <el-input v-model="formData.address" />
    </el-form-item>
    
    <el-form-item label="联系方式" prop="contact" required>
      <el-input v-model="formData.contact" />
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