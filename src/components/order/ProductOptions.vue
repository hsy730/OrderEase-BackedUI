<template>
  <div class="product-options">
    <div
      v-for="category in optionCategories"
      :key="category.id"
      class="option-category"
    >
      <div class="category-header">
        <span class="category-name">{{ category.name }}</span>
        <span v-if="category.is_required" class="tag required-tag">必选</span>
        <span v-if="category.is_multiple" class="tag multiple-tag">多选</span>
      </div>

      <div class="options-container">
        <!-- 多选 -->
        <el-checkbox-group
          v-if="category.is_multiple"
          :model-value="selectedOptions[category.id] || []"
          @update:model-value="val => handleChange(category.id, val)"
          class="option-group"
        >
          <el-checkbox
            v-for="option in category.options"
            :key="option.id"
            :label="option.id"
            :value="option.id"
            class="option-checkbox"
          >
            <span class="option-name">{{ option.name }}</span>
            <span v-if="option.price_adjustment !== 0" class="option-price">
              {{ formatPriceAdjustment(option.price_adjustment) }}
            </span>
          </el-checkbox>
        </el-checkbox-group>

        <!-- 单选 -->
        <el-radio-group
          v-else
          :model-value="getSingleSelected(category.id)"
          @update:model-value="val => handleChange(category.id, val ? [val] : [])"
          class="option-group"
        >
          <el-radio
            v-for="option in category.options"
            :key="option.id"
            :value="option.id"
            class="option-radio"
          >
            <span class="option-name">{{ option.name }}</span>
            <span v-if="option.price_adjustment !== 0" class="option-price">
              {{ formatPriceAdjustment(option.price_adjustment) }}
            </span>
          </el-radio>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  optionCategories: {
    type: Array,
    default: () => []
  },
  selectedOptions: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['change'])

// 获取单选当前值
const getSingleSelected = (categoryId) => {
  const selected = props.selectedOptions[categoryId]
  return selected?.length > 0 ? selected[0] : null
}

// 处理选项变化
const handleChange = (categoryId, value) => {
  emit('change', categoryId, value)
}

// 格式化价格调整显示
const formatPriceAdjustment = (adjustment) => {
  if (adjustment === 0) return ''
  return adjustment > 0 ? `+${adjustment}` : `${adjustment}`
}
</script>

<style scoped>
.product-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border-radius: 10px;
  margin-top: 10px;
}

.option-category {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.tag {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.required-tag {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

.multiple-tag {
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.1);
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

:deep(.option-checkbox),
:deep(.option-radio) {
  margin-right: 0;
  padding: 6px 10px;
  background: #f5f5f7;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.option-checkbox:hover),
:deep(.option-radio:hover) {
  background: #e8e8ed;
}

:deep(.option-checkbox.is-checked),
:deep(.option-radio.is-checked) {
  background: rgba(59, 130, 246, 0.1);
}

.option-name {
  font-size: 12px;
  color: #1d1d1f;
}

.option-price {
  font-size: 11px;
  color: var(--color-danger);
  font-weight: 500;
  margin-left: 4px;
}
</style>
