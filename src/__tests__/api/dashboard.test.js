import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDashboardStats } from '@/api/dashboard'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

import request from '@/utils/request'

describe('dashboard.js - 仪表盘接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardStats - 获取数据看板统计数据', () => {
    it('应该发送 GET 请求到 /dashboard/stats', async () => {
      const mockResponse = {
        code: 200,
        data: {
          totalOrders: 100,
          totalRevenue: 50000,
          todayOrders: 10,
          period: 'week'
        }
      }
      request.mockResolvedValue(mockResponse)

      const result = await getDashboardStats()

      expect(request).toHaveBeenCalledWith({
        url: '/dashboard/stats',
        method: 'get',
        params: {}
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该支持传入查询参数', async () => {
      const params = { shop_id: 1, period: 'month' }
      const mockResponse = { code: 200, data: {} }
      request.mockResolvedValue(mockResponse)

      const result = await getDashboardStats(params)

      expect(request).toHaveBeenCalledWith({
        url: '/dashboard/stats',
        method: 'get',
        params
      })
      expect(result).toEqual(mockResponse)
    })

    it('默认参数应该是空对象', async () => {
      const mockResponse = { code: 200, data: {} }
      request.mockResolvedValue(mockResponse)

      await getDashboardStats()

      const callArgs = request.mock.calls[0][0]
      expect(callArgs.params).toEqual({})
    })
  })
})
