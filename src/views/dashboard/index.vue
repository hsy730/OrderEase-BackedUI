<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card stat-card-primary">
        <div class="stat-icon">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日订单</div>
          <div class="stat-value">{{ stats.todayOrders }}</div>
          <div class="stat-change" :class="{ 'stat-change-positive': stats.ordersChange >= 0, 'stat-change-negative': stats.ordersChange < 0 }">
            <el-icon><component :is="stats.ordersChange >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            <span>{{ Math.abs(stats.ordersChange) }}%</span>
            <span class="stat-change-text">较昨日</span>
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
          <div class="stat-change" :class="{ 'stat-change-positive': stats.revenueChange >= 0, 'stat-change-negative': stats.revenueChange < 0 }">
            <el-icon><component :is="stats.revenueChange >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            <span>{{ Math.abs(stats.revenueChange) }}%</span>
            <span class="stat-change-text">较昨日</span>
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
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">全年</el-radio-button>
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

      <!-- 订单状态分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>订单状态分布</h3>
          <el-button text size="small">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        <div class="chart-body">
          <div class="status-distribution">
            <div class="status-item" v-for="item in orderStatus" :key="item.status">
              <div class="status-info">
                <div class="status-label">{{ item.label }}</div>
                <div class="status-count">{{ item.count }} 单</div>
              </div>
              <div class="status-bar">
                <div class="status-progress" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
              </div>
              <div class="status-percent">{{ item.percent }}%</div>
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
                <div class="order-time">{{ formatTime(order.created_at) }}</div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Money, Goods, User, TrendCharts, Refresh, Picture, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getOrderList } from '@/api/order'
import { getProductList, getProductImageUrl } from '@/api/product'
import { getStatusText as getStatusTextUtil, getStatusType as getStatusTypeUtil } from '@/utils/orderStatus'
import { getCurrentShopId } from '@/api/shop'
import SmartImage from '@/components/SmartImage.vue'

const router = useRouter()
const salesPeriod = ref('week')

// 统计数据
const stats = ref({
  todayOrders: 0,
  ordersChange: 0,
  todayRevenue: 0,
  revenueChange: 0,
  activeProducts: 0,
  totalProducts: 0,
  todayUsers: 0,
  totalUsers: 0
})

// 订单状态分布
const orderStatus = ref([
  { status: 0, label: '待接单', count: 0, percent: 0, color: '#f59e0b' },
  { status: 1, label: '制作中', count: 0, percent: 0, color: '#3b82f6' },
  { status: 10, label: '已完成', count: 0, percent: 0, color: '#10b981' },
  { status: 11, label: '已取消', count: 0, percent: 0, color: '#ef4444' }
])

// 热销商品
const hotProducts = ref([])

// 最新订单
const recentOrders = ref([])

const periodText = computed(() => {
  const map = { week: '7天', month: '30天', year: '12个月' }
  return map[salesPeriod.value]
})

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

// 获取订单状态文本
const shopInfo = ref({})
const getStatusText = (status) => {
  return getStatusTextUtil(status, shopInfo.value)
}

const getStatusType = (status) => {
  return getStatusTypeUtil(status, shopInfo.value)
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const [ordersRes, productsRes] = await Promise.all([
      getOrderList({ page: 1, pageSize: 100 }),
      getProductList({ page: 1, pageSize: 100 })
    ])

    // 计算今日订单
    const today = new Date().toDateString()
    const todayOrders = ordersRes.data?.filter(o => new Date(o.created_at).toDateString() === today) || []

    stats.value.todayOrders = todayOrders.length
    stats.value.todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0)

    // 商品统计
    const products = productsRes.data || []
    stats.value.activeProducts = products.filter(p => p.status === 'online').length
    stats.value.totalProducts = products.length

    // 订单状态分布
    const total = ordersRes.data?.length || 0
    const statusCounts = {}
    ordersRes.data?.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
    })

    orderStatus.value.forEach(item => {
      item.count = statusCounts[item.status] || 0
      item.percent = total > 0 ? Math.round((item.count / total) * 100) : 0
    })

    // 热销商品（按销量排序）
    hotProducts.value = products
      .filter(p => p.status === 'online')
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 5)
      .map(p => ({
        ...p,
        sales: Math.floor(Math.random() * 100) // 模拟销量
      }))

    // 最新订单
    recentOrders.value = ordersRes.data?.slice(0, 5) || []

    // 模拟变化数据
    stats.value.ordersChange = Math.floor(Math.random() * 40) - 10
    stats.value.revenueChange = Math.floor(Math.random() * 50) - 15
    stats.value.todayUsers = Math.floor(Math.random() * 50) + 10
    stats.value.totalUsers = Math.floor(Math.random() * 500) + 100
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 统计卡片网格 */
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

/* 订单状态分布 */
.status-distribution {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.status-info {
  width: 80px;
  flex-shrink: 0;
}

.status-label {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.status-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.status-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.status-progress {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.status-percent {
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
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
}
</style>
