<template>
  <div class="order-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>订单管理</h2>
        <div>
          <el-button type="primary" @click="handleAdd">新建</el-button>
          <el-button @click="handleRefresh" :icon="Refresh" title="刷新"></el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="当前订单" name="current"></el-tab-pane>
        <el-tab-pane label="全部订单" name="all"></el-tab-pane>
      </el-tabs>

      <!-- 高级查询条件 - 仅在全部订单页面显示 -->
      <el-card v-show="activeTab === 'all'" class="search-card" shadow="never" style="padding: 10px;">
        <el-form :model="searchParams" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="5">
              <el-form-item label="用户">
                <UserSelect 
                  v-model="searchParams.user_id" 
                  placeholder="请选择用户" 
                  style="width: 150px;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="订单状态">
                <el-select 
                  v-model="searchParams.status" 
                  placeholder="请选择订单状态" 
                  clearable
                  multiple
                  style="width: 150px;"
                >
                  <el-option 
                    v-for="status in orderStatusOptions" 
                    :key="status.value" 
                    :label="status.label" 
                    :value="status.value.toString()" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="searchParams.create_time_range"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 300px;"
                  format="YYYY-MM-DD HH:mm:ss"
                  shortcuts-remove-other-values
                  unlink-panels
                  :shortcuts="[
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
                  ]"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="handleSearch" style="margin-right: 10px;">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%"
      >
        <el-table-column label="订单ID" width="160">
          <template #default="{ row }">
            <span class="id">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.total_price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="商品数量" width="80">
          <template #default="{ row }">
            <span class="quantity">{{ row.items.length }}件</span>
          </template>
        </el-table-column> -->
        <el-table-column label="创建时间" min-width="140">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="140">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="info" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
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
    </div>

    <!-- 新增/编辑订单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
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
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getOrderList, deleteOrder, advanceSearchOrderList, getOrderStatusFlow } from '@/api/order'
import OrderForm from '@/components/order/OrderForm.vue'
import UserSelect from '@/components/UserSelect.vue'

const router = useRouter()
const loading = ref(false)
const orderList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orderFormRef = ref(null)
const activeTab = ref('current') // 当前激活的标签页
const orderStatusFlow = ref(null)
const searchParams = reactive({
  user_id: null,
  status: [],
  create_time_range: []
}) // 查询参数
// const eventSource = ref(null) // SSE 连接实例 - 已移至App.vue

// 获取订单状态流转配置
const fetchOrderStatusFlow = async () => {
  try {
    // 假设从订单列表中获取第一个订单的shop_id
    const shopId = orderList.value[0]?.shop_id
    if (shopId) {
      const data = await getOrderStatusFlow(shopId)
      orderStatusFlow.value = data.order_status_flow
    }
  } catch (error) {
    console.error('获取订单状态流转配置失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
}

// 获取订单状态对应的文本
const getStatusText = (status) => {
  if (!orderStatusFlow.value) {
    // 默认状态映射
    return '未知状态';
  }
  const statusConfig = orderStatusFlow.value.statuses.find(s => s.value === status)
  return statusConfig?.label || '未知状态'
}

// 获取订单状态对应的类型
const getStatusType = (status) => {
  if (!orderStatusFlow.value) {
    // 默认状态类型映射
    const defaultStatusTypeMap = {
      1: 'warning',   // OrderStatusPending - 待处理
      2: 'primary',   // OrderStatusAccepted - 已接单
      3: 'info',      // OrderStatusPrepared - 已备货
      4: 'info',      // OrderStatusShipped - 已发货
      10: 'success',  // OrderStatusComplete - 已完成
      '-1': 'info'    // OrderStatusCanceled - 已取消
    }
    return defaultStatusTypeMap[status] || 'info'
  }
  const statusConfig = orderStatusFlow.value.statuses.find(s => s.value === status)
  return statusConfig?.type || 'info'
}

// 订单状态选项（用于搜索条件）
const orderStatusOptions = computed(() => {
  if (!orderStatusFlow.value) {
    // 默认状态选项
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

// 获取订单列表
const fetchOrderList = async () => {
    // if (activeTab.value === 'current') {

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
      tag_id: router.currentRoute.value.query.tag_id
    }
    let response = null
    // 仅在全部订单页面添加查询参数
    if (activeTab.value === 'all') {
      params.user_id = searchParams.user_id
      // 确保状态值转换为数字类型（因为后端API期望数字类型）
      const statusValues = searchParams.status.length > 0 ? searchParams.status.map(s => parseInt(s)) : []
      params.status = statusValues.length > 0 ? statusValues.join(',') : null
      params.start_time = startTime
      params.end_time = endTime
      response = await advanceSearchOrderList(params)
    } else {
      response = await getOrderList(params)
    }
        
    // 处理新的返回格式
    if (response.data) {
      // 为每个订单项添加total_price字段，如果原数据中没有的话
      orderList.value = response.data.map(order => {
        // 如果订单中没有total_price字段，可以根据商品价格和数量计算
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
    
    // 获取订单状态流转配置
    await fetchOrderStatusFlow()
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
    orderList.value = []
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
  router.push(`/order/${row.id}`)
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
// 在submitForm方法中添加
const submitForm = async () => {
  try {
    loading.value = true; // 添加加载状态
    await orderFormRef.value.submit();
    await fetchOrderList(); // 强制刷新
    ElMessage.success('添加成功');
  } finally {
    loading.value = false;
  }
}

// 表单提交成功
const handleSubmit = () => {
  dialogVisible.value = false
  fetchOrderList()
}

// 标签页切换处理
const handleTabChange = () => {
  // 重置分页参数并重新获取数据
  currentPage.value = 1
  // 重置查询条件
  if (activeTab.value === 'current') {
    // 切换到当前订单时，清空查询条件
    searchParams.user_id = null
    searchParams.status = []
    searchParams.create_time_range = []
  }
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
  // 初始化订单列表
  fetchOrderList()
  
  // 监听全局SSE事件
  window.addEventListener('new-order-received', handleNewOrder)
})

// 组件销毁时移除事件监听
onUnmounted(() => {
  window.removeEventListener('new-order-received', handleNewOrder)
})

// 处理新订单事件
const handleNewOrder = (event) => {
  // 刷新订单列表
  fetchOrderList()
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

// 刷新数据
const handleRefresh = () => {
  loading.value = true
  fetchOrderList()
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
.order-manage {
  height: 100%;
}

.content-wrapper {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.search-card {
  margin-bottom: 20px;
}
</style>