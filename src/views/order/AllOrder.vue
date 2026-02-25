<template>
  <div class="all-order">
    <!-- 搜索区域 -->
    <div class="search-section" v-if="showSearch">
      <div class="search-form">
        <div class="form-item">
          <label>用户</label>
          <UserSelect
            v-model="searchParams.user_id"
            placeholder="请选择用户"
            style="width: 160px;"
          />
        </div>
        <div class="form-item">
          <label>订单状态</label>
          <el-select
            v-model="searchParams.status"
            placeholder="请选择订单状态"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 160px;"
            :loading="loadingStatusFlow"
          >
            <el-option
              v-for="status in orderStatusFlow"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <label>创建时间</label>
          <el-date-picker
            v-model="searchParams.create_time_range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 280px;"
            format="YYYY-MM-DD HH:mm:ss"
            shortcuts-remove-other-values
            unlink-panels
            :shortcuts="dateShortcuts"
          />
        </div>
        <div class="form-actions">
          <button class="search-btn" @click="handleSearch">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>查询</span>
          </button>
          <button class="reset-btn" @click="handleReset">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            <span>重置</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 使用 DataTable 组件 -->
    <DataTable
      :data="orderList"
      :loading="loading"
      :total="total"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :show-header="false"
      :show-operation="true"
      operation-width="180"
      class="order-table-wrapper"
      @size-change="fetchOrderList"
      @current-change="fetchOrderList"
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

      <template #operation="{ row }">
        <div class="operation-buttons">
          <button class="op-btn view" @click="handleView(row)">查看</button>
          <button class="op-btn edit" @click="handleEdit(row)">编辑</button>
          <button class="op-btn delete" @click="handleDelete(row)">删除</button>
        </div>
      </template>
    </DataTable>

    <!-- 使用 AppDialog 组件 -->
    <AppDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="860px"
      :confirm-loading="submitting"
      @confirm="submitForm"
    >
      <order-form
        ref="orderFormRef"
        :form-data="formData"
        @submit="handleSubmit"
      />
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, deleteOrder, advanceSearchOrderList, getOrderStatusFlow, getOrderDetail } from '@/api/order'
import { getCurrentShopId } from '@/api/shop'
import { getStatusText as getStatusTextUtil, getStatusType as getStatusTypeUtil } from '@/utils/orderStatus'
import { formatTime } from '@/utils/date'
import { getDateShortcuts } from '@/utils/date'
import OrderForm from '@/components/order/OrderForm.vue'
import UserSelect from '@/components/UserSelect.vue'
import DataTable from '@/components/common/DataTable.vue'
import AppDialog from '@/components/common/AppDialog.vue'
import { useNotificationStore } from '@/stores'

const router = useRouter()
const notificationStore = useNotificationStore()
const loading = ref(false)
const submitting = ref(false)
const orderList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orderFormRef = ref(null)
const showSearch = ref(true)

const searchParams = reactive({
  user_id: null,
  status: [],
  create_time_range: []
})

const shopInfo = ref({})
const orderStatusFlow = ref([])
const loadingStatusFlow = ref(false)

// 使用工具函数获取日期快捷选项
const dateShortcuts = getDateShortcuts()

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
    loadingStatusFlow.value = true
    const shopId = getCurrentShopId()
    const data = await getOrderStatusFlow(shopId)
    if (data && data.order_status_flow) {
      shopInfo.value = data

      orderStatusFlow.value = data.order_status_flow?.statuses || []
    }
  } catch (error) {
    console.error('获取订单状态流转配置失败:', error)
  } finally {
    loadingStatusFlow.value = false
  }
}

const fetchOrderList = async () => {
  loading.value = true
  try {
    let startTime = null
    let endTime = null
    if (searchParams.create_time_range && searchParams.create_time_range.length === 2) {
      startTime = searchParams.create_time_range[0]
      endTime = searchParams.create_time_range[1]
    }

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      tag_id: router.currentRoute.value.query.tag_id,
      user_id: searchParams.user_id,
      status: searchParams.status.length > 0 ? searchParams.status.map(s => Number(s)) : null,
      start_time: startTime,
      end_time: endTime
    }

    const response = await advanceSearchOrderList(params)

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
    submitting.value = true
    await orderFormRef.value.submit()
    await fetchOrderList()
    ElMessage.success('操作成功')
  } finally {
    submitting.value = false
  }
}

const handleSubmit = () => {
  dialogVisible.value = false
  fetchOrderList()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchOrderList()
}

const handleReset = () => {
  searchParams.user_id = null
  searchParams.status = []
  searchParams.create_time_range = []
  currentPage.value = 1
  fetchOrderList()
}

// 监听 Pinia Store 中的新订单通知
const unwatchNewOrder = watch(() => notificationStore.newOrder, (order) => {
  if (order) {
    fetchOrderList()
    notificationStore.closeNotification()
  }
})

onMounted(async () => {
  await fetchOrderStatusFlow()
  fetchOrderList()
})

onUnmounted(() => {
  if (unwatchNewOrder) {
    unwatchNewOrder()
  }
})
</script>

<style scoped>
.all-order {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-section {
  background: rgba(0, 0, 0, 0.01);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 20px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 36px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 8px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.order-table-wrapper {
  flex: 1;
  border-radius: 0;
  box-shadow: none;
  border: none;
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

.op-btn.edit.edit {
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

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .form-item {
    width: 100%;
  }

  .form-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
