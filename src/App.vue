<template>
  <el-container class="layout-container">
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getCurrentShopId } from '@/api/shop'
import { getToken, isAdminRole } from '@/utils/auth'

const router = useRouter()
const eventSource = ref(null)

// SSE 连接函数，支持重连机制
const connectSSE = () => {
  // 获取当前shopId
  const shopId = getCurrentShopId()
  
  // 如果没有shopId，不建立连接（可能是管理员角色但未选择店铺）
  if (!shopId) {
    console.log('未获取到店铺ID，暂不建立SSE连接')
    return
  }
  
  // 如果已有连接，先关闭
  if (eventSource.value) {
    eventSource.value.close()
  }
  
  // 获取当前token
  const token = getToken()
  
  // 如果没有token，不建立连接
  if (!token) {
    console.log('未获取到token，暂不建立SSE连接')
    return
  }
  
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
      
      // 如果当前在订单管理页面，则刷新订单列表
      if (router.currentRoute.value.path === '/order') {
        // 发送全局事件或使用其他方式通知订单管理页面刷新
        window.dispatchEvent(new CustomEvent('new-order-received', { detail: order }))
      }
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
    if (eventSource.value && eventSource.value.readyState === EventSourcePolyfill.CLOSED) {
      setTimeout(() => {
        console.log('尝试重新连接...')
        connectSSE()
      }, 5000)
    }
  }
  
  // 监听连接关闭事件
  eventSource.value.onclose = (event) => {
    console.log('SSE 连接已关闭')
  }
}

// 监听路由变化，根据需要重新建立SSE连接
let currentShopId = getCurrentShopId()
const handleRouteChange = () => {
  const newShopId = getCurrentShopId()
  // 如果shopId发生变化，重新建立SSE连接
  if (newShopId !== currentShopId) {
    currentShopId = newShopId
    connectSSE()
  }
}

onMounted(() => {
  // 初始化 SSE 连接
  connectSSE()
  
  // 监听路由变化
  router.afterEach(handleRouteChange)
})

// 组件销毁时关闭 SSE 连接
onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
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
  background-color: #f0f2f5;
}
</style>
