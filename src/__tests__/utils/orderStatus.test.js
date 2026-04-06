import { describe, it, expect } from 'vitest'
import {
  getStatusText,
  getStatusType,
  getAvailableActions,
  getDefaultOrderStatusFlow
} from '@/utils/orderStatus'

describe('orderStatus.js - 订单状态工具函数', () => {
  describe('getStatusText - 获取状态文本', () => {
    it('默认状态：待处理(0)应该返回"待处理"', () => {
      expect(getStatusText(0)).toBe('待处理')
    })

    it('默认状态：已接单(1)应该返回"已接单"', () => {
      expect(getStatusText(1)).toBe('已接单')
    })

    it('默认状态：已完成(10)应该返回"已完成"', () => {
      expect(getStatusText(10)).toBe('已完成')
    })

    it('默认状态：已取消(11)应该返回"已取消"', () => {
      expect(getStatusText(11)).toBe('已取消')
    })

    it('未知状态应该返回"未知状态"', () => {
      expect(getStatusText(999)).toBe('未知状态')
      expect(getStatusText(-1)).toBe('未知状态')
      expect(getStatusText(undefined)).toBe('未知状态')
    })

    it('支持字符串类型的状态值', () => {
      expect(getStatusText('0')).toBe('待处理')
      expect(getStatusText('1')).toBe('已接单')
    })

    it('使用店铺自定义配置时应该返回自定义文本', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            { value: 0, label: '新订单', type: 'warning' },
            { value: 5, label: '配送中', type: 'primary' }
          ]
        }
      }
      expect(getStatusText(0, shop)).toBe('新订单')
      expect(getStatusText(5, shop)).toBe('配送中')
    })

    it('店铺配置中的状态不在列表中应使用默认映射', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            { value: 0, label: '新订单', type: 'warning' }
          ]
        }
      }
      expect(getStatusText(1, shop)).toBe('已接单')
    })

    it('order_status_flow 是字符串时应能解析', () => {
      const shop = {
        order_status_flow: JSON.stringify({
          statuses: [
            { value: 0, label: '解析成功', type: 'warning' }
          ]
        })
      }
      expect(getStatusText(0, shop)).toBe('解析成功')
    })

    it('无效的 order_status_flow 字符串应回退到默认映射', () => {
      const shop = {
        order_status_flow: 'invalid json'
      }
      expect(getStatusText(0, shop)).toBe('待处理')
    })
  })

  describe('getStatusType - 获取状态类型', () => {
    it('默认状态：待处理(0)应该返回"warning"', () => {
      expect(getStatusType(0)).toBe('warning')
    })

    it('默认状态：已接单(1)应该返回"primary"', () => {
      expect(getStatusType(1)).toBe('primary')
    })

    it('默认状态：已完成(10)应该返回"success"', () => {
      expect(getStatusType(10)).toBe('success')
    })

    it('默认状态：已取消(11)应该返回"info"', () => {
      expect(getStatusType(11)).toBe('info')
    })

    it('未知状态应该返回"info"', () => {
      expect(getStatusType(999)).toBe('info')
    })

    it('使用店铺自定义配置时应该返回自定义类型', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            { value: 0, label: '待处理', type: 'danger' }
          ]
        }
      }
      expect(getStatusType(0, shop)).toBe('danger')
    })

    it('order_status_flow 是字符串时应能解析', () => {
      const shop = {
        order_status_flow: JSON.stringify({
          statuses: [
            { value: 1, label: '已接单', type: 'danger' }
          ]
        })
      }
      expect(getStatusType(1, shop)).toBe('danger')
    })
  })

  describe('getAvailableActions - 获取可用动作', () => {
    it('非终态状态应该返回动作列表', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            {
              value: 0,
              isFinal: false,
              actions: [
                { name: '接单', nextStatus: 1, nextStatusLabel: '已接单' }
              ]
            }
          ]
        }
      }
      const actions = getAvailableActions(0, shop)
      expect(actions).toHaveLength(1)
      expect(actions[0].name).toBe('接单')
    })

    it('终态状态应该返回空数组', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            {
              value: 10,
              isFinal: true,
              actions: []
            }
          ]
        }
      }
      const actions = getAvailableActions(10, shop)
      expect(actions).toEqual([])
    })

    it('没有店铺配置时应该返回空数组', () => {
      expect(getAvailableActions(0)).toEqual([])
      expect(getAvailableActions(1)).toEqual([])
    })

    it('没有 actions 字段时应该返回空数组', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            {
              value: 0,
              isFinal: false
            }
          ]
        }
      }
      const actions = getAvailableActions(0, shop)
      expect(actions).toEqual([])
    })

    it('支持多个动作', () => {
      const shop = {
        order_status_flow: {
          statuses: [
            {
              value: 0,
              isFinal: false,
              actions: [
                { name: '接单', nextStatus: 1, nextStatusLabel: '已接单' },
                { name: '取消', nextStatus: 11, nextStatusLabel: '已取消' }
              ]
            }
          ]
        }
      }
      const actions = getAvailableActions(0, shop)
      expect(actions).toHaveLength(2)
    })
  })

  describe('getDefaultOrderStatusFlow - 获取默认订单状态流转', () => {
    it('应该返回完整的默认状态流转配置', () => {
      const flow = getDefaultOrderStatusFlow()

      expect(flow).toHaveProperty('statuses')
      expect(flow.statuses).toHaveLength(4)

      const statusValues = flow.statuses.map(s => s.value)
      expect(statusValues).toContain(0)
      expect(statusValues).toContain(1)
      expect(statusValues).toContain(10)
      expect(statusValues).toContain(11)
    })

    it('待处理状态应该有两个动作', () => {
      const flow = getDefaultOrderStatusFlow()
      const pending = flow.statuses.find(s => s.value === 0)
      expect(pending.isFinal).toBe(false)
      expect(pending.actions).toHaveLength(2)
      expect(pending.actions[0].name).toBe('接单')
      expect(pending.actions[1].name).toBe('取消')
    })

    it('已完成和已取消应该是终态', () => {
      const flow = getDefaultOrderStatusFlow()
      const completed = flow.statuses.find(s => s.value === 10)
      const canceled = flow.statuses.find(s => s.value === 11)
      expect(completed.isFinal).toBe(true)
      expect(canceled.isFinal).toBe(true)
      expect(completed.actions).toEqual([])
      expect(canceled.actions).toEqual([])
    })
  })
})
