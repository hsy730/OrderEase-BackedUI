<template>
  <div class="order-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <!-- 基本信息卡片 -->
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
              <el-select 
                v-model="form.status" 
                placeholder="请选择订单状态"
                class="status-select"
              >
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

      <!-- 商品清单卡片 -->
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
            <div 
              v-for="(item, index) in form.items" 
              :key="index" 
              class="order-item-card"
            >
              <div class="item-header">
                <span class="item-number">商品 {{ index + 1 }}</span>
                <button type="button" class="remove-btn" @click="removeItem(index)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="item-content">
                <div class="item-row">
                  <el-select
                    v-model="item.product_id"
                    placeholder="选择商品"
                    @change="handleProductChange($event, index)"
                    class="product-select"
                    filterable
                    remote
                    :remote-method="(query) => remoteSearchProduct(query, index)"
                    :loading="productLoading[index]"
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
                    v-model="item.quantity"
                    :min="1"
                    :precision="0"
                    :step="1"
                    class="quantity-input"
                    @change="calculateTotal"
                  />
                </div>

                <div class="price-info" v-if="item.selectedProduct && item.selectedProduct.price !== undefined">
                  <span class="original-price">
                    原价: ¥{{ item.selectedProduct.price.toFixed(2) }}
                  </span>
                  <span class="item-unit-price" v-if="item.price">
                    单价: ¥{{ calculateItemPrice(item).toFixed(2) }}
                  </span>
                  <span class="item-subtotal" v-if="item.price && item.quantity">
                    小计: ¥{{ (calculateItemPrice(item) * item.quantity).toFixed(2) }}
                  </span>
                </div>
                
                <div v-if="item.selectedProduct && item.selectedProduct.option_categories && item.selectedProduct.option_categories.length > 0" class="product-options">
                  <div 
                    v-for="(category, categoryIndex) in item.selectedProduct.option_categories" 
                    :key="category.id" 
                    class="option-category"
                  >
                    <div class="category-header">
                      <span class="category-name">{{ category.name }}</span>
                      <span v-if="category.is_required" class="tag required-tag">必选</span>
                      <span v-if="category.is_multiple" class="tag multiple-tag">多选</span>
                    </div>
                    
                    <div class="options-container">
                      <template v-if="category.is_multiple">
                        <el-checkbox-group 
                          v-model="item.selectedOptions[category.id]" 
                          @change="calculateTotal"
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
                              {{ option.price_adjustment > 0 ? '+' : '' }}{{ option.price_adjustment }}
                            </span>
                          </el-checkbox>
                        </el-checkbox-group>
                      </template>
                      <template v-else>
                        <el-radio-group 
                          :model-value="item.selectedOptions[category.id] && item.selectedOptions[category.id].length > 0 ? item.selectedOptions[category.id][0] : null"
                          @update:model-value="val => {
                            item.selectedOptions[category.id] = val ? [val] : [];
                            calculateTotal();
                          }"
                          class="option-group"
                        >
                          <el-radio
                            v-for="option in category.options"
                            :key="option.id"
                            :label="option.id"
                            class="option-radio"
                          >
                            <span class="option-name">{{ option.name }}</span>
                            <span v-if="option.price_adjustment !== 0" class="option-price">
                              {{ option.price_adjustment > 0 ? '+' : '' }}{{ option.price_adjustment }}
                            </span>
                          </el-radio>
                        </el-radio-group>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
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

      <!-- 订单汇总卡片 -->
      <section class="form-section summary-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Money /></el-icon>
            <span>订单汇总</span>
          </div>
        </div>

        <div class="section-content">
          <div class="summary-row">
            <span class="summary-label">订单总额</span>
            <span class="total-amount">¥{{ calculateTotalAmount() }}</span>
          </div>
        </div>
      </section>

      <!-- 备注卡片 -->
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
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, ShoppingCart, Money, EditPen } from '@element-plus/icons-vue'
import { createOrder, updateOrder, getOrderStatusFlow } from '@/api/order'
import { getProductList, getProductDetail } from '@/api/product'
import UserSelect from '@/components/UserSelect.vue'

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const productList = ref([])
const orderStatusFlow = ref(null)
const form = ref({
  user_id: null,
  status: 1,
  items: [],
  remark: '',
  total_price: 0
})

// 添加加载状态和搜索相关变量
const productLoading = ref({})
const searchProductList = ref([])

// 获取订单状态流转配置
const fetchOrderStatusFlow = async () => {
  try {
    const shopId = null;
    const data = await getOrderStatusFlow(shopId)
    orderStatusFlow.value = data.order_status_flow
  } catch (error) {
    console.error('获取订单状态流转配置失败:', error)
  }
}

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

// 初始化一个新的商品项
const initOrderItem = () => ({
  product_id: '',
  quantity: 1,
  price: 0,
  selectedProduct: null,
  selectedOptions: {}
})

// 添加商品项
const addItem = () => {
  form.value.items.push(initOrderItem())
  const newIndex = form.value.items.length - 1
  productLoading.value[newIndex] = false
}

// 移除商品项
const removeItem = (index) => {
  form.value.items.splice(index, 1)
  calculateTotal()
  const newLoadingState = {}
  Object.keys(productLoading.value).forEach(key => {
    const numKey = parseInt(key)
    if (numKey < index) {
      newLoadingState[key] = productLoading.value[key]
    } else if (numKey > index) {
      newLoadingState[numKey - 1] = productLoading.value[key]
    }
  })
  productLoading.value = newLoadingState
}

// 商品选择变化
const handleProductChange = async (productId, index) => {
  const product = productList.value.find(p => p.id === productId)
  if (product) {
    form.value.items[index].selectedProduct = product
    form.value.items[index].price = product.price
    form.value.items[index].selectedOptions = {}
    
    if (product.option_categories && product.option_categories.length > 0) {
      product.option_categories.forEach(category => {
        const defaultOptions = category.options.filter(option => option.is_default)
        
        if (category.is_multiple) {
          form.value.items[index].selectedOptions[category.id] = defaultOptions.map(option => option.id)
        } else {
          if (defaultOptions.length > 0) {
            form.value.items[index].selectedOptions[category.id] = [defaultOptions[0].id]
          } else {
            form.value.items[index].selectedOptions[category.id] = category.options.length > 0 ? [category.options[0].id] : []
          }
        }
      })
    }
    
    calculateTotal()
  }
}

// 计算单项商品价格（包含选项价格调整）
const calculateItemPrice = (item) => {
  let price = item.price || 0
  
  if (item.selectedProduct && item.selectedProduct.option_categories && item.selectedOptions) {
    item.selectedProduct.option_categories.forEach(category => {
      const selectedOptionIds = item.selectedOptions[category.id]
      
      if (selectedOptionIds && Array.isArray(selectedOptionIds)) {
        selectedOptionIds.forEach(optionId => {
          const option = category.options.find(opt => opt.id === optionId)
          if (option) {
            price += option.price_adjustment || 0
          }
        })
      }
    })
  }
  
  return price
}

// 计算总金额
const calculateTotal = () => {
  form.value.total_price = calculateTotalAmount()
}

// 计算总金额的具体方法
const calculateTotalAmount = () => {
  return form.value.items.reduce((total, item) => {
    return total + (calculateItemPrice(item) * (item.quantity || 0))
  }, 0).toFixed(2)
}

// 获取商品列表
const fetchProductList = async () => {
  try {
    const response = await getProductList({ page: 1, pageSize: 100 })
    productList.value = response.data || []
    searchProductList.value = [...productList.value]
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    productList.value = []
  }
}

// 远程搜索商品
const remoteSearchProduct = async (query, index) => {
  productLoading.value[index] = true
  
  try {
    if (query.trim() === '') {
      productList.value = [...searchProductList.value]
      productLoading.value[index] = false
      return
    }
    
    const response = await getProductList({ page: 1, pageSize: 20, search: query })
    productList.value = response.data || []
  } catch (error) {
    console.error('搜索商品失败:', error)
    ElMessage.error('搜索商品失败')
  } finally {
    productLoading.value[index] = false
  }
}

// 监听表单数据变化
watch(() => props.formData, async (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    if (productList.value.length === 0) {
      await fetchProductList();
    }
    if (!orderStatusFlow.value) {
      await fetchOrderStatusFlow();
    }

    const processedItems = [];
    if (newVal.items) {
      for (const item of newVal.items) {
        const orderItem = {
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          selectedProduct: item.selectedProduct || null,
          selectedOptions: {}
        };

        if (item.product_id && !item.selectedProduct) {
          let product = productList.value.find(p => p.id === item.product_id);
          if (!product) {
            try {
              product = await getProductDetail(item.product_id);
              if (product && !productList.value.find(p => p.id === product.id)) {
                productList.value.push(product);
              }
            } catch (error) {
              console.error(`获取商品 ${item.product_id} 详情失败:`, error);
            }
          }
          if (product) {
            orderItem.selectedProduct = product;
            orderItem.price = product.price;
          }
        }

        if (item.options && Array.isArray(item.options)) {
          const groupedOptions = {};
          item.options.forEach(option => {
            if (!groupedOptions[option.category_id]) {
              groupedOptions[option.category_id] = [];
            }
            groupedOptions[option.category_id].push(option.option_id);
          });
          orderItem.selectedOptions = groupedOptions;
        }

        processedItems.push(orderItem);
      }
    }

    form.value = {
      ...newVal,
      user_id: newVal.user_id || null,
      status: newVal.status || 1,
      items: processedItems
    };
  } else {
    form.value = {
      user_id: null,
      status: 1,
      items: [],
      remark: '',
      total_price: 0
    };
  }
}, { deep: true, immediate: true });

// 提交表单
const submit = async () => {
  await formRef.value?.validate()
  try {
    const submitData = {
      ...form.value,
      items: form.value.items.map(item => {
        const formattedOptions = [];
        if (item.selectedOptions && typeof item.selectedOptions === 'object') {
          Object.keys(item.selectedOptions).forEach(categoryId => {
            const options = item.selectedOptions[categoryId];
            if (Array.isArray(options)) {
              options.forEach(optionId => {
                formattedOptions.push({
                  category_id: categoryId,
                  option_id: optionId
                });
              });
            }
          });
        }
        
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: calculateItemPrice(item),
          options: formattedOptions
        };
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

defineExpose({
  submit
})

onMounted(async () => {
  await fetchProductList()
  await fetchOrderStatusFlow()
})

const rules = {
  user_id: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  items: [
    { 
      required: true, 
      message: '请至少添加一个商品', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个商品'))
        } else {
          const invalidItem = value.find(item => !item.product_id || !item.quantity)
          if (invalidItem) {
            callback(new Error('请完善商品信息'))
          } else {
            callback()
          }
        }
      }
    }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}
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

.summary-section {
  background: linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.total-amount {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-danger);
  letter-spacing: -0.5px;
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
