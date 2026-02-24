<template>
  <div class="order-item-card">
    <div class="item-header">
      <span class="item-number">商品 {{ index + 1 }}</span>
      <button type="button" class="remove-btn" @click="$emit('remove')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="item-content">
      <div class="item-row">
        <el-select
          :model-value="item.product_id"
          @update:model-value="val => $emit('product-change', val)"
          placeholder="选择商品"
          class="product-select"
          filterable
          remote
          :remote-method="(query) => $emit('search-product', query)"
          :loading="loading"
          clearable
        >
          <el-option
            v-for="product in productList"
            :key="product.id"
            :label="product.name"
            :value="product.id"
          />
        </el-select>

        <el-input-number
          :model-value="item.quantity"
          @update:model-value="val => $emit('update:quantity', val)"
          :min="1"
          :precision="0"
          :step="1"
          class="quantity-input"
        />
      </div>

      <!-- 价格信息 -->
      <div class="price-info" v-if="showPriceInfo">
        <span class="original-price">原价: ¥{{ originalPrice }}</span>
        <span class="item-unit-price" v-if="unitPrice">单价: ¥{{ unitPrice }}</span>
        <span class="item-subtotal" v-if="subtotal">小计: ¥{{ subtotal }}</span>
      </div>

      <!-- 商品选项 -->
      <ProductOptions
        v-if="hasOptions"
        :option-categories="item.selectedProduct.option_categories"
        :selected-options="item.selectedOptions"
        @change="handleOptionChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductOptions from './ProductOptions.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  productList: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  unitPrice: String,
  subtotal: String
})

const emit = defineEmits(['remove', 'product-change', 'search-product', 'update:quantity', 'option-change'])

// 是否显示价格信息
const showPriceInfo = computed(() => {
  return props.item.selectedProduct && props.item.selectedProduct.price !== undefined
})

// 原价
const originalPrice = computed(() => {
  return props.item.selectedProduct?.price?.toFixed(2) || '0.00'
})

// 是否有选项
const hasOptions = computed(() => {
  return props.item.selectedProduct?.option_categories?.length > 0
})

// 处理选项变化
const handleOptionChange = (categoryId, value) => {
  emit('option-change', categoryId, value)
}
</script>

<style scoped>
.order-item-card {
  background: #fafafa;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.order-item-card:hover {
  background: #f5f5f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.item-number {
  font-size: 12px;
  font-weight: 600;
  color: #1d1d1f;
}

.remove-btn {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.item-content {
  padding: 14px;
}

.item-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.product-select {
  flex: 1;
}

.quantity-input {
  width: 110px;
}

:deep(.quantity-input .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 8px;
}

.price-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.04);
  border-radius: 8px;
  margin-bottom: 10px;
}

.original-price,
.item-unit-price {
  font-size: 12px;
  color: #86868b;
}

.item-subtotal {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-danger);
}

@media screen and (max-width: 768px) {
  .item-row {
    flex-direction: column;
    align-items: stretch;
  }

  .quantity-input {
    width: 100%;
  }

  .price-info {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
