// 订单状态工具函数

// 默认订单状态映射
const DEFAULT_STATUS_MAP = {
  0: { label: '待处理', type: 'warning' },   // OrderStatusPending
  1: { label: '已接单', type: 'primary' },   // OrderStatusAccepted
  10: { label: '已完成', type: 'success' },  // OrderStatusComplete
  11: { label: '已取消', type: 'info' }     // OrderStatusCanceled
}

/**
 * 获取订单状态文本
 * @param {number|string} status - 订单状态值
 * @param {Object} shop - 店铺对象，包含order_status_flow配置
 * @returns {string} - 状态文本
 */
export const getStatusText = (status, shop = null) => {
  // 如果有店铺配置且包含order_status_flow，使用店铺自定义状态
  if (shop && shop.order_status_flow) {
    const statusConfig = shop.order_status_flow.statuses.find(s => s.value === status)
    if (statusConfig) {
      return statusConfig.label
    }
  }
  
  // 否则使用默认状态映射
  return '未知状态'
}

/**
 * 获取订单状态类型（用于标签颜色）
 * @param {number|string} status - 订单状态值
 * @param {Object} shop - 店铺对象，包含order_status_flow配置
 * @returns {string} - 状态类型（warning/primary/danger/info/success）
 */
export const getStatusType = (status, shop = null) => {
  // 如果有店铺配置且包含order_status_flow，使用店铺自定义状态
  if (shop && shop.order_status_flow) {
    const statusConfig = shop.order_status_flow.statuses.find(s => s.value === status)
    if (statusConfig) {
      return statusConfig.type
    }
  }
  
  // 否则使用默认状态映射
  return 'info'
}

/**
 * 获取订单当前状态的可用动作
 * @param {number|string} status - 订单状态值
 * @param {Object} shop - 店铺对象，包含order_status_flow配置
 * @returns {Array} - 可用动作列表
 */
export const getAvailableActions = (status, shop = null) => {
  // 如果有店铺配置且包含order_status_flow，使用店铺自定义状态
  if (shop && shop.order_status_flow) {
    const statusConfig = shop.order_status_flow.statuses.find(s => s.value === status)
    if (statusConfig && !statusConfig.isFinal) {
      return statusConfig.actions || []
    }
  }
  
  // 否则返回空数组
  return []
}

/**
 * 获取默认订单状态配置
 * @returns {Object} - 默认订单状态配置
 */
export const getDefaultOrderStatusFlow = () => {
  return {
    statuses: [
      {
        "value": 0,
        "label": "待处理",
        "type": "warning",
        "isFinal": false,
        "actions": [
          {
            "name": "接单",
            "nextStatus": 1,
            "nextStatusLabel": "已接单"
          },
          {
            "name": "取消",
            "nextStatus": 11,
            "nextStatusLabel": "已取消"
          }
        ]
      },
      {
        "value": 1,
        "label": "已接单",
        "type": "primary",
        "isFinal": false,
        "actions": [
          {
            "name": "完成",
            "nextStatus": 10,
            "nextStatusLabel": "已完成"
          },
          {
            "name": "取消",
            "nextStatus": 11,
            "nextStatusLabel": "已取消"
          }
        ]
      },
      {
        "value": 10,
        "label": "已完成",
        "type": "success",
        "isFinal": true,
        "actions": []
      },
      {
        "value": 11,
        "label": "已取消",
        "type": "info",
        "isFinal": true,
        "actions": []
      }
    ]
  }
}
