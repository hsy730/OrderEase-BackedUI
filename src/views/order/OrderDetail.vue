<template>
  <div class="order-detail-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <button class="back-btn" @click="$router.back()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回</span>
          </button>
          <div class="header-info">
            <h1 class="page-title">订单详情</h1>
            <p class="order-number">订单号 {{ order.id }}</p>
          </div>
        </div>
        <div class="status-section" v-if="!loading">
          <div class="status-actions" v-if="canToggleStatus">
            <el-select
              v-model="selectedStatus"
              :loading="toggleLoading"
              @change="handleStatusChange"
              class="status-select"
              placeholder="更改状态"
            >
              <el-option
                :key="order.status"
                :label="`当前：${getStatusText(order.status)}`"
                :value="order.status"
                disabled
              />
              <el-option
                v-for="action in availableActions"
                :key="action.next_status || action.nextStatus"
                :label="action.name || '未知状态'"
                :value="action.next_status || action.nextStatus"
                :disabled="!action.next_status && !action.nextStatus"
              />
            </el-select>
          </div>
        </div>
      </div>

      <div class="detail-content" v-loading="loading">
        <div class="main-content">
          <section class="info-card customer-section">
            <div class="section-header">
              <h2 class="section-title">顾客信息</h2>
            </div>
            <div class="customer-info">
              <div class="customer-avatar">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M20 21a8 8 0 10-16 0"/>
                </svg>
              </div>
              <div class="customer-details">
                <div class="customer-name">{{ order.user?.name || '未知顾客' }}</div>
                <div class="customer-contact">
                  <span class="contact-item" v-if="order.user?.phone">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    {{ order.user.phone }}
                  </span>
                  <span class="contact-item delivery-type">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="3" width="15" height="13" rx="2"/>
                      <path d="M16 8h4l3 3v5h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    {{ order.user?.type === 'delivery' ? '邮寄配送' : '到店自取' }}
                  </span>
                </div>
                <div class="customer-address" v-if="order.user?.address && order.user?.type === 'delivery'">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ order.user.address }}
                </div>
              </div>
            </div>
          </section>

          <section class="info-card products-section">
            <div class="section-header">
              <h2 class="section-title">商品清单</h2>
              <span class="item-count">{{ order.items?.length || 0 }} 件商品</span>
            </div>
            <div class="products-list">
              <div 
                class="product-item" 
                v-for="(item, index) in order.items" 
                :key="index"
              >
                <div class="product-image-wrapper">
                  <el-image
                    v-if="item.product_image_url"
                    :src="getImageUrl(item.product_image_url)"
                    class="product-image"
                    :preview-src-list="[getImageUrl(item.product_image_url)]"
                    fit="cover"
                  >
                    <template #error>
                      <div class="image-placeholder">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    </template>
                  </el-image>
                  <div class="image-placeholder" v-else>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                </div>
                <div class="product-content">
                  <div class="product-header">
                    <h3 class="product-name">{{ item.product_name || '未知商品' }}</h3>
                    <span class="product-price">¥{{ Number(getItemUnitPrice(item)).toFixed(2) }}</span>
                  </div>
                  <p class="product-desc" v-if="item.product_description">{{ item.product_description }}</p>
                  <div class="product-options" v-if="item.options && item.options.length > 0">
                    <span 
                      class="option-tag" 
                      v-for="(options, category) in groupOptionsByCategory(item.options)" 
                      :key="category"
                    >
                      {{ category }}: {{ formatOptionNames(options) }}
                      <span v-if="getTotalPriceAdjustment(options) !== 0" class="option-price">
                        ({{ getTotalPriceAdjustment(options) > 0 ? '+' : '' }}{{ getTotalPriceAdjustment(options) }})
                      </span>
                    </span>
                  </div>
                </div>
                <div class="product-quantity">
                  <span class="quantity-value">×{{ item.quantity }}</span>
                  <span class="subtotal">¥{{ Number(getItemUnitPrice(item) * (item.quantity || 0)).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="info-card remark-section" v-if="order.remark">
            <div class="section-header">
              <h2 class="section-title">订单备注</h2>
            </div>
            <div class="remark-content">
              <p>{{ order.remark }}</p>
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <div class="info-card order-summary">
            <h2 class="section-title">订单摘要</h2>
            <div class="summary-list">
              <div class="summary-item">
                <span class="summary-label">订单金额</span>
                <span class="summary-value">¥{{ Number(order.total_price || 0).toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">创建时间</span>
                <span class="summary-value">{{ formatTime(order.created_at) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">更新时间</span>
                <span class="summary-value">{{ formatTime(order.updated_at) }}</span>
              </div>
            </div>
            <div class="summary-total">
              <span class="total-label">订单总额</span>
              <span class="total-value">¥{{ Number(order.total_price || 0).toFixed(2) }}</span>
            </div>
          </div>

          <div class="info-card timeline-section">
            <h2 class="section-title">订单状态</h2>
            <div class="timeline">
              <div class="timeline-item" :class="{ active: true }">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">{{ getStatusText(order.status) }}</div>
                  <div class="timeline-time">{{ formatTime(order.updated_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, toggleOrderStatus, getOrderStatusFlow } from '@/api/order'

const route = useRoute()
const loading = ref(false)
const order = ref({})
const toggleLoading = ref(false)
const orderStatusFlow = ref(null)
const selectedStatus = ref(null)

const fetchOrderStatusFlow = async (shopId) => {
  if (!shopId) return
  try {
    const data = await getOrderStatusFlow(shopId)
    orderStatusFlow.value = data.order_status_flow
  } catch (error) {
    console.error('获取订单状态流转配置失败:', error)
    ElMessage.error('获取订单状态流转配置失败')
  }
}

const getCurrentStatusConfig = computed(() => {
  if (!order.value.status || !orderStatusFlow.value) return null
  return orderStatusFlow.value.statuses.find(
    status => status.value === order.value.status
  ) || null
})

const getStatusText = (status) => {
  if (!orderStatusFlow.value) {
    const defaultStatusMap = {
      1: '待处理',
      2: '已接单',
      3: '已拒绝',
      4: '已发货',
      10: '已完成',
      '-1': '已取消'
    }
    return defaultStatusMap[status] || '未知状态'
  }
  const statusConfig = orderStatusFlow.value.statuses.find(s => s.value === status)
  return statusConfig?.label || '未知状态'
}

const getStatusClass = (status) => {
  const classMap = {
    1: 'status-pending',
    2: 'status-accepted',
    3: 'status-rejected',
    4: 'status-shipped',
    10: 'status-completed',
    '-1': 'status-canceled'
  }
  return classMap[status] || 'status-default'
}

const canToggleStatus = computed(() => {
  const currentStatusConfig = getCurrentStatusConfig.value
  return currentStatusConfig && !currentStatusConfig.isFinal && currentStatusConfig.actions && currentStatusConfig.actions.length > 0
})

const availableActions = computed(() => {
  const currentStatusConfig = getCurrentStatusConfig.value
  return currentStatusConfig?.actions || []
})

const handleStatusChange = async (newStatus) => {
  if (!order.value.id || !newStatus) return
  
  const action = availableActions.value.find(a => (a.next_status === newStatus) || (a.nextStatus === newStatus))
  if (!action) return

  try {
    await ElMessageBox.confirm(
      `确认${action.name || '操作'}吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    toggleLoading.value = true
    const res = await toggleOrderStatus(order.value.id, order.value.shop_id, Number(newStatus))
    
    ElMessage.success(res.message || '状态更新成功')
    order.value = res.order
    selectedStatus.value = res.order.status
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新订单状态失败:', error)
      ElMessage.error(error.response?.data?.error || '操作失败')
    }
    selectedStatus.value = null
  } finally {
    toggleLoading.value = false
  }
}

const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const data = await getOrderDetail(route.params.id)
    order.value = data
    selectedStatus.value = data.status
    if (data.shop_id) {
      await fetchOrderStatusFlow(data.shop_id)
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return '暂无'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `/admin/product/image?path=${cleanPath}`
}

const groupOptionsByCategory = (options) => {
  if (!options || options.length === 0) return {}
  
  const grouped = {}
  options.forEach(option => {
    const categoryName = option.category_name || '未知类别'
    if (!grouped[categoryName]) {
      grouped[categoryName] = []
    }
    grouped[categoryName].push(option)
  })
  
  return grouped
}

const formatOptionNames = (options) => {
  if (!options || options.length === 0) return ''
  return options.map(option => option.option_name || '未知选项').join(', ')
}

const getTotalPriceAdjustment = (options) => {
  if (!options || options.length === 0) return 0
  return options.reduce((total, option) => total + (option.price_adjustment || 0), 0)
}

const getItemUnitPrice = (item) => {
  if (!item) return 0
  const basePrice = Number(item.price || 0)
  const optionsAdjustment = item.options ? item.options.reduce((total, option) => total + (option.price_adjustment || 0), 0) : 0
  return basePrice + optionsAdjustment
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.header-info {
  padding-top: 4px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.order-number {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-pending {
  background: rgba(255, 149, 0, 0.12);
  color: #ff9500;
}

.status-pending .status-dot {
  background: #ff9500;
}

.status-accepted {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-primary);
}

.status-accepted .status-dot {
  background: var(--color-primary);
}

.status-rejected {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.status-rejected .status-dot {
  background: var(--color-danger);
}

.status-shipped {
  background: rgba(90, 200, 250, 0.12);
  color: #5ac8fa;
}

.status-shipped .status-dot {
  background: #5ac8fa;
}

.status-completed {
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
}

.status-completed .status-dot {
  background: #34c759;
}

.status-canceled {
  background: rgba(142, 142, 147, 0.12);
  color: #8e8e93;
}

.status-canceled .status-dot {
  background: #8e8e93;
}

.status-select {
  width: 160px;
}

.status-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.item-count {
  font-size: 14px;
  color: #86868b;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 12px;
  border-radius: 20px;
}

.customer-info {
  display: flex;
  gap: 16px;
}

.customer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  flex-shrink: 0;
}

.customer-details {
  flex: 1;
}

.customer-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.customer-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #86868b;
}

.contact-item svg {
  opacity: 0.7;
}

.customer-address {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 14px;
  color: #86868b;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  margin-top: 8px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.product-item:hover {
  background: #f5f5f7;
}

.product-image-wrapper {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 10px;
  color: #86868b;
}

.product-content {
  flex: 1;
  min-width: 0;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  flex: 1;
}

.product-price {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
}

.product-desc {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.option-tag {
  font-size: 12px;
  color: #86868b;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 10px;
  border-radius: 6px;
}

.option-price {
  color: var(--color-danger);
  font-weight: 500;
}

.product-quantity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
}

.quantity-value {
  font-size: 14px;
  color: #86868b;
}

.subtotal {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.remark-content {
  padding: 16px;
  background: rgba(255, 204, 0, 0.08);
  border-radius: 12px;
  border-left: 3px solid #ffcc00;
}

.remark-content p {
  margin: 0;
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.6;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-summary .section-title {
  margin-bottom: 20px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: #86868b;
}

.summary-value {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-danger);
  letter-spacing: -0.5px;
}

.timeline-section .section-title {
  margin-bottom: 20px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  position: relative;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #34c759;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.timeline-time {
  font-size: 12px;
  color: #86868b;
}

@media screen and (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-section {
    width: 100%;
    justify-content: space-between;
  }
  
  .product-item {
    flex-direction: column;
  }
  
  .product-image-wrapper {
    width: 100%;
    height: 160px;
  }
  
  .product-quantity {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
}
</style>
