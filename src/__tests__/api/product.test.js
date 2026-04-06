import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getProductList,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductImageUrl,
  updateProductStatus
} from '@/api/product'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

vi.mock('@/api/shop', () => ({
  getCurrentShopId: vi.fn(() => 'mock-shop-id')
}))

import request from '@/utils/request'

describe('product.js - 商品接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProductList - 获取商品列表', () => {
    it('应该发送 GET 请求到 /product/list', async () => {
      const params = { page: 1, page_size: 10, search: '商品' }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getProductList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/product/list',
        method: 'get',
        params
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getProductDetail - 获取商品详情', () => {
    it('应该发送 GET 请求到 /product/detail 并包含 id 参数', async () => {
      const productId = 1
      const mockResponse = { code: 200, data: { id: 1, name: '测试商品' } }
      request.mockResolvedValue(mockResponse)

      const result = await getProductDetail(productId)

      expect(request).toHaveBeenCalledWith({
        url: '/product/detail',
        method: 'get',
        params: { id: productId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createProduct - 创建商品', () => {
    it('应该发送 POST 请求到 /product/create', async () => {
      const productData = { name: '新商品', price: 99.9 }
      const mockResponse = { code: 200, data: { id: 1 } }
      request.mockResolvedValue(mockResponse)

      const result = await createProduct(productData)

      expect(request).toHaveBeenCalledWith({
        url: '/product/create',
        method: 'post',
        data: productData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateProduct - 更新商品', () => {
    it('应该发送 PUT 请求到 /product/update，包含 id 参数和更新数据', async () => {
      const productId = 1
      const updateData = { name: '更新后的商品', price: 199.9 }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateProduct(productId, updateData)

      expect(request).toHaveBeenCalledWith({
        url: '/product/update',
        method: 'put',
        params: { id: productId },
        data: updateData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteProduct - 删除商品', () => {
    it('应该发送 DELETE 请求到 /product/delete，包含 id 和 shop_id 参数', async () => {
      const productId = 1
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await deleteProduct(productId)

      expect(request).toHaveBeenCalledWith({
        url: '/product/delete',
        method: 'delete',
        params: { id: productId, shop_id: 'mock-shop-id' }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('uploadProductImage - 上传商品图片', () => {
    it('应该发送 POST 请求到 /product/upload-image，包含 FormData 和正确的 Content-Type', async () => {
      const id = 1
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const mockResponse = { code: 200, data: { path: '/images/product.png' } }
      request.mockResolvedValue(mockResponse)

      const result = await uploadProductImage(id, file)

      expect(request).toHaveBeenCalled()
      const callArgs = request.mock.calls[0][0]
      expect(callArgs.url).toBe('/product/upload-image')
      expect(callArgs.method).toBe('post')
      expect(callArgs.params).toEqual({ id })
      expect(callArgs.data).toBeInstanceOf(FormData)
      expect(callArgs.headers['Content-Type']).toBe('multipart/form-data')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getProductImageUrl - 获取商品图片URL', () => {
    it('空路径应该返回空字符串', () => {
      expect(getProductImageUrl('')).toBe('')
      expect(getProductImageUrl(null)).toBe('')
      expect(getProductImageUrl(undefined)).toBe('')
    })

    it('完整URL路径（http开头）应该直接返回', () => {
      const url = 'https://example.com/image.png'
      expect(getProductImageUrl(url)).toBe(url)

      const httpUrl = 'http://cdn.example.com/photo.jpg'
      expect(getProductImageUrl(httpUrl)).toBe(httpUrl)
    })

    it('以/开头的路径应该去掉开头的/', () => {
      expect(getProductImageUrl('/path/to/image.jpg')).toBe('/product/image?path=path/to/image.jpg')
    })

    it('不以/开头的路径应该正确处理', () => {
      expect(getProductImageUrl('path/to/image.jpg')).toBe('/product/image?path=path/to/image.jpg')
    })
  })

  describe('updateProductStatus - 更新商品状态', () => {
    it('应该发送 PUT 请求到 /product/toggle-status', async () => {
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateProductStatus(1, 'offline')

      expect(request).toHaveBeenCalledWith({
        url: '/product/toggle-status',
        method: 'put',
        data: { id: 1, status: 'offline' }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
