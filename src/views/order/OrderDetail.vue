<template>
  <div class="order-detail">
    <div class="header">
      <div class="header-left">
        <h2>订单详情</h2>
        <span class="order-id">订单号：{{ order.id }}</span>
      </div>
      <div class="header-actions">
        <el-button
          v-if="canToggleStatus"
          type="primary"
          :loading="toggleLoading"
          @click="handleToggleStatus"
        >
          {{ getNextStatusText }}
        </el-button>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </div>

    <div class="detail-content" v-loading="loading">
      <!-- 基本信息 -->
      <el-card class="detail-section">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.id }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ Number(order.total_price || 0).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ getStatusText(order.status) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(order.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(order.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="订单备注" :span="2">
            {{ order.remark || '暂无备注' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户姓名">{{ order.user?.name || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="用户电话">{{ order.user?.phone || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="用户地址">{{ order.user?.address || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="配送方式">
            {{ order.user?.type === 'delivery' ? '邮寄' : '自取' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品列表 -->
      <el-card class="detail-section">
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
            <span class="item-count">共 {{ order.items?.length || 0 }} 件商品</span>
          </div>
        </template>
        <el-table :data="order.items || []" style="width: 100%" size="small">
          <el-table-column label="商品信息" min-width="400">
            <template #default="{ row }">
              <div class="product-info">
                <el-image
                  v-if="row.product?.image_url"
                  :src="getImageUrl(row.product.image_url)"
                  class="product-image"
                  :preview-src-list="[getImageUrl(row.product.image_url)]"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="product-detail">
                  <div class="product-name">{{ row.product?.name || '未知商品' }}</div>
                  <div class="product-desc">{{ row.product?.description || '暂无描述' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120" align="center">
            <template #default="{ row }">
              ¥{{ Number(row.price || 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" align="center" />
          <el-table-column label="小计" width="120" align="center">
            <template #default="{ row }">
              ¥{{ Number((row.price || 0) * (row.quantity || 0)).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        <div class="order-total">
          总计：<span class="total-price">¥{{ Number(order.total_price || 0).toFixed(2) }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getOrderDetail, toggleOrderStatus } from '@/api/order'
import { API_BASE_URL, API_PREFIX } from '@/config'

const route = useRoute()
const loading = ref(false)
const order = ref({})
const toggleLoading = ref(false)

// 状态转换映射
const statusTransitions = {
  'pending': { next: 'accepted', text: '接单' },
  'accepted': { next: 'shipped', text: '发货' },
  'shipped': { next: 'completed', text: '完成' },
  'completed': null,  // 终态
  'rejected': null,   // 终态
  'canceled': null    // 终态
}

// 获取状态文本
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

// 获取状态类型（用于标签颜色）
const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',    // 黄色
    'accepted': 'primary',   // 蓝色
    'shipped': 'info',       // 灰蓝色
    'completed': 'success',  // 绿色
    'rejected': 'danger',    // 红色
    'canceled': 'info'       // 灰蓝色
  }
  return statusMap[status] || 'info'
}

// 是否可以切换状态
const canToggleStatus = computed(() => {
  const currentStatus = order.value.status
  return currentStatus && statusTransitions[currentStatus] !== null
})

// 获取下一个状态的文本
const getNextStatusText = computed(() => {
  const currentStatus = order.value.status
  if (!currentStatus || !statusTransitions[currentStatus]) return ''
  return statusTransitions[currentStatus]?.text || ''
})

// 处理状态翻转
const handleToggleStatus = async () => {
  if (!order.value.id) return

  try {
    await ElMessageBox.confirm(
      `确认${getNextStatusText.value}吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    toggleLoading.value = true
    const res = await toggleOrderStatus(order.value.id)
    
    ElMessage.success(res.message || '状态更新成功')
    // 更新订单信息
    order.value = res.order
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新订单状态失败:', error)
      ElMessage.error(error.response?.data?.error || '操作失败')
    }
  } finally {
    toggleLoading.value = false
  }
}

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const data = await getOrderDetail(route.params.id)
    order.value = data
  } catch (error) {
    console.error('获取订单详情失败:', error)
  } finally {
    loading.value = false
  }
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

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}${API_PREFIX}/product/image?path=${cleanPath}`
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 16px;
  margin: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-id {
  color: #909399;
  font-size: 14px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  background: #fff;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-count {
  font-size: 13px;
  color: #909399;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.image-placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  font-size: 14px;
}

.product-desc {
  font-size: 12px;
  color: #909399;
}

.order-total {
  margin-top: 16px;
  text-align: right;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  font-size: 14px;
}

.total-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  margin-left: 8px;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  color: #606266;
}

:deep(.el-table) {
  font-size: 13px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 确保按钮在移动端也能正常显示 */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 