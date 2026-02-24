/**
 * 状态映射工具函数
 * 统一管理所有状态码和显示文本的映射
 */

// ==================== 订单状态 ====================

/**
 * 订单状态映射
 */
export const ORDER_STATUS = {
  PENDING: { value: 1, label: '待处理', type: 'warning' },
  ACCEPTED: { value: 2, label: '已接单', type: 'primary' },
  PREPARING: { value: 3, label: '备货中', type: 'info' },
  SHIPPED: { value: 4, label: '已发货', type: 'success' },
  COMPLETED: { value: 10, label: '已完成', type: 'success' },
  CANCELLED: { value: -1, label: '已取消', type: 'danger' }
}

/**
 * 获取订单状态显示文本
 * @param {number} status - 状态码
 * @returns {string} 状态文本
 */
export function getOrderStatusLabel(status) {
  const found = Object.values(ORDER_STATUS).find(item => item.value === status)
  return found?.label || '未知状态'
}

/**
 * 获取订单状态类型（用于el-tag）
 * @param {number} status - 状态码
 * @returns {string} 状态类型
 */
export function getOrderStatusType(status) {
  const found = Object.values(ORDER_STATUS).find(item => item.value === status)
  return found?.type || 'info'
}

/**
 * 获取订单状态选项列表
 * @returns {Array} 状态选项数组
 */
export function getOrderStatusOptions() {
  return Object.values(ORDER_STATUS).map(item => ({
    value: item.value,
    label: item.label
  }))
}

// ==================== 商品状态 ====================

/**
 * 商品状态映射
 */
export const PRODUCT_STATUS = {
  ONLINE: { value: 'online', label: '已上架', type: 'success' },
  OFFLINE: { value: 'offline', label: '已下架', type: 'info' }
}

/**
 * 获取商品状态显示文本
 * @param {string} status - 状态码
 * @returns {string} 状态文本
 */
export function getProductStatusLabel(status) {
  const found = Object.values(PRODUCT_STATUS).find(item => item.value === status)
  return found?.label || '未知状态'
}

/**
 * 获取商品状态类型（用于el-tag）
 * @param {string} status - 状态码
 * @returns {string} 状态类型
 */
export function getProductStatusType(status) {
  const found = Object.values(PRODUCT_STATUS).find(item => item.value === status)
  return found?.type || 'info'
}

/**
 * 获取商品状态选项列表
 * @returns {Array} 状态选项数组
 */
export function getProductStatusOptions() {
  return Object.values(PRODUCT_STATUS).map(item => ({
    value: item.value,
    label: item.label
  }))
}

// ==================== 用户角色 ====================

/**
 * 用户角色映射
 */
export const USER_ROLE = {
  ADMIN: { value: 'admin', label: '管理员' },
  USER: { value: 'user', label: '普通用户' },
  SYSTEM: { value: 'system', label: '公共用户' },
  PUBLIC_USER: { value: 'public_user', label: '公共用户' },
  PRIVATE_USER: { value: 'private_user', label: '普通用户' }
}

/**
 * 获取用户角色显示文本
 * @param {string} role - 角色码
 * @returns {string} 角色文本
 */
export function getUserRoleLabel(role) {
  const found = Object.values(USER_ROLE).find(item => item.value === role)
  return found?.label || '未知角色'
}

/**
 * 获取用户角色选项列表
 * @returns {Array} 角色选项数组
 */
export function getUserRoleOptions() {
  return Object.values(USER_ROLE).map(item => ({
    value: item.value,
    label: item.label
  }))
}

// ==================== 通用状态 ====================

/**
 * 通用启用/禁用状态
 */
export const COMMON_STATUS = {
  ENABLED: { value: 1, label: '启用', type: 'success' },
  DISABLED: { value: 0, label: '禁用', type: 'danger' }
}

/**
 * 获取通用状态显示文本
 * @param {number} status - 状态码
 * @returns {string} 状态文本
 */
export function getCommonStatusLabel(status) {
  const found = Object.values(COMMON_STATUS).find(item => item.value === status)
  return found?.label || '未知'
}

/**
 * 获取通用状态类型
 * @param {number} status - 状态码
 * @returns {string} 状态类型
 */
export function getCommonStatusType(status) {
  const found = Object.values(COMMON_STATUS).find(item => item.value === status)
  return found?.type || 'info'
}
