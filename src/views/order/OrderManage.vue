<template>
  <div class="order-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>订单管理</h2>
        <el-button type="primary" @click="handleAdd">新增订单</el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="当前订单" name="current"></el-tab-pane>
        <el-tab-pane label="历史订单" name="history"></el-tab-pane>
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%"
      >
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, deleteOrder } from '@/api/order'
import OrderForm from '@/components/order/OrderForm.vue'
import { getCurrentShopId } from '@/api/shop'
import { getToken, isAdminRole } from '@/utils/auth'
import { EventSourcePolyfill } from 'event-source-polyfill'

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
const eventSource = ref(null) // SSE 连接实例

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
    // if (activeTab.value === 'current') {

  loading.value = true
  try {
    const response = await getOrderList({
      page: currentPage.value,
      pageSize: pageSize.value,
      tag_id: router.currentRoute.value.query.tag_id
    })
    
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
  // 初始化 SSE 连接
  const shopId = getCurrentShopId()
  if (shopId) {
    connectSSE(shopId)
  }
  
  fetchOrderList()
})

// SSE 连接函数，支持重连机制
const connectSSE = (shopId) => {
  // 如果已有连接，先关闭
  if (eventSource.value) {
    eventSource.value.close()
  }
  
  // 获取当前token
  const token = getToken()
  
  // 构造URL - 直接指向后端8080端口
  const sseUrl = `http://localhost:8080/api/order-ease/v1${isAdminRole() ? '/admin' : '/shopOwner'}/order/sse?shop_id=${shopId}`
  
  // 使用EventSourcePolyfill实现带认证头的SSE
  eventSource.value = new EventSourcePolyfill(sseUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    heartbeatTimeout: 60000 // 心跳超时时间
  })
  
  // 监听new-order事件
  eventSource.value.addEventListener('new_order', (event) => {
    try {
      const order = JSON.parse(event.data)
      ElMessage({
        message: `您有新的订单: ${order.id}`,
        type: 'success',
        duration: 0, // 不自动关闭
        showClose: true // 显示关闭按钮
      })
      fetchOrderList()
    } catch (error) {
      console.error('解析订单数据错误:', error)
    }
  })
  
  // 监听连接打开事件
  eventSource.value.onopen = (event) => {
    console.log('SSE 连接已建立')
  }
  
  // 监听错误事件
  eventSource.value.onerror = (event) => {
    // console.error('SSE 连接错误:', event)
    
    // 如果连接已关闭，尝试重连
    if (eventSource.value.readyState === EventSourcePolyfill.CLOSED) {
      setTimeout(() => {
        console.log('尝试重新连接...')
        connectSSE(shopId)
      }, 5000)
    }
  }
  
  // 监听连接关闭事件
  eventSource.value.onclose = (event) => {
    console.log('SSE 连接已关闭')
  }
}

// 组件销毁时关闭 SSE 连接
onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
  }
})
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
  margin-bottom: 20px;
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
</style>