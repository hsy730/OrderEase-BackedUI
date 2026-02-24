<template>
  <el-dialog
    v-model="visible"
    title=""
    width="560px"
    destroy-on-close
    class="apple-dialog tag-manage-dialog"
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-info">
          <h3 class="dialog-title">管理标签</h3>
          <p class="dialog-subtitle">{{ productName }}</p>
        </div>
        <button class="close-btn" @click="visible = false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </template>

    <div class="dialog-content">
      <div class="tags-section">
        <div class="section-header">
          <span class="section-title">选择标签</span>
          <span class="selected-count">{{ selectedTags.length }} 个已选</span>
        </div>
        
        <div class="tag-cloud-container">
          <div class="tag-cloud">
            <button
              v-for="tag in allTags"
              :key="tag.id"
              :class="['tag-item', { 'selected': selectedTags.includes(tag.id) }]"
              @click="toggleTag(tag.id)"
            >
              <svg v-if="selectedTags.includes(tag.id)" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ tag.name }}</span>
            </button>
          </div>
          
          <div v-if="allTags.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p>暂无可用标签</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="visible = false">取消</button>
        <button class="btn-confirm" @click="handleSave">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>保存更改</span>
        </button>
      </div>
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
const allTags = ref([])
const selectedTags = ref([])

const open = async (params) => {
  productId.value = params.productId
  productName.value = params.productName
  visible.value = true
  await fetchTags()
}

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
    
    const productTags = productTagsRes.tags || []
    const availableTags = availableTagsRes.tags || []
    
    allTags.value = [...productTags, ...availableTags]
    selectedTags.value = productTags.map(tag => tag.id)
  } catch (error) {
    console.error('获取标签失败:', error)
    ElMessage.error('获取标签失败')
  }
}

const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const handleSave = async () => {
  try {
    const currentTags = allTags.value
      .filter(tag => selectedTags.value.includes(tag.id))
      .map(tag => tag.id)
    
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
.tag-manage-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.tag-manage-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.tag-manage-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.tag-manage-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-info {
  flex: 1;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.dialog-subtitle {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1d1d1f;
}

.dialog-content {
  padding: 24px;
}

.tags-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.selected-count {
  font-size: 13px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.tag-cloud-container {
  max-height: 320px;
  overflow-y: auto;
  padding: 20px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 14px;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.2);
}

.tag-item.selected {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tag-item.selected svg {
  color: #ffffff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #86868b;
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.01);
}

.btn-cancel {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.08);
}

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
</style>
