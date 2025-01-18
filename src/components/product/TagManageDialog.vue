<template>
  <el-dialog
    v-model="visible"
    :title="`管理标签 - ${productName}`"
    width="800px"
    destroy-on-close
  >
    <div class="tag-manage-container">
      <!-- 未绑定标签 -->
      <div class="tag-column">
        <div class="column-header">
          <span>未绑定标签</span>
          <el-button
            type="primary"
            size="small"
            :disabled="selectedAvailableTags.length === 0"
            @click="handleAddTags"
          >
            添加
          </el-button>
        </div>
        <div class="tag-cloud">
          <el-tag
            v-for="tag in availableTags"
            :key="tag.id"
            :class="{'selected-tag': selectedAvailableTags.includes(tag.id)}"
            @click="toggleAvailableTag(tag.id)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
      </div>

      <!-- 已绑定标签 -->
      <div class="tag-column">
        <div class="column-header">
          <span>已绑定标签</span>
          <el-button
            type="danger"
            size="small"
            :disabled="selectedProductTags.length === 0"
            @click="handleRemoveTags"
          >
            移除
          </el-button>
        </div>
        <div class="tag-cloud">
          <el-tag
            v-for="tag in productTags"
            :key="tag.id"
            :class="{'selected-tag': selectedProductTags.includes(tag.id)}"
            @click="toggleProductTag(tag.id)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getProductTags,
  getAvailableTags,
  batchTag
} from '@/api/tag'

const visible = ref(false)
const productId = ref(null)
const productName = ref('')
const productTags = ref([]) // 已绑定标签
const availableTags = ref([]) // 未绑定标签
const selectedProductTags = ref([]) // 选中的已绑定标签
const selectedAvailableTags = ref([]) // 选中的未绑定标签

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
    productTags.value = productTagsRes.tags || []
    availableTags.value = availableTagsRes.tags || []
  } catch (error) {
    console.error('获取标签失败:', error)
    ElMessage.error('获取标签失败')
  }
}

// 添加标签
const handleAddTags = async () => {
  try {
    await batchTag({
      productId: productId.value,
      tagIds: selectedAvailableTags.value,
      action: 'add'
    })
    ElMessage.success('添加标签成功')
    await fetchTags()
    selectedAvailableTags.value = []
  } catch (error) {
    console.error('添加标签失败:', error)
    ElMessage.error('添加标签失败')
  }
}

// 移除标签
const handleRemoveTags = async () => {
  try {
    await batchTag({
      productId: productId.value,
      tagIds: selectedProductTags.value,
      action: 'remove'
    })
    ElMessage.success('移除标签成功')
    await fetchTags()
    selectedProductTags.value = []
  } catch (error) {
    console.error('移除标签失败:', error)
    ElMessage.error('移除标签失败')
  }
}

defineExpose({
  open
})
</script>

<style scoped>
.tag-manage-container {
  display: flex;
  gap: 20px;
}

.tag-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.el-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.el-tag:hover {
  transform: scale(1.05);
}

.selected-tag {
  background-color: var(--el-color-primary);
  color: white;
}
</style>
