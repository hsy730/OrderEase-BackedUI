<template>
  <el-select 
    :model-value="modelValue"
    :placeholder="placeholder" 
    :style="{ width: width || '100%' }"
    filterable
    remote
    :remote-method="remoteSearchUser"
    :loading="userLoading"
    clearable
    @update:modelValue="handleUpdateModelValue"
    @change="handleChange"
  >
    <el-option
      v-for="user in userList"
      :key="user.id"
      :label="user.name"
      :value="user.id"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSimpleUserList } from '@/api/user.js'
import { ElMessage } from 'element-plus'

// 定义组件的 props
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  placeholder: {
    type: String,
    default: '请选择用户'
  },
  width: {
    type: String,
    default: '100%'
  }
})

// 定义组件的 emits
const emit = defineEmits(['update:modelValue', 'change'])

// 用户列表和加载状态
const userList = ref([])
const userLoading = ref(false)

// 获取用户列表
const fetchUserList = async () => {
  try {
    userList.value = await getSimpleUserList({ page: 1, pageSize: 100 })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 远程搜索用户
const remoteSearchUser = async (query) => {
  if (query === '') {
    // 如果查询为空，重新获取所有用户
    await fetchUserList()
    return
  }
  
  userLoading.value = true
  try {
    // 使用搜索关键词调用API
    const response = await getSimpleUserList({ 
      page: 1, 
      pageSize: 20, 
      search: query 
    })
    userList.value = response.data.list || response.data || []
  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索用户失败')
  } finally {
    userLoading.value = false
  }
}

// 处理值变更
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 处理模型值更新
const handleUpdateModelValue = (value) => {
  emit('update:modelValue', value)
}

// 组件挂载时获取用户列表
onMounted(() => {
  // fetchUserList()
})
</script>