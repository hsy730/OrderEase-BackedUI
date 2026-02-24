<template>
  <div class="current-order">
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="orderList"
        class="order-table"
        height="100%"
      >
        <el-table-column label="订单信息" min-width="200" fixed="left">
          <template #default="{ row }">
            <div class="order-info">
              <div class="order-id">{{ row.id }}</div>
              <div class="order-time">{{ formatTime(row.created_at) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <div class="order-amount">¥{{ row.total_price?.toFixed(2) || '0.00' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="订单状态" width="140" align="center">
          <template #default="{ row }">
            <span class="status-badge" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="160">
          <template #default="{ row }">
            <span class="text-secondary">{{ formatTime(row.updated_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <button class="op-btn view" @click="handleView(row)">查看</button>
              <button class="op-btn edit" @click="handleEdit(row)">编辑</button>
              <button class="op-btn delete" @click="handleDelete(row)">删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="860px"
      :close-on-click-modal="false"
      class="apple-dialog order-dialog"
      destroy-on-close
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ dialogTitle }}</h3>
          <button class="close-btn" @click="dialogVisible = false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </template>

      <order-form
        ref="orderFormRef"
        :form-data="formData"
        @submit="handleSubmit"
      />

      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="dialogVisible = false">取消</button>
          <button class="btn-confirm" @click="submitForm">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>确定</span>
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, deleteOrder, getOrderStatusFlow, getOrderDetail } from '@/api/order'
import { getCurrentShopId } from '@/api/shop'
import { getStatusText as getStatusTextUtil, getStatusType as getStatusTypeUtil } from '@/utils/orderStatus'
import OrderForm from '@/components/order/OrderForm.vue'

const router = useRouter()
const loading = ref(false)
const orderList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orderFormRef = ref(null)

const shopInfo = ref({})
const orderStatusFlow = ref([])

const getStatusText = (status) => {
  return getStatusTextUtil(status, shopInfo.value)
}

const getStatusType = (status) => {
  return getStatusTypeUtil(status, shopInfo.value)
}

const getStatusClass = (status) => {
  const type = getStatusType(status)
  return `status-${type}`
}

const fetchOrderStatusFlow = async () => {
  try {
    const shopId = getCurrentShopId()
    const data = await getOrderStatusFlow(shopId)
    if (data && data.order_status_flow) {
      shopInfo.value = data
      orderStatusFlow.value = data.order_status_flow?.statuses || []
    }
  } catch (error) {
    console.error('获取订单状态流转配置失败:', error)
  }
}

const fetchOrderList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      tag_id: router.currentRoute.value.query.tag_id
    }

    const response = await getOrderList(params)

    if (response.data) {
      orderList.value = response.data.map(order => {
        if (order.total_price === undefined) {
          const totalPrice = order.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity)
          }, 0)
          return {
            ...order,
            total_price: totalPrice
          }
        }
        return order
      })
    } else {
      orderList.value = []
    }

    total.value = response.total || 0
    currentPage.value = response.page || 1
    pageSize.value = response.pageSize || 10
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
    orderList.value = []
  } finally {
    loading.value = false
  }
}

const handleEdit = async (row) => {
  try {
    const fullOrderData = await getOrderDetail(row.id)
    dialogTitle.value = '编辑订单'
    formData.value = fullOrderData
    dialogVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

const handleView = (row) => {
  router.push(`/order/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该订单？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteOrder(row.id)
    ElMessage.success('删除成功')
    fetchOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

const submitForm = async () => {
  try {
    loading.value = true
    await orderFormRef.value.submit()
    await fetchOrderList()
    ElMessage.success('添加成功')
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  dialogVisible.value = false
  fetchOrderList()
}

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

onMounted(async () => {
  await fetchOrderStatusFlow()
  fetchOrderList()
  window.addEventListener('new-order-received', handleNewOrder)
})

onUnmounted(() => {
  window.removeEventListener('new-order-received', handleNewOrder)
})

const handleNewOrder = (event) => {
  fetchOrderList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchOrderList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrderList()
}

const handleRefresh = () => {
  fetchOrderList()
}
</script>

<style scoped>
.current-order {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.order-table {
  height: 100%;
}

.order-table :deep(.el-table) {
  border: none;
}

.order-table :deep(.el-table__border) {
  display: none;
}

.order-table :deep(.el-table th.el-table__cell) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.order-table :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.order-table :deep(.el-table tr:hover > td) {
  background: rgba(0, 0, 0, 0.02) !important;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  font-family: 'Monaco', 'Consolas', monospace;
}

.order-time {
  font-size: 12px;
  color: #86868b;
}

.order-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-danger);
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-primary {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.status-success {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-badge.status-warning {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.status-badge.status-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.status-info {
  background: rgba(0, 0, 0, 0.06);
  color: #86868b;
}

.text-secondary {
  color: #6e6e73;
  font-size: 13px;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.op-btn.view {
  color: #86868b;
}

.op-btn.view:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
}

.op-btn.edit {
  color: #3b82f6;
}

.op-btn.edit:hover {
  background: rgba(59, 130, 246, 0.1);
}

.op-btn.delete {
  color: #ef4444;
}

.op-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.01);
}

.order-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.order-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.order-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.order-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
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
