<template>
  <el-dialog
    v-model="visible"
    :title="`管理标签 - ${productName}`"
    width="800px"
    destroy-on-close
  >
    <div class="tag-cloud-container">
      <div class="tag-cloud">
        <el-tag
          v-for="tag in allTags"
          :key="tag.id"
          :class="{'selected-tag': selectedTags.includes(tag.id)}"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </el-tag>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getProductTags,
  getAvailableTags,
  batchUpdateTags
} from '@/api/tag'

const visible = ref(false)
const productId = ref(null)
const productName = ref('')
const allTags = ref([]) // 所有标签
const selectedTags = ref([]) // 选中的标签

// 打开弹窗
const open = async (params) => {
  productId.value = params.productId
  productName.value = params.productName
  visible.value = true
  await fetchTags()
}

// 获取标签数据
const fetchTags = async () => {
  try {
    if (!productId.value) {
      console.error('缺少商品ID')
      return
    }
    
    const [productTagsRes, availableTagsRes] = await Promise.all([
      getProductTags(productId.value),
      getAvailableTags(productId.value)
    ]).catch(err => {
      console.error('获取标签失败:', err)
      return []
    })
    
    // 合并所有标签并标记选中状态
    const productTags = productTagsRes.tags || []
    const availableTags = availableTagsRes.tags || []
    
    allTags.value = [...productTags, ...availableTags]
    selectedTags.value = productTags.map(tag => tag.id)
  } catch (error) {
    console.error('获取标签失败:', error)
    ElMessage.error('获取标签失败')
  }
}

// 切换标签选中状态
const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

// 保存标签
const handleSave = async () => {
  try {
    // 获取当前选中的标签ID
    const currentTags = allTags.value
      .filter(tag => selectedTags.value.includes(tag.id))
      .map(tag => tag.id)
    
    // 批量更新标签
    await batchUpdateTags(productId.value, currentTags)
    
    ElMessage.success('标签更新成功')
    visible.value = false
  } catch (error) {
    console.error('保存标签失败:', error)
    ElMessage.error('保存标签失败')
  }
}

defineExpose({
  open
})
</script>

<style scoped>
.tag-cloud-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.el-tag {
  cursor: pointer;
  transition: all 0.2s;
  margin: 4px;
}

.el-tag:hover {
  transform: scale(1.05);
}

.selected-tag {
  background-color: var(--el-color-primary);
  color: white;
  border-color: var(--el-color-primary);
}
</style>
