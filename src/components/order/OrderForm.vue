<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="客户名称" prop="customerName">
      <el-input v-model="form.customerName" placeholder="请输入客户名称" />
    </el-form-item>
    
    <el-form-item label="订单状态" prop="status">
      <el-select v-model="form.status" placeholder="请选择订单状态">
        <el-option label="待处理" value="pending" />
        <el-option label="处理中" value="processing" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
    </el-form-item>

    <el-form-item label="订单商品">
      <div class="order-items">
        <div v-for="(item, index) in form.items" :key="index" class="order-item">
          <el-select
            v-model="item.product_id"
            placeholder="选择商品"
            @change="handleProductChange($event, index)"
            style="width: 200px"
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
            style="width: 120px"
            @change="calculateTotal"
          />
          <span class="item-price" v-if="item.price">
            单价: ¥{{ item.price }}
          </span>
          <span class="item-subtotal" v-if="item.price && item.quantity">
            小计: ¥{{ (item.price * item.quantity).toFixed(2) }}
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
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createOrder, updateOrder } from '@/api/order'
import { getProductList } from '@/api/product'

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const productList = ref([])
const form = ref({
  customerName: '',
  status: 'pending',
  items: [],
  remark: '',
  total_price: 0
})

// 初始化一个新的商品项
const initOrderItem = () => ({
  product_id: '',
  quantity: 1,
  price: 0
})

// 添加商品项
const addItem = () => {
  form.value.items.push(initOrderItem())
}

// 移除商品项
const removeItem = (index) => {
  form.value.items.splice(index, 1)
  calculateTotal()
}

// 获取商品列表
const fetchProductList = async () => {
  try {
    const response = await getProductList({ page: 1, pageSize: 100 })
    console.log('商品列表数据:', response)
    productList.value = response.data || []
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    productList.value = []
  }
}

// 商品选择变化
const handleProductChange = (productId, index) => {
  const product = productList.value.find(p => p.id === productId)
  if (product) {
    form.value.items[index].price = product.price
    calculateTotal()
  }
}

// 计算总金额
const calculateTotal = () => {
  form.value.total_price = calculateTotalAmount()
}

// 计算总金额的具体方法
const calculateTotalAmount = () => {
  return form.value.items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 0))
  }, 0).toFixed(2)
}

// 监听表单数据变化
watch(() => props.formData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    form.value = {
      ...newVal,
      items: newVal.items?.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity || 1,
        price: item.price || 0
      })) || []
    }
  } else {
    form.value = {
      customerName: '',
      status: 'pending',
      items: [],
      remark: '',
      total_price: 0
    }
  }
}, { deep: true, immediate: true })

// 提交表单
const submit = async () => {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      await updateOrder(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createOrder(form.value)
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

onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
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
.item-subtotal {
  min-width: 100px;
  color: #606266;
}

.total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}
</style> 