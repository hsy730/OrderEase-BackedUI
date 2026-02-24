import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // 新订单通知状态
  const newOrder = ref(null)
  const showNotification = ref(false)

  /**
   * 触发新订单通知
   * @param {Object} order - 订单数据
   */
  function notifyNewOrder(order) {
    newOrder.value = order
    showNotification.value = true
  }

  /**
   * 关闭通知
   */
  function closeNotification() {
    showNotification.value = false
    newOrder.value = null
  }

  /**
   * 检查是否有新订单通知
   */
  function hasNewOrder() {
    return showNotification.value && newOrder.value !== null
  }

  return {
    newOrder,
    showNotification,
    notifyNewOrder,
    closeNotification,
    hasNewOrder
  }
})
