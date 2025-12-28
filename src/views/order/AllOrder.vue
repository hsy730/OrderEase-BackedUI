<template>
  <div class="order-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>全部订单</h2>
      </div>

      <!-- 高级查询条件 -->
      <el-card class="search-card" shadow="never" style="padding: 10px;">
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
            </el-col>
            <el-col :span="9">
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
            <el-col :span="5">
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
const searchParams = reactive({
  user_id: null,
  status: [],
  create_time_range: []
}) // 查询参数

// 店铺信息和订单状态流转配置
const shopInfo = ref({})
const orderStatusFlow = ref([])
const loadingStatusFlow = ref(false)

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
    ElMessage.error('获取订单状态流转配置失败')
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
    
    console.log('=== API 调用参数 ===')
    console.log('最终请求参数 params:', params)
    console.log('状态参数详情:', {
      'searchParams.status': searchParams.status,
      'join 后': searchParams.status.join(','),
      '类型': typeof searchParams.status.join(',')
    })
    
    const response = await advanceSearchOrderList(params)
        
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

onMounted(async () => {
  // 初始化订单列表
  await fetchOrderStatusFlow()
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
  console.log('=== 查询参数调试信息 ===')
  console.log('搜索参数 searchParams:', searchParams)
  console.log('选择的订单状态:', searchParams.status)
  console.log('状态值类型:', typeof searchParams.status[0])
  console.log('状态选项数据 orderStatusFlow:', orderStatusFlow.value)
  
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

// 处理每页大小变化
const handleSizeChange = (val) => {
  console.log('每页大小变化:', val)
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  fetchOrderList()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  console.log('当前页变化:', val)
  currentPage.value = val
  fetchOrderList()
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