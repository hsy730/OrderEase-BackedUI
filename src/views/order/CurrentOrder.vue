<template>
  <div class="order-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>当前订单</h2>
        <div>
          <el-button type="primary" @click="handleAdd">新建</el-button>
          <el-button @click="handleRefresh" :icon="Refresh" title="刷新"></el-button>
        </div>
      </div>

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
import { Refresh } from '@element-plus/icons-vue'
import { getOrderList, deleteOrder } from '@/api/order'
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

// 获取订单状态对应的文本
const getStatusText = (status) => {
  const statusMap = {
    1: '待处理',   // OrderStatusPending
    2: '已接单',   // OrderStatusAccepted
    3: '已备货',   // OrderStatusRejected
    4: '已发货',   // OrderStatusShipped
    10: '已完成',  // OrderStatusComplete
    '-1': '已取消' // OrderStatusCanceled
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态对应的类型
const getStatusType = (status) => {
  const statusMap = {
    1: 'warning',   // OrderStatusPending - 待处理
    2: 'primary',   // OrderStatusAccepted - 已接单
    3: 'danger',    // OrderStatusRejected - 已拒绝
    4: 'info',      // OrderStatusShipped - 已发货
    10: 'success',  // OrderStatusComplete - 已完成
    '-1': 'info'    // OrderStatusCanceled - 已取消
  }
  return statusMap[status] || 'info'
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      tag_id: router.currentRoute.value.query.tag_id
    }
    
    const response = await getOrderList(params)
        
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
</style>