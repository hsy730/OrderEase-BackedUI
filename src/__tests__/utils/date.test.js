import { describe, it, expect } from 'vitest'
import {
  formatTime,
  formatDate,
  getRelativeDateRange,
  getDateShortcuts,
  formatRelativeTime,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY
} from '@/utils/date'

describe('date.js - 日期时间工具函数', () => {
  describe('常量定义', () => {
    it('MS_PER_SECOND 应该等于 1000', () => {
      expect(MS_PER_SECOND).toBe(1000)
    })

    it('MS_PER_MINUTE 应该等于 60000', () => {
      expect(MS_PER_MINUTE).toBe(60 * 1000)
    })

    it('MS_PER_HOUR 应该等于 3600000', () => {
      expect(MS_PER_HOUR).toBe(60 * 60 * 1000)
    })

    it('MS_PER_DAY 应该等于 86400000', () => {
      expect(MS_PER_DAY).toBe(24 * 60 * 60 * 1000)
    })
  })

  describe('formatTime - 格式化时间', () => {
    it('应该正确格式化 Date 对象', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatTime(date)
      expect(result).toContain('2024')
      expect(result).toContain('01')
      expect(result).toContain('15')
      expect(result).toContain('14:30')
    })

    it('应该正确格式化时间戳', () => {
      const timestamp = new Date('2024-06-20T09:45:00').getTime()
      const result = formatTime(timestamp)
      expect(result).toContain('2024')
      expect(result).toContain('06')
      expect(result).toContain('20')
    })

    it('应该正确格式化日期字符串', () => {
      const result = formatTime('2024-12-25T23:59:59')
      expect(result).toContain('2024')
      expect(result).toContain('12')
      expect(result).toContain('25')
    })

    it('空值应该返回默认回退文本', () => {
      expect(formatTime(null)).toBe('暂无')
      expect(formatTime(undefined)).toBe('暂无')
      expect(formatTime('')).toBe('暂无')
    })

    it('无效日期应该返回默认回退文本', () => {
      expect(formatTime('invalid-date')).toBe('暂无')
      expect(formatTime('not-a-date')).toBe('暂无')
    })

    it('支持自定义回退文本', () => {
      expect(formatTime(null, 'N/A')).toBe('N/A')
      expect(formatTime(undefined, '-')).toBe('-')
    })
  })

  describe('formatDate - 格式化日期（不含时间）', () => {
    it('应该正确格式化日期，不包含时间部分', () => {
      const date = new Date('2024-03-10T14:30:00')
      const result = formatDate(date)
      expect(result).toBe('2024-03-10')
    })

    it('应该正确格式化时间戳', () => {
      const timestamp = new Date('2024-07-04T00:00:00').getTime()
      const result = formatDate(timestamp)
      expect(result).toBe('2024-07-04')
    })

    it('空值应该返回默认回退文本', () => {
      expect(formatDate(null)).toBe('暂无')
      expect(formatDate(undefined)).toBe('暂无')
    })

    it('无效日期应该返回默认回退文本', () => {
      expect(formatDate('invalid')).toBe('暂无')
    })
  })

  describe('getRelativeDateRange - 获取相对日期范围', () => {
    it('应该返回正确的日期范围', () => {
      const [start, end] = getRelativeDateRange(7)
      const diffDays = (end.getTime() - start.getTime()) / MS_PER_DAY
      expect(diffDays).toBeCloseTo(7, 0)
    })

    it('结束日期应该是当前时间', () => {
      const [, end] = getRelativeDateRange(1)
      const now = new Date()
      expect(end.getFullYear()).toBe(now.getFullYear())
      expect(end.getMonth()).toBe(now.getMonth())
      expect(end.getDate()).toBe(now.getDate())
    })

    it('30天范围应该计算正确', () => {
      const [start, end] = getRelativeDateRange(30)
      const diffDays = (end.getTime() - start.getTime()) / MS_PER_DAY
      expect(diffDays).toBeCloseTo(30, 0)
    })
  })

  describe('getDateShortcuts - 日期快捷选项', () => {
    it('应该返回5个快捷选项', () => {
      const shortcuts = getDateShortcuts()
      expect(shortcuts).toHaveLength(5)
    })

    it('应该包含"今天"选项', () => {
      const shortcuts = getDateShortcuts()
      const today = shortcuts.find(s => s.text === '今天')
      expect(today).toBeDefined()
      const [start, end] = today.value()
      expect(end.getDate() - start.getDate()).toBe(1)
    })

    it('应该包含"昨天"选项', () => {
      const shortcuts = getDateShortcuts()
      const yesterday = shortcuts.find(s => s.text === '昨天')
      expect(yesterday).toBeDefined()
    })

    it('应该包含"最近一周"选项', () => {
      const shortcuts = getDateShortcuts()
      const week = shortcuts.find(s => s.text === '最近一周')
      expect(week).toBeDefined()
    })

    it('应该包含"最近30天"选项', () => {
      const shortcuts = getDateShortcuts()
      const month = shortcuts.find(s => s.text === '最近30天')
      expect(month).toBeDefined()
    })

    it('应该包含"最近90天"选项', () => {
      const shortcuts = getDateShortcuts()
      const quarter = shortcuts.find(s => s.text === '最近90天')
      expect(quarter).toBeDefined()
    })
  })

  describe('formatRelativeTime - 相对时间格式化', () => {
    it('刚刚（小于1分钟）应该返回"刚刚"', () => {
      const now = Date.now()
      const result = formatRelativeTime(new Date(now - 30000))
      expect(result).toBe('刚刚')
    })

    it('几分钟前应该返回正确分钟数', () => {
      const now = Date.now()
      const result = formatRelativeTime(new Date(now - 5 * MS_PER_MINUTE))
      expect(result).toBe('5分钟前')
    })

    it('几小时前应该返回正确小时数', () => {
      const now = Date.now()
      const result = formatRelativeTime(new Date(now - 3 * MS_PER_HOUR))
      expect(result).toBe('3小时前')
    })

    it('几天前应该返回正确天数', () => {
      const now = Date.now()
      const result = formatRelativeTime(new Date(now - 2 * MS_PER_DAY))
      expect(result).toBe('2天前')
    })

    it('超过7天应该返回格式化日期', () => {
      const oldDate = new Date('2024-01-01')
      const result = formatRelativeTime(oldDate)
      expect(result).toContain('2024')
      expect(result).toContain('01')
    })

    it('空值应该返回空字符串', () => {
      expect(formatRelativeTime(null)).toBe('')
      expect(formatRelativeTime(undefined)).toBe('')
      expect(formatRelativeTime('')).toBe('')
    })
  })
})
