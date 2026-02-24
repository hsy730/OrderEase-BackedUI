<template>
  <div class="order-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- 基本信息 -->
      <section class="form-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><User /></el-icon>
            <span>基本信息</span>
          </div>
        </div>
        <div class="section-content">
          <div class="form-row">
            <el-form-item label="选择用户" prop="user_id" class="form-item-half">
              <UserSelect v-model="form.user_id" />
            </el-form-item>
            <el-form-item label="订单状态" prop="status" class="form-item-half">
              <el-select v-model="form.status" placeholder="请选择订单状态" class="status-select">
                <el-option
                  v-for="status in orderStatusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>
      </section>

      <!-- 商品清单 -->
      <section class="form-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><ShoppingCart /></el-icon>
            <span>商品清单</span>
          </div>
          <span class="item-count">{{ form.items?.length || 0 }} 件商品</span>
        </div>
        <div class="section-content">
          <div class="order-items">
            <OrderItem
              v-for="(item, index) in form.items"
              :key="index"
              :item="item"
              :index="index"
              :product-list="productList"
              :loading="productLoading[index]"
              :unit-price="getItemUnitPrice(item)"
              :subtotal="getItemSubtotal(item)"
              @remove="removeItem(index)"
              @product-change="(val) => handleProductChange(val, index).then(calculateTotal)"
              @search-product="(query) => remoteSearchProduct(query, index)"
              @update:quantity="calculateTotal"
              @option-change="(categoryId, val) => handleOptionChange(index, categoryId, val)"
            />
            <button type="button" class="add-item-btn" @click="addItem">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>添加商品</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 订单汇总 -->
      <OrderSummary :total-amount="totalAmount" />

      <!-- 订单备注 -->
      <section class="form-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><EditPen /></el-icon>
            <span>订单备注</span>
          </div>
        </div>
        <div class="section-content">
          <el-form-item prop="remark" class="remark-item">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入订单备注信息..."
              class="remark-input"
            />
          </el-form-item>
        </div>
      </section>
    </el-form>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, ShoppingCart, EditPen } from '@element-plus/icons-vue'
import { createOrder, updateOrder } from '@/api/order'
import UserSelect from '@/components/UserSelect.vue'
import OrderItem from './OrderItem.vue'
import OrderSummary from './OrderSummary.vue'
import { useOrderForm } from './composables/useOrderForm'
import { usePriceCalc } from './composables/usePriceCalc'

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

// 使用组合式函数
const {
  formRef,
  form,
  productList,
  orderStatusFlow,
  productLoading,
  addItem,
  removeItem,
  fetchProductList,
  fetchOrderStatusFlow,
  remoteSearchProduct,
  handleProductChange
} = useOrderForm(props, emit)

const { totalAmount, calculateTotal, getItemUnitPrice, getItemSubtotal } = usePriceCalc(form)

// 订单状态选项
const orderStatusOptions = computed(() => {
  if (!orderStatusFlow.value) {
    return [
      { label: '待处理', value: 1 },
      { label: '已接单', value: 2 },
      { label: '已备货', value: 3 },
      { label: '已发货', value: 4 },
      { label: '已完成', value: 10 },
      { label: '已取消', value: -1 }
    ]
  }
  return orderStatusFlow.value.statuses.map(status => ({
    label: status.label,
    value: status.value
  }))
})

// 处理选项变化
const handleOptionChange = (index, categoryId, value) => {
  form.value.items[index].selectedOptions[categoryId] = value
  calculateTotal()
}

// 表单验证规则
const rules = {
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  status: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
  items: [{
    required: true,
    trigger: 'change',
    validator: (rule, value, callback) => {
      if (!value?.length) {
        callback(new Error('请至少添加一个商品'))
      } else if (value.some(item => !item.product_id || !item.quantity)) {
        callback(new Error('请完善商品信息'))
      } else {
        callback()
      }
    }
  }]
}

// 提交表单
const submit = async () => {
  await formRef.value?.validate()
  try {
    const submitData = {
      ...form.value,
      items: form.value.items.map(item => {
        const formattedOptions = []
        Object.entries(item.selectedOptions || {}).forEach(([categoryId, options]) => {
          if (Array.isArray(options)) {
            options.forEach(optionId => {
              formattedOptions.push({ category_id: categoryId, option_id: optionId })
            })
          }
        })
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(getItemUnitPrice(item)),
          options: formattedOptions
        }
      })
    }

    if (form.value.id) {
      await updateOrder(form.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createOrder(submitData)
      ElMessage.success('创建成功')
    }
    emit('submit')
  } catch (error) {
    console.error('保存订单失败:', error)
  }
}

defineExpose({ submit })

onMounted(() => {
  fetchProductList()
  fetchOrderStatusFlow()
})
</script>

<style scoped>
.order-form {
  padding: 0;
}

.form-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.2px;
}

.section-title .el-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.section-content {
  padding: 16px 20px;
}

.item-count {
  font-size: 12px;
  color: #86868b;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 10px;
  border-radius: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  padding-bottom: 6px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  background: #ffffff;
}

:deep(.el-input__inner) {
  height: 36px;
  line-height: 36px;
}

:deep(.el-input__inner::placeholder) {
  color: #86868b;
}

.status-select {
  width: 100%;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: rgba(59, 130, 246, 0.06);
  border: 2px dashed rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-item-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
}

.remark-item {
  margin-bottom: 0;
}

.remark-input :deep(.el-textarea__inner) {
  border-radius: 10px;
  resize: none;
}

@media screen and (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
