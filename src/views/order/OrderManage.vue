<template>
  <div class="order-manage">
    <div class="header">
      <h2>订单管理</h2>
      <el-button type="primary" @click="handleAdd">新增订单</el-button>
    </div>

    <el-table
      :data="orderList"
      style="width: 100%"
      v-loading="loading"
      border
      stripe
      size="small"
      :header-cell-style="{ background: '#f5f7fa' }"
    >
      <el-table-column label="订单金额" width="150" align="center">
        <template #default="{ row }">
          <span class="price">¥{{ row.total_price.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="商品数量" width="120" align="center">
        <template #default="{ row }">
          <span class="quantity">{{ row.items.length }}件</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="180" align="center">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="180" align="center">
        <template #default="{ row }">
          {{ formatTime(row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
    >
      <order-form
        ref="formRef"
        :form-data="formData"
        @submit="handleSubmit"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, deleteOrder } from '@/api/order'
import OrderForm from '@/components/order/OrderForm.vue'

const router = useRouter()
const loading = ref(false)
const orderList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const formRef = ref(null)

// 获取订单状态对应的文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'accepted': '已接单',
    'shipped': '已发货',
    'completed': '已完成',
    'rejected': '已拒绝',
    'canceled': '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态对应的类型
const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'accepted': 'primary',
    'shipped': 'info',
    'completed': 'success',
    'rejected': 'danger',
    'canceled': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    orderList.value = await getOrderList()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 新增订单
const handleAdd = () => {
  dialogTitle.value = '新增订单'
  formData.value = {}
  dialogVisible.value = true
}

// 编辑订单
const handleEdit = (row) => {
  dialogTitle.value = '编辑订单'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 查看订单详情
const handleView = (row) => {
  router.push(`/orders/${row.id}`)
}

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该订单吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      fetchOrderList()
    } catch (error) {
      console.error(error)
    }
  })
}

// 提交表单
const submitForm = () => {
  formRef.value?.submit()
}

// 表单提交成功
const handleSubmit = () => {
  dialogVisible.value = false
  fetchOrderList()
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '暂无'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.order-manage {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  margin: 24px;
  min-height: calc(100vh - 48px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.price {
  font-size: 15px;
  font-weight: 500;
  color: #f56c6c;
}

.quantity {
  font-size: 14px;
  color: #606266;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-button--primary.is-link) {
  color: #409eff;
}

:deep(.el-button--danger.is-link) {
  color: #f56c6c;
}

:deep(.el-tag--small) {
  height: 22px;
  padding: 0 8px;
  font-size: 12px;
}
</style> 