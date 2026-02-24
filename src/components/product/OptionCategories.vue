<template>
  <div class="option-categories">
    <div v-if="categories.length === 0" class="empty-state">
      <el-icon class="empty-icon"><DocumentAdd /></el-icon>
      <p>暂无选项参数</p>
      <el-button type="primary" plain @click="$emit('add-category')">
        <el-icon><Plus /></el-icon>
        添加选项类别
      </el-button>
    </div>

    <div v-else>
      <div v-for="(category, categoryIndex) in categories" :key="categoryIndex" class="category-card">
        <div class="category-header">
          <div class="category-title">
            <el-icon class="category-icon"><Menu /></el-icon>
            <span class="category-index">选项组 {{ categoryIndex + 1 }}</span>
          </div>
          <el-button type="danger" text :icon="Delete" size="small" @click="$emit('remove-category', categoryIndex)">
            删除
          </el-button>
        </div>

        <div class="category-config">
          <el-form label-width="70px" class="category-form">
            <el-row :gutter="12">
              <el-col :span="10">
                <el-form-item label="参数名" label-width="70px">
                  <el-input v-model="category.name" placeholder="如：大小、口味" size="default" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="排序" label-width="50px">
                  <el-input-number v-model="category.display_order" :min="0" size="default" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <div class="checkbox-group">
                  <el-checkbox v-model="category.is_required" size="default">
                    <span class="checkbox-label">必选</span>
                  </el-checkbox>
                  <el-checkbox v-model="category.is_multiple" size="default" @change="(val) => $emit('multiple-change', categoryIndex, val)">
                    <span class="checkbox-label">允许多选</span>
                  </el-checkbox>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div class="options-list">
          <div class="options-header">
            <span class="options-title">选项列表</span>
            <el-button type="primary" text :icon="Plus" size="small" @click="$emit('add-option', categoryIndex)">
              添加选项
            </el-button>
          </div>

          <div class="options-items" :ref="el => setItemRef(el, categoryIndex)">
            <div v-for="(option, optionIndex) in category.options" :key="option._key || optionIndex" class="option-item" :data-index="optionIndex">
              <div class="drag-handle">
                <el-icon><Rank /></el-icon>
              </div>
              <div class="option-content">
                <div class="option-main-row">
                  <div class="option-index">{{ optionIndex + 1 }}</div>
                  <el-input v-model="option.name" placeholder="选项名称" class="option-name-input" size="default" />
                  <div class="option-price-group">
                    <span class="field-label">调价</span>
                    <el-input-number v-model="option.price_adjustment" :precision="2" :step="0.1" placeholder="0.00" size="default" controls-position="right" class="price-adjust-input" />
                  </div>
                  <el-checkbox v-model="option.is_default" size="default" class="default-checkbox" @change="(val) => $emit('default-change', categoryIndex, optionIndex, val)" :disabled="!category.is_multiple && option.is_default">
                    <span class="checkbox-label">默认</span>
                  </el-checkbox>
                  <el-button type="danger" text :icon="Close" size="small" @click="$emit('remove-option', categoryIndex, optionIndex)" class="remove-option-btn" :disabled="category.options.length <= 1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="add-category-section">
        <el-button type="primary" text :icon="Plus" @click="$emit('add-category')">
          添加选项类别
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Close, DocumentAdd, Menu, Delete, Rank } from '@element-plus/icons-vue'

defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add-category', 'remove-category', 'add-option', 'remove-option', 'default-change', 'multiple-change'])

const itemRefs = {}

const setItemRef = (el, index) => {
  if (el) {
    itemRefs[index] = el
  }
}

defineExpose({
  getItemRef: (index) => itemRefs[index]
})
</script>

<style scoped>
.option-categories {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 28px 20px;
}

.empty-icon {
  font-size: 36px;
  color: #d1d5db;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 12px;
}

.category-card {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 13px;
}

.category-icon {
  font-size: 14px;
  color: var(--color-primary);
}

.category-index {
  font-size: 12px;
}

.category-config {
  margin-bottom: 10px;
}

.category-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.checkbox-group {
  display: flex;
  gap: 12px;
  padding-top: 4px;
}

.checkbox-label {
  font-size: 12px;
  color: #86868b;
}

.options-list {
  background: white;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-top: 10px;
}

.options-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}

.options-title {
  font-size: 11px;
  font-weight: 500;
  color: #86868b;
}

.options-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  cursor: move;
  cursor: grab;
  color: #86868b;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.drag-handle:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
}

.drag-handle:active {
  cursor: grabbing;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-main-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-index {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.option-name-input {
  flex: 1;
  min-width: 100px;
  max-width: 180px;
}

.option-price-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.field-label {
  font-size: 11px;
  color: #86868b;
  white-space: nowrap;
}

.price-adjust-input {
  width: 80px;
}

.default-checkbox {
  flex-shrink: 0;
  margin-left: 4px;
}

.remove-option-btn {
  flex-shrink: 0;
  margin-left: auto;
}

.remove-option-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-category-section {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

:deep(.sortable-ghost) {
  opacity: 0.5;
  background: rgba(59, 130, 246, 0.08);
  border: 2px dashed var(--color-primary);
}

:deep(.sortable-chosen) {
  background: rgba(0, 0, 0, 0.02);
}

:deep(.sortable-drag) {
  opacity: 0.9;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .option-main-row {
    flex-wrap: wrap;
  }

  .option-name-input {
    width: 100%;
    max-width: none;
  }
}
</style>
