<template>
  <div class="all-order">
    <!-- 搜索筛选区 -->
    <div class="search-section" v-if="showSearch">
      <div class="search-form">
        <el-form :model="searchParams" inline>
          <el-form-item label="用户">
            <UserSelect
              v-model="searchParams.user_id"
              placeholder="请选择用户"
              style="width: 160px;"
            />
          </el-form-item>
          <el-form-item label="订单状态">
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
          </el-form-item>
          <el-form-item label="创建时间">
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
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              查询
            </el-button>
            <el-button :icon="RefreshRight" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

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

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link :icon="View" @click="handleView(row)">
                查看
              </el-button>
              <el-button type="warning" link :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-popconfirm
                title="确认删除该订单？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button type="danger" link :icon="Delete">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
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
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight, View, Edit, Delete } from '@element-plus/icons-vue'
import { getOrderList, deleteOrder, advanceSearchOrderList, getOrderStatusFlow, getOrderDetail } from '@/api/order'
import { getCurrentShopId } from '@/api/shop'
import { getStatusText as getStatusTextUtil, getStatusType as getStatusTypeUtil } from '@/utils/orderStatus'
import OrderForm from '@/components/order/OrderForm.vue'
import UserSelect from '@/components/UserSelect.vue'

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
const showSearch = ref(true)

const searchParams = reactive({
  user_id: null,
  status: [],
  create_time_range: []
})

// 店铺信息和订单状态流转配置
const shopInfo = ref({})
const orderStatusFlow = ref([])
const loadingStatusFlow = ref(false)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 获取订单状态对应的文本
const getStatusText = (status) => {
  return getStatusTextUtil(status, shopInfo.value)
}

// 获取订单状态对应的类型
const getStatusType = (status) => {
  return getStatusTypeUtil(status, shopInfo.value)
}

// 获取店铺订单状态流转配置
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

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    // 处理时间范围参数
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

// 编辑订单 - 需要获取完整的订单详情（包含商品完整信息）
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

// 查看订单详情
const handleView = (row) => {
  router.push(`/order/${row.id}`)
}

// 删除订单
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

// 提交表单
const submitForm = async () => {
  try {
    loading.value = true
    await orderFormRef.value.submit()
    await fetchOrderList()
    ElMessage.success('操作成功')
  } finally {
    loading.value = false
  }
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

// 查询按钮点击事件
const handleSearch = () => {
  currentPage.value = 1
  fetchOrderList()
}

// 重置按钮点击事件
const handleReset = () => {
  searchParams.user_id = null
  searchParams.status = []
  searchParams.create_time_range = []
  currentPage.value = 1
  fetchOrderList()
}

// 处理每页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchOrderList()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrderList()
}

const handleRefresh = () => {
  fetchOrderList()
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
</script>

<style scoped>
.all-order {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 搜索区域 */
.search-section {
  background: white;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border-bottom: 1px solid var(--color-border-light);
}

.search-form {
  padding: var(--spacing-md) var(--spacing-lg);
}

:deep(.el-form--inline .el-form-item) {
  margin-right: var(--spacing-md);
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* 表格容器 */
.table-container {
  flex: 1;
  overflow: hidden;
  background: white;
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

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  background: white;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
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

/* 表格样式统一 */
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

/* 响应式 */
@media (max-width: 768px) {
  .search-form :deep(.el-form) {
    flex-wrap: wrap;
  }

  .search-form :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }

  .search-form :deep(.el-form-item__content) {
    width: calc(100% - 80px);
  }
}
</style>
