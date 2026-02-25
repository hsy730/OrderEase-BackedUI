<template>
  <el-container class="layout-container">
    <el-main>
      <router-view />
    </el-main>

    <!-- 新订单通知弹窗 -->
    <transition name="notification-slide">
      <div v-if="showNotification" class="new-order-notification" :class="`notification-${notificationType}`">
        <div class="notification-content">
          <div class="notification-icon">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="notification-body">
            <div class="notification-title">新订单通知</div>
            <div class="notification-message">订单号：{{ newOrder.id }}</div>
            <div class="notification-time">¥{{ newOrder.total_price?.toFixed(2) || '0.00' }}</div>
          </div>
          <div class="notification-actions">
            <el-button size="small" @click="viewOrder">查看</el-button>
            <el-button size="small" type="info" @click="closeNotification">关闭</el-button>
          </div>
        </div>
        <div class="notification-progress"></div>
      </div>
    </transition>
  </el-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getCurrentShopId, getToken, getRolePrefix } from '@/utils/auth'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores'

const router = useRouter()
const notificationStore = useNotificationStore()
const eventSource = ref(null)
const showNotification = ref(false)
const newOrder = ref({})
const notificationType = ref('info')
const notificationTimer = ref(null)
let reconnectTimer = null
let unwatchNotification = null
let routeUnwatch = null

// 监听 Pinia Store 中的新订单通知
unwatchNotification = watch(() => notificationStore.newOrder, (order) => {
  if (order) {
    showNewOrderNotification(order)
  }
})

// SSE 连接函数
const connectSSE = () => {
  const shopId = getCurrentShopId()

  if (!shopId) {
    console.log('未获取到店铺ID，暂不建立SSE连接')
    return
  }

  if (eventSource.value) {
    eventSource.value.close()
  }

  const token = getToken()

  if (!token) {
    console.log('未获取到token，暂不建立SSE连接')
    return
  }

  // URL 前缀由 request.js 拦截器自动处理，SSE 需要手动处理
  const sseUrl = `http://localhost:8080/api/order-ease/v1${getRolePrefix()}/order/sse?shop_id=${shopId}`

  eventSource.value = new EventSourcePolyfill(sseUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    heartbeatTimeout: 60000
  })

  eventSource.value.addEventListener('new_order', (event) => {
    try {
      const order = JSON.parse(event.data)
      
      // 如果当前在订单管理页面，通过 Pinia Store 通知
      if (router.currentRoute.value.path === '/order') {
        notificationStore.notifyNewOrder(order)
      } else {
        // 否则显示通知弹窗
        showNewOrderNotification(order)
      }
    } catch (error) {
      console.error('解析订单数据错误:', error)
    }
  })

  eventSource.value.onopen = () => {
    console.log('SSE 连接已建立')
  }

  eventSource.value.onerror = () => {
    if (eventSource.value && eventSource.value.readyState === EventSourcePolyfill.CLOSED) {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      reconnectTimer = setTimeout(() => {
        console.log('尝试重新连接...')
        connectSSE()
      }, 5000)
    }
  }

  eventSource.value.onclose = () => {
    console.log('SSE 连接已关闭')
  }
}

// 显示新订单通知
const showNewOrderNotification = (order) => {
  newOrder.value = order
  notificationType.value = 'success'
  showNotification.value = true

  // 自动关闭通知（10秒后）
  if (notificationTimer.value) {
    clearTimeout(notificationTimer.value)
  }

  notificationTimer.value = setTimeout(() => {
    closeNotification()
  }, 10000)
}

// 关闭通知
const closeNotification = () => {
  showNotification.value = false
  if (notificationTimer.value) {
    clearTimeout(notificationTimer.value)
    notificationTimer.value = null
  }
}

// 查看订单
const viewOrder = () => {
  closeNotification()
  router.push(`/order/${newOrder.value.id}`)
}

// 监听路由变化
let currentShopId = getCurrentShopId()
const handleRouteChange = () => {
  const newShopId = getCurrentShopId()
  if (newShopId !== currentShopId) {
    currentShopId = newShopId
    connectSSE()
  }
}

onMounted(() => {
  connectSSE()
  routeUnwatch = router.afterEach(handleRouteChange)
})

onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
  if (notificationTimer.value) {
    clearTimeout(notificationTimer.value)
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
  if (unwatchNotification) {
    unwatchNotification()
  }
  if (routeUnwatch) {
    routeUnwatch()
  }
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.layout-container {
  height: 100%;
}

.el-main {
  padding: 0;
  background-color: var(--color-bg-secondary);
}

/* 新订单通知样式 */
.new-order-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  width: 380px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  z-index: 9999;
}

.notification-content {
  display: flex;
  align-items: stretch;
  padding: var(--spacing-md);
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: var(--spacing-md);
}

.notification-success .notification-icon {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.notification-success .notification-icon .el-icon {
  font-size: 24px;
}

.notification-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: var(--spacing-md);
  flex-shrink: 0;
}

.notification-actions .el-button {
  padding: 4px 12px;
  font-size: 12px;
}

.notification-progress {
  height: 3px;
  background: var(--color-bg-tertiary);
  position: relative;
  overflow: hidden;
}

.notification-progress::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: var(--color-success);
  animation: progress 10s linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 通知动画 */
.notification-slide-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-slide-leave-active {
  animation: slideOutRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .new-order-notification {
    right: 12px;
    left: 12px;
    width: auto;
  }

  .notification-content {
    flex-direction: column;
  }

  .notification-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
    align-self: flex-start;
  }

  .notification-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: var(--spacing-sm);
  }

  .notification-actions .el-button {
    flex: 1;
  }
}
</style>
