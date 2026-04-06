import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getShopList,
  createShop,
  updateShop,
  deleteShop,
  getShopDetail,
  uploadShopImage,
  getShopImageUrl,
  getShopTempToken,
  updateOrderStatusFlow,
  getCurrentShopId
} from '@/api/shop'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

vi.mock('@/utils/auth', () => ({
  getCurrentShopId: vi.fn(() => 'mock-shop-id')
}))

import request from '@/utils/request'

describe('shop.js - 店铺接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentShopId - 获取当前店铺ID', () => {
    it('应该返回从 auth 获取的店铺ID', () => {
      const shopId = getCurrentShopId()
      expect(shopId).toBe('mock-shop-id')
    })
  })

  describe('getShopList - 获取店铺列表', () => {
    it('应该发送 GET 请求到 /shop/list 并包含分页参数', async () => {
      const params = { page: 1, page_size: 10, search: 'test' }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getShopList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/list',
        method: 'get',
        params: {
          page: params.page,
          page_size: params.page_size,
          search: params.search
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createShop - 创建店铺', () => {
    it('应该发送 POST 请求到 /shop/create', async () => {
      const shopData = { name: '新店铺', address: '测试地址' }
      const mockResponse = { code: 200, data: { id: 1 } }
      request.mockResolvedValue(mockResponse)

      const result = await createShop(shopData)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/create',
        method: 'post',
        data: shopData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateShop - 更新店铺', () => {
    it('应该发送 PUT 请求到 /shop/update', async () => {
      const shopData = { id: 1, name: '更新后的店铺' }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateShop(shopData)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/update',
        method: 'put',
        data: shopData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteShop - 删除店铺', () => {
    it('应该发送 DELETE 请求到 /shop/delete 并包含 shop_id 参数', async () => {
      const shopId = 1
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await deleteShop(shopId)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/delete',
        method: 'delete',
        params: { shop_id: shopId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getShopDetail - 获取店铺详情', () => {
    it('应该发送 GET 请求到 /shop/detail 并包含 shop_id 参数', async () => {
      const shopId = 1
      const mockResponse = { code: 200, data: { id: 1, name: '测试店铺' } }
      request.mockResolvedValue(mockResponse)

      const result = await getShopDetail(shopId)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/detail',
        method: 'get',
        params: { shop_id: shopId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('uploadShopImage - 上传店铺图片', () => {
    it('应该发送 POST 请求到 /shop/upload-image，包含 FormData 和正确的 Content-Type', async () => {
      const id = 1
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const mockResponse = { code: 200, data: { path: '/images/test.png' } }
      request.mockResolvedValue(mockResponse)

      const result = await uploadShopImage(id, file)

      expect(request).toHaveBeenCalled()
      const callArgs = request.mock.calls[0][0]
      expect(callArgs.url).toBe('/shop/upload-image')
      expect(callArgs.method).toBe('post')
      expect(callArgs.params).toEqual({ id })
      expect(callArgs.data).toBeInstanceOf(FormData)
      expect(callArgs.headers['Content-Type']).toBe('multipart/form-data')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getShopImageUrl - 获取店铺图片URL', () => {
    it('空路径应该返回带空 path 参数的 URL', () => {
      expect(getShopImageUrl('')).toBe('/shop/image?path=')
      expect(getShopImageUrl(null)).toBe('/shop/image?path=null')
      expect(getShopImageUrl(undefined)).toBe('/shop/image?path=undefined')
    })

    it('完整URL路径应该被包含在参数中', () => {
      const url = 'https://example.com/image.png'
      expect(getShopImageUrl(url)).toBe('/shop/image?path=https://example.com/image.png')
    })

    it('以/开头的路径应该保留', () => {
      expect(getShopImageUrl('/path/to/image.jpg')).toBe('/shop/image?path=/path/to/image.jpg')
    })

    it('不以/开头的路径应该正确处理', () => {
      expect(getShopImageUrl('path/to/image.jpg')).toBe('/shop/image?path=path/to/image.jpg')
    })
  })

  describe('getShopTempToken - 获取店铺临时令牌', () => {
    it('应该发送 GET 请求到 /shop/temp-token', async () => {
      const shopId = 1
      const mockResponse = { code: 200, data: { tempToken: 'token-123' } }
      request.mockResolvedValue(mockResponse)

      const result = await getShopTempToken(shopId)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/temp-token',
        method: 'get',
        params: { shop_id: shopId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateOrderStatusFlow - 更新订单状态流转', () => {
    it('应该发送 PUT 请求到 /shop/update-order-status-flow', async () => {
      const flowData = { statuses: [] }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateOrderStatusFlow(flowData)

      expect(request).toHaveBeenCalledWith({
        url: '/shop/update-order-status-flow',
        method: 'put',
        data: flowData
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
