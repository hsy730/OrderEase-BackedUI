<template>
  <div class="current-order">
    <!-- 订单列表 -->
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
            <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="160">
          <template #default="{ row }">
            <span class="text-secondary">{{ formatTime(row.updated_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="info" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确认删除该订单？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
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

    <!-- 新增/编辑订单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <order-form
        ref="orderFormRef"
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
import '@/assets/table-global.css'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
    // 获取完整的订单详情，包含商品的 option_categories 等完整信息
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
    await deleteOrder(row.id)
    ElMessage.success('删除成功')
    fetchOrderList()
  } catch (error) {
    console.error(error)
    // 使用后端返回的具体错误信息
    ElMessage.error(error.response?.data?.error || '删除失败')
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

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Consolas', monospace;
}

.order-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.order-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-danger);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-primary);
}

.text-secondary {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

:deep(.el-table) {
  border: none;
}

:deep(.el-table__border) {
  display: none;
}

:deep(.el-table th.el-table__cell) {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid var(--color-border-light);
}

:deep(.el-table tr:hover > td) {
  background: var(--color-bg-secondary) !important;
}

:deep(.el-table__empty-block) {
  min-height: 200px;
}
</style>
