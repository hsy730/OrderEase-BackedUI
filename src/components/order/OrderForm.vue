<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="用户" prop="user_id">
      <UserSelect v-model="form.user_id" />
    </el-form-item>
    
    <el-form-item label="订单状态" prop="status">
      <el-select v-model="form.status" placeholder="请选择订单状态">
        <el-option 
          v-for="status in orderStatusOptions" 
          :key="status.value" 
          :label="status.label" 
          :value="status.value" 
        />
      </el-select>
    </el-form-item>

    <el-form-item label="订单商品" prop="items">
      <div class="order-items">
        <div v-for="(item, index) in form.items" :key="index" class="order-item">
          <el-select
            v-model="item.product_id"
            placeholder="选择商品"
            @change="handleProductChange($event, index)"
            style="width: 200px"
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
          
          <!-- 显示商品原价 -->
          <span class="original-price" v-if="item.selectedProduct && item.selectedProduct.price !== undefined">
            原价: ¥{{ item.selectedProduct.price.toFixed(2) }}
          </span>
          
          <!-- 商品选项参数选择 -->
          <div v-if="item.selectedProduct && item.selectedProduct.option_categories && item.selectedProduct.option_categories.length > 0" class="product-options">
            <div 
              v-for="(category, categoryIndex) in item.selectedProduct.option_categories" 
              :key="category.id" 
              class="option-category"
            >
              <div class="category-header">
                <span class="category-name">{{ category.name }}:</span>
                <span v-if="category.is_required" class="required-tag">(必选)</span>
                <span v-if="category.is_multiple" class="multiple-tag">(多选)</span>
              </div>
              
              <div class="options-container">
                <template v-if="category.is_multiple">
                  <!-- 多选 -->
                  <el-checkbox-group 
                    v-model="item.selectedOptions[category.id]" 
                    @change="calculateTotal"
                  >
                    <el-checkbox
                      v-for="option in category.options"
                      :key="option.id"
                      :label="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}
                      <span v-if="option.price_adjustment !== 0">
                        ({{ option.price_adjustment > 0 ? '+' : '' }}{{ option.price_adjustment }})
                      </span>
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
                <template v-else>
                  <!-- 单选 -->
                  <el-radio-group 
                    :model-value="item.selectedOptions[category.id] && item.selectedOptions[category.id].length > 0 ? item.selectedOptions[category.id][0] : null"
                    @update:model-value="val => {
                      item.selectedOptions[category.id] = val ? [val] : [];
                      calculateTotal();
                    }"
                  >
                    <el-radio
                      v-for="option in category.options"
                      :key="option.id"
                      :label="option.id"
                    >
                      {{ option.name }}
                      <span v-if="option.price_adjustment !== 0">
                        ({{ option.price_adjustment > 0 ? '+' : '' }}{{ option.price_adjustment }})
                      </span>
                    </el-radio>
                  </el-radio-group>
                </template>
              </div>
            </div>
          </div>
          
          <el-input-number
            v-model="item.quantity"
            :min="1"
            :precision="0"
            :step="1"
            style="width: 120px"
            @change="calculateTotal"
          />
          <span class="item-price" v-if="item.price">
            单价: ¥{{ calculateItemPrice(item).toFixed(2) }}
          </span>
          <span class="item-subtotal" v-if="item.price && item.quantity">
            小计: ¥{{ (calculateItemPrice(item) * item.quantity).toFixed(2) }}
          </span>
          <el-button type="danger" link @click="removeItem(index)">
            删除
          </el-button>
        </div>
        <el-button type="primary" link @click="addItem">
          添加商品
        </el-button>
      </div>
    </el-form-item>

    <el-form-item label="订单总额">
      <span class="total-amount">¥{{ calculateTotalAmount() }}</span>
    </el-form-item>

    <el-form-item label="订单备注" prop="remark">
      <el-input
        v-model="form.remark"
        type="textarea"
        rows="3"
        placeholder="请输入订单备注"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createOrder, updateOrder, getOrderStatusFlow } from '@/api/order'
import { getProductList } from '@/api/product'
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
  status: 1, // 使用数字值，默认待处理
  items: [],
  remark: '',
  total_price: 0
})

// 添加加载状态和搜索相关变量
const productLoading = ref({})
const searchProductList = ref([]) // 用于存储搜索结果的商品列表

// 获取订单状态流转配置
const fetchOrderStatusFlow = async () => {
  try {
    // 注意：这里需要获取shop_id，暂时使用固定值或从props中获取
    // 由于OrderForm可能在创建订单时使用，此时还没有shop_id，所以暂时使用null
    // 实际项目中应该根据当前用户权限获取对应的shop_id
    const shopId = null;
    const data = await getOrderStatusFlow(shopId)
    orderStatusFlow.value = data.order_status_flow
  } catch (error) {
    console.error('获取订单状态流转配置失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
}

// 订单状态选项
const orderStatusOptions = computed(() => {
  if (!orderStatusFlow.value) {
    // 默认状态选项（与OrderManage.vue保持一致）
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
  selectedProduct: null, // 添加选中的商品信息
  selectedOptions: {} // 添加选中的选项
})

// 添加商品项
const addItem = () => {
  form.value.items.push(initOrderItem())
  // 初始化新添加项的加载状态
  const newIndex = form.value.items.length - 1
  productLoading.value[newIndex] = false
}

// 移除商品项
const removeItem = (index) => {
  form.value.items.splice(index, 1)
  calculateTotal()
  // 清理对应的加载状态
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
    // 保存选中的商品信息
    form.value.items[index].selectedProduct = product
    form.value.items[index].price = product.price
    
    // 初始化选项选择
    form.value.items[index].selectedOptions = {}
    
    // 如果商品有选项参数，设置默认选项
    if (product.option_categories && product.option_categories.length > 0) {
      product.option_categories.forEach(category => {
        // 设置默认选项
        const defaultOptions = category.options.filter(option => option.is_default)
        
        if (category.is_multiple) {
          // 多选：可以选择多个默认选项
          form.value.items[index].selectedOptions[category.id] = defaultOptions.map(option => option.id)
        } else {
          // 单选：也使用数组格式，只包含一个元素
          if (defaultOptions.length > 0) {
            form.value.items[index].selectedOptions[category.id] = [defaultOptions[0].id]
          } else {
            // 如果没有默认选项，选择第一个选项
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
  
  // 如果有选中的选项，计算价格调整
  if (item.selectedProduct && item.selectedProduct.option_categories && item.selectedOptions) {
    item.selectedProduct.option_categories.forEach(category => {
      const selectedOptionIds = item.selectedOptions[category.id]
      
      if (selectedOptionIds && Array.isArray(selectedOptionIds)) {
        // 统一处理：无论是单选还是多选，都遍历数组
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
    console.log('商品列表数据:', response)
    productList.value = response.data || []
    searchProductList.value = [...productList.value] // 保存原始商品列表
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    productList.value = []
  }
}

// 远程搜索商品
const remoteSearchProduct = async (query, index) => {
  // 设置当前索引的加载状态
  productLoading.value[index] = true
  
  try {
    // 如果查询为空，使用原始商品列表
    if (query.trim() === '') {
      productList.value = [...searchProductList.value]
      productLoading.value[index] = false
      return
    }
    
    // 调用API搜索商品
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
    // 确保商品列表和状态流已加载
    if (productList.value.length === 0) {
      await fetchProductList();
    }
    if (!orderStatusFlow.value) {
      await fetchOrderStatusFlow();
    }
    
    // 处理订单项
    const processedItems = [];
    if (newVal.items) {
      for (const item of newVal.items) {
        // 初始化商品项
        const orderItem = {
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          selectedProduct: item.selectedProduct || null,
          selectedOptions: {}
        };
        
        // 如果有商品ID但没有selectedProduct，需要获取商品信息
        if (item.product_id && !item.selectedProduct) {
          // 从已有的商品列表中查找
          const product = productList.value.find(p => p.id === item.product_id);
          if (product) {
            orderItem.selectedProduct = product;
            orderItem.price = product.price;
          }
        }
        
        // 使用订单详情接口返回的选项数据
        if (item.options && Array.isArray(item.options)) {
          // 按category_id分组选项
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
      status: newVal.status || 1, // 默认待处理
      items: processedItems
    };
  } else {
    form.value = {
      user_id: null,
      status: 1, // 默认待处理
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
    // 准备提交数据，包含选项信息
    const submitData = {
      ...form.value,
      items: form.value.items.map(item => {
        // 格式化选项数据，使用订单详情接口返回的格式
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
          // 使用格式化后的选项数据
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
          // 检查每个商品是否都选择了商品和数量
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
.order-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.item-price,
.item-subtotal,
.original-price {
  min-width: 100px;
  color: #606266;
}

.total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.item-price,
.item-subtotal,
.original-price {
  min-width: 100px;
  color: #606266;
}

.total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

/* 商品选项样式 */
.product-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  width: 100%;
}

.option-category {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 5px;
}

.category-name {
  font-weight: bold;
  color: #606266;
}

.required-tag {
  color: #f56c6c;
  font-size: 12px;
}

.multiple-tag {
  color: #409eff;
  font-size: 12px;
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-checkbox-group),
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-checkbox),
:deep(.el-radio) {
  margin-right: 0;
}
</style>