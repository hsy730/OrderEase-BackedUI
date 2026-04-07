import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatTime - 格式化时间为本地字符串', () => {
    it('应该正确格式化Date对象', () => {
      vi.setSystemTime(new Date('2024-01-15T14:30:00'))
      const result = formatTime(new Date('2024-01-15T14:30:00'))

      expect(result).toBe('2024-01-15 14:30')
    })

    it('应该正确格式化时间戳', () => {
      const timestamp = new Date('2024-06-20T09:45:00').getTime()
      const result = formatTime(timestamp)

      expect(result).toContain('2024-06-20')
      expect(result).toContain('09:45')
    })

    it('应该正确格式化日期字符串', () => {
      const result = formatTime('2024-12-25T23:59:59')

      expect(result).toContain('2024-12-25')
      expect(result).toContain('23:59')
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

    it('应该支持自定义回退文本', () => {
      expect(formatTime(null, 'N/A')).toBe('N/A')
      expect(formatTime('', '-')).toBe('-')
    })
  })

  describe('formatDate - 格式化日期（不含时间）', () => {
    it('应该正确格式化日期', () => {
      const result = formatDate(new Date('2024-03-10T00:00:00'))

      expect(result).toBe('2024-03-10')
    })

    it('不应该包含时间部分', () => {
      const result = formatDate(new Date('2024-07-04T18:30:00'))

      expect(result).toBe('2024-07-04')
      expect(result).not.toContain('18:30')
    })

    it('空值应该返回默认回退文本', () => {
      expect(formatDate(null)).toBe('暂无')
      expect(formatDate(undefined)).toBe('暂无')
    })

    it('无效日期应该返回默认回退文本', () => {
      expect(formatDate('invalid')).toBe('暂无')
    })
  })

  describe('getRelativeDateRange - 获取相对时间的日期范围', () => {
    it('应该返回正确的日期范围（7天前到现在）', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      
      const [start, end] = getRelativeDateRange(7)

      expect(end.getTime()).toBe(new Date('2024-01-15T12:00:00').getTime())
      expect(start.getTime()).toBe(new Date('2024-01-08T12:00:00').getTime())
    })

    it('应该返回正确的日期范围（30天前到现在）', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      
      const [start, end] = getRelativeDateRange(30)

      expect(end.getTime()).toBe(new Date('2024-01-15T12:00:00').getTime())
      expect(start.getTime()).toBe(new Date('2023-12-16T12:00:00').getTime())
    })

    it('0天应该返回相同的时间', () => {
      const now = new Date()
      vi.setSystemTime(now)
      
      const [start, end] = getRelativeDateRange(0)

      expect(start.getTime()).toBe(end.getTime())
    })
  })

  describe('getDateShortcuts - 日期快捷选项配置', () => {
    it('应该返回5个快捷选项', () => {
      const shortcuts = getDateShortcuts()

      expect(shortcuts).toHaveLength(5)
    })

    it('应该包含今天、昨天、最近一周、最近30天、最近90天', () => {
      const shortcuts = getDateShortcuts()

      const texts = shortcuts.map(s => s.text)
      expect(texts).toContain('今天')
      expect(texts).toContain('昨天')
      expect(texts).toContain('最近一周')
      expect(texts).toContain('最近30天')
      expect(texts).toContain('最近90天')
    })

    it('每个选项都应该有value函数返回日期范围', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      
      const shortcuts = getDateShortcuts()

      shortcuts.forEach(shortcut => {
        const range = shortcut.value()
        expect(range).toHaveLength(2)
        expect(range[0]).toBeInstanceOf(Date)
        expect(range[1]).toBeInstanceOf(Date)
        expect(range[0].getTime()).toBeLessThanOrEqual(range[1].getTime())
      })
    })

    it('"今天"选项应该返回今天的日期范围', () => {
      vi.setSystemTime(new Date('2024-01-15T15:30:00'))
      
      const shortcuts = getDateShortcuts()
      const todayShortcut = shortcuts.find(s => s.text === '今天')
      const [start, end] = todayShortcut.value()

      expect(start).toBeInstanceOf(Date)
      expect(end).toBeInstanceOf(Date)
    })

    it('"昨天"选项应该返回昨天的日期范围', () => {
      vi.setSystemTime(new Date('2024-01-15T15:30:00'))
      
      const shortcuts = getDateShortcuts()
      const yesterdayShortcut = shortcuts.find(s => s.text === '昨天')
      const [start, end] = yesterdayShortcut.value()

      expect(start).toBeInstanceOf(Date)
      expect(end).toBeInstanceOf(Date)
    })
  })

  describe('formatRelativeTime - 格式化时间戳为相对时间', () => {
    it('小于1分钟应该显示"刚刚"', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:30'))
      
      const result = formatRelativeTime(new Date('2024-01-15T12:00:00'))

      expect(result).toBe('刚刚')
    })

    it('几分钟前应该显示"X分钟前"', () => {
      vi.setSystemTime(new Date('2024-01-15T12:05:00'))
      
      const result = formatRelativeTime(new Date('2024-01-15T12:00:00'))

      expect(result).toBe('5分钟前')
    })

    it('几小时前应该显示"X小时前"', () => {
      vi.setSystemTime(new Date('2024-01-15T15:00:00'))
      
      const result = formatRelativeTime(new Date('2024-01-15T12:00:00'))

      expect(result).toBe('3小时前')
    })

    it('几天前应该显示"X天前"', () => {
      vi.setSystemTime(new Date('2024-01-18T12:00:00'))
      
      const result = formatRelativeTime(new Date('2024-01-15T12:00:00'))

      expect(result).toBe('3天前')
    })

    it('超过7天应该显示完整日期', () => {
      vi.setSystemTime(new Date('2024-01-25T12:00:00'))
      
      const result = formatRelativeTime(new Date('2024-01-15T12:00:00'))

      expect(result).toContain('2024-01-15')
    })

    it('空值应该返回空字符串', () => {
      expect(formatRelativeTime(null)).toBe('')
      expect(formatRelativeTime(undefined)).toBe('')
      expect(formatRelativeTime('')).toBe('')
    })

    it('未来的时间应该显示为日期格式', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      
      const result = formatRelativeTime(new Date('2024-01-20T12:00:00'))

      expect(result).toBeDefined()
    })
  })

  describe('时间常量定义', () => {
    it('常量值应该正确', () => {
      expect(MS_PER_SECOND).toBe(1000)
      expect(MS_PER_MINUTE).toBe(60000)
      expect(MS_PER_HOUR).toBe(3600000)
      expect(MS_PER_DAY).toBe(86400000)
    })
  })
})
