import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getOrderList,
  advanceSearchOrderList,
  getOrderDetail,
  createOrder,
  updateOrder,
  deleteOrder,
  toggleOrderStatus,
  getOrderStatusFlow
} from '@/api/order'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

import request from '@/utils/request'

describe('order.js - 订单接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrderList - 获取订单列表', () => {
    it('应该发送 GET 请求到 /order/list', async () => {
      const params = { page: 1, page_size: 10, status: 0 }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getOrderList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/order/list',
        method: 'get',
        params
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('advanceSearchOrderList - 高级搜索订单', () => {
    it('应该发送 POST 请求到 /order/advance-search', async () => {
      const searchData = { keyword: 'test', status: [0, 1], dateRange: [] }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await advanceSearchOrderList(searchData)

      expect(request).toHaveBeenCalledWith({
        url: '/order/advance-search',
        method: 'post',
        data: searchData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderDetail - 获取订单详情', () => {
    it('应该发送 GET 请求到 /order/detail 并包含 id 参数', async () => {
      const orderId = 1
      const mockResponse = { code: 200, data: { id: 1, status: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getOrderDetail(orderId)

      expect(request).toHaveBeenCalledWith({
        url: '/order/detail',
        method: 'get',
        params: { id: orderId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createOrder - 创建订单', () => {
    it('应该发送 POST 请求到 /order/create', async () => {
      const orderData = { items: [], customer_name: '测试' }
      const mockResponse = { code: 200, data: { id: 1 } }
      request.mockResolvedValue(mockResponse)

      const result = await createOrder(orderData)

      expect(request).toHaveBeenCalledWith({
        url: '/order/create',
        method: 'post',
        data: orderData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateOrder - 更新订单', () => {
    it('应该发送 PUT 请求到 /order/update，包含 id 参数和更新数据', async () => {
      const orderId = 1
      const updateData = { status: 1, remark: '已更新' }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateOrder(orderId, updateData)

      expect(request).toHaveBeenCalledWith({
        url: '/order/update',
        method: 'put',
        params: { id: orderId },
        data: updateData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteOrder - 删除订单', () => {
    it('应该发送 DELETE 请求到 /order/delete 并包含 id 参数', async () => {
      const orderId = 1
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await deleteOrder(orderId)

      expect(request).toHaveBeenCalledWith({
        url: '/order/delete',
        method: 'delete',
        params: { id: orderId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('toggleOrderStatus - 翻转订单状态', () => {
    it('应该发送 PUT 请求到 /order/toggle-status，包含完整的状态数据', async () => {
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await toggleOrderStatus(1, 100, 10)

      expect(request).toHaveBeenCalledWith({
        url: '/order/toggle-status',
        method: 'put',
        data: { id: 1, shop_id: 100, next_status: 10 }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getOrderStatusFlow - 获取订单状态流转配置', () => {
    it('应该发送 GET 请求到 /order/status-flow 并包含 shop_id 参数', async () => {
      const shopId = 1
      const mockResponse = { code: 200, data: { statuses: [] } }
      request.mockResolvedValue(mockResponse)

      const result = await getOrderStatusFlow(shopId)

      expect(request).toHaveBeenCalledWith({
        url: '/order/status-flow',
        method: 'get',
        params: { shop_id: shopId }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
