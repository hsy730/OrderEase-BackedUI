<template>
  <div class="dashboard">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">数据概览</h1>
        <p class="page-description">查看系统运营数据统计</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-card-primary">
        <div class="stat-icon">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日订单</div>
          <div class="stat-value">{{ stats.todayOrders }}</div>
          <div class="stat-change stat-change-neutral">
            <span>昨日 {{ stats.yesterdayOrders }} 单</span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-card-success">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日销售额</div>
          <div class="stat-value">¥{{ stats.todayRevenue.toFixed(2) }}</div>
          <div class="stat-change stat-change-neutral">
            <span>昨日 ¥{{ stats.yesterdayRevenue.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-card-warning">
        <div class="stat-icon">
          <el-icon><Goods /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">在售商品</div>
          <div class="stat-value">{{ stats.activeProducts }}</div>
          <div class="stat-change stat-change-neutral">
            <span>总商品 {{ stats.totalProducts }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-card-info">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日用户</div>
          <div class="stat-value">{{ stats.todayUsers }}</div>
          <div class="stat-change stat-change-neutral">
            <span>总用户 {{ stats.totalUsers }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 销售趋势图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>销售趋势</h3>
          <div class="chart-actions">
            <el-radio-group v-model="salesPeriod" size="small">
              <el-radio-button value="week">本周</el-radio-button>
              <el-radio-button value="month">本月</el-radio-button>
              <el-radio-button value="year">全年</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-body">
          <div class="chart-placeholder">
            <div class="placeholder-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <p>销售趋势图表</p>
            <span class="placeholder-text">展示过去 {{ periodText }} 的销售数据变化</span>
          </div>
        </div>
      </div>

      <!-- 订单处理效率 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>订单处理效率</h3>
          <el-button text size="small" @click="fetchStats" :loading="loading">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        <div class="chart-body">
          <div class="efficiency-stats">
            <div class="efficiency-item">
              <div class="efficiency-icon efficiency-icon-primary">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="efficiency-content">
                <div class="efficiency-label">平均接单时间</div>
                <div class="efficiency-value">{{ orderEfficiency.avgAcceptTime }} <span class="efficiency-unit">分钟</span></div>
                <div class="efficiency-desc">从下单到接单</div>
              </div>
            </div>

            <div class="efficiency-item">
              <div class="efficiency-icon efficiency-icon-success">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="efficiency-content">
                <div class="efficiency-label">平均完成时间</div>
                <div class="efficiency-value">{{ orderEfficiency.avgCompleteTime }} <span class="efficiency-unit">分钟</span></div>
                <div class="efficiency-desc">从接单到完成</div>
              </div>
            </div>

            <div class="efficiency-item">
              <div class="efficiency-icon efficiency-icon-warning">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="efficiency-content">
                <div class="efficiency-label">今日完成率</div>
                <div class="efficiency-value">{{ orderEfficiency.todayCompletionRate }}<span class="efficiency-unit">%</span></div>
                <div class="efficiency-desc">已完成订单占比</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热销商品和最新订单 -->
    <div class="content-grid">
      <!-- 热销商品 -->
      <div class="content-card">
        <div class="card-header">
          <h3>热销商品</h3>
          <el-button text type="primary" size="small" @click="$router.push('/product')">查看全部</el-button>
        </div>
        <div class="card-body">
          <div class="product-list">
            <div class="product-item" v-for="(item, index) in hotProducts" :key="item.id">
              <div class="product-rank" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
              <div class="product-image">
                <SmartImage v-if="item.image_url" :src="getProductImageUrl(item.image_url)" :alt="item.name" />
                <div v-else class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="product-info">
                <div class="product-name">{{ item.name }}</div>
                <div class="product-sales">已售 {{ item.sales }} 份</div>
              </div>
              <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新订单 -->
      <div class="content-card">
        <div class="card-header">
          <h3>最新订单</h3>
          <el-button text type="primary" size="small" @click="$router.push('/order')">查看全部</el-button>
        </div>
        <div class="card-body">
          <div class="order-list">
            <div class="order-item" v-for="order in recentOrders" :key="order.id">
              <div class="order-info">
                <div class="order-id">#{{ order.id.slice(-6) }}</div>
                <div class="order-time">{{ formatRelativeTime(order.created_at) }}</div>
              </div>
              <div class="order-amount">¥{{ order.total_price?.toFixed(2) || '0.00' }}</div>
              <el-tag :type="getStatusType(order.status)" size="small">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Money, Goods, User, TrendCharts, Refresh, Picture, Timer, Odometer, CircleCheck } from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/dashboard'
import { getStatusText as getStatusTextUtil, getStatusType as getStatusTypeUtil } from '@/utils/orderStatus'
import { formatRelativeTime } from '@/utils/date'
import SmartImage from '@/components/SmartImage.vue'

const router = useRouter()
const salesPeriod = ref('week')
const loading = ref(false)

// 统计数据
const stats = ref({
  todayOrders: 0,
  yesterdayOrders: 0,
  todayRevenue: 0,
  yesterdayRevenue: 0,
  activeProducts: 0,
  totalProducts: 0,
  todayUsers: 0,
  totalUsers: 0
})

// 订单处理效率
const orderEfficiency = ref({
  avgAcceptTime: 0,
  avgCompleteTime: 0,
  todayCompletionRate: 0
})

// 热销商品
const hotProducts = ref([])

// 最新订单
const recentOrders = ref([])

const periodText = computed(() => {
  const map = { week: '7天', month: '30天', year: '12个月' }
  return map[salesPeriod.value]
})

// 格式化时间


// 获取订单状态文本
const shopInfo = ref({})
const getStatusText = (status) => {
  return getStatusTextUtil(status, shopInfo.value)
}

const getStatusType = (status) => {
  return getStatusTypeUtil(status, shopInfo.value)
}

// 获取商品图片URL
const getProductImageUrl = (imageUrl) => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  return import.meta.env.VITE_API_BASE_URL + imageUrl
}

// 获取统计数据
const fetchStats = async () => {
  loading.value = true
  try {
    const response = await getDashboardStats({ period: salesPeriod.value })
    const data = response.data

    if (!data) {
      console.error('获取统计数据失败: 返回数据为空')
      return
    }

    stats.value = {
      todayOrders: data.orderStats?.todayOrders || 0,
      yesterdayOrders: data.orderStats?.yesterdayOrders || 0,
      todayRevenue: data.orderStats?.todayRevenue || 0,
      yesterdayRevenue: data.orderStats?.yesterdayRevenue || 0,
      activeProducts: data.productStats?.activeProducts || 0,
      totalProducts: data.productStats?.totalProducts || 0,
      todayUsers: data.userStats?.todayUsers || 0,
      totalUsers: data.userStats?.totalUsers || 0
    }

    orderEfficiency.value = {
      avgAcceptTime: (data.orderEfficiency?.avgAcceptTime || 0).toFixed(1),
      avgCompleteTime: (data.orderEfficiency?.avgCompleteTime || 0).toFixed(1),
      todayCompletionRate: (data.orderEfficiency?.todayCompletionRate || 0).toFixed(1)
    }

    hotProducts.value = data.hotProducts || []
    recentOrders.value = data.recentOrders || []

  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听销售趋势周期变化，重新获取数据
watch(salesPeriod, () => {
  fetchStats()
})

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.page-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.stat-card-primary::before {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}

.stat-card-success::before {
  background: linear-gradient(90deg, var(--color-success), var(--color-success-light));
}

.stat-card-warning::before {
  background: linear-gradient(90deg, var(--color-warning), var(--color-warning-light));
}

.stat-card-info::before {
  background: linear-gradient(90deg, var(--color-info), var(--color-info-light));
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-primary .stat-icon {
  background: var(--color-info-bg);
  color: var(--color-primary);
}

.stat-card-success .stat-icon {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.stat-card-warning .stat-icon {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.stat-card-info .stat-icon {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.stat-icon .el-icon {
  font-size: 28px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.stat-change-positive {
  color: var(--color-success);
}

.stat-change-negative {
  color: var(--color-danger);
}

.stat-change-neutral {
  color: var(--color-text-tertiary);
}

.stat-change .el-icon {
  font-size: 14px;
}

.stat-change-text {
  color: var(--color-text-tertiary);
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-md);
}

.chart-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.chart-body {
  padding: var(--spacing-lg);
  min-height: 280px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 240px;
  color: var(--color-text-tertiary);
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  opacity: 0.3;
}

.placeholder-icon .el-icon {
  font-size: 64px;
}

.chart-placeholder p {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.placeholder-text {
  font-size: 13px;
}

/* 订单处理效率 */
.efficiency-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) 0;
}

.efficiency-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  transition: all var(--transition-base);
}

.efficiency-item:hover {
  background: var(--color-bg-tertiary);
  transform: translateX(4px);
}

.efficiency-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.efficiency-icon .el-icon {
  font-size: 24px;
}

.efficiency-icon-primary {
  background: var(--color-info-bg);
  color: var(--color-primary);
}

.efficiency-icon-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.efficiency-icon-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.efficiency-content {
  flex: 1;
}

.efficiency-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.efficiency-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin-bottom: 2px;
}

.efficiency-unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.efficiency-desc {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-md);
}

.content-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.card-body {
  padding: var(--spacing-md);
}

/* 热销商品列表 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.product-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
  cursor: pointer;
}

.product-item:hover {
  background: var(--color-bg-secondary);
}

.product-rank {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #92400e;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #6b7280;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e3a869);
  color: #92400e;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-tertiary);
}

.product-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-sales {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-danger);
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
  cursor: pointer;
}

.order-item:hover {
  background: var(--color-bg-secondary);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-id {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
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

/* 响应式 */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-icon .el-icon {
    font-size: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
