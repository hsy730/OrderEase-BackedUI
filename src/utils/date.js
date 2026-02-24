/**
 * 日期时间工具函数
 */

// 常量定义
export const MS_PER_SECOND = 1000
export const MS_PER_MINUTE = 60 * 1000
export const MS_PER_HOUR = 60 * 60 * 1000
export const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * 格式化时间为本地字符串
 * @param {string|number|Date} time - 时间
 * @param {string} fallback - 为空时的回退文本
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, fallback = '暂无') {
  if (!time) return fallback

  const date = new Date(time)
  if (isNaN(date.getTime())) return fallback

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

/**
 * 格式化日期（不含时间）
 * @param {string|number|Date} time - 时间
 * @param {string} fallback - 为空时的回退文本
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(time, fallback = '暂无') {
  if (!time) return fallback

  const date = new Date(time)
  if (isNaN(date.getTime())) return fallback

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

/**
 * 获取相对时间的日期范围
 * @param {number} days - 天数
 * @returns {[Date, Date]} [开始日期, 结束日期]
 */
export function getRelativeDateRange(days) {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - MS_PER_DAY * days)
  return [start, end]
}

/**
 * 日期快捷选项配置
 * @returns {Array} 日期快捷选项数组
 */
export function getDateShortcuts() {
  return [
    {
      text: '今天',
      value: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return [today, tomorrow]
      }
    },
    {
      text: '昨天',
      value: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return [yesterday, today]
      }
    },
    {
      text: '最近一周',
      value: () => getRelativeDateRange(7)
    },
    {
      text: '最近30天',
      value: () => getRelativeDateRange(30)
    },
    {
      text: '最近90天',
      value: () => getRelativeDateRange(90)
    }
  ]
}

/**
 * 格式化时间戳为相对时间
 * @param {string|number|Date} time - 时间
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(time) {
  if (!time) return ''

  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < MS_PER_MINUTE) {
    return '刚刚'
  } else if (diff < MS_PER_HOUR) {
    return `${Math.floor(diff / MS_PER_MINUTE)}分钟前`
  } else if (diff < MS_PER_DAY) {
    return `${Math.floor(diff / MS_PER_HOUR)}小时前`
  } else if (diff < MS_PER_DAY * 7) {
    return `${Math.floor(diff / MS_PER_DAY)}天前`
  } else {
    return formatDate(time)
  }
}
