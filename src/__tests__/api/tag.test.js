import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTagList,
  getTagDetail,
  getTagBoundProducts,
  createTag,
  updateTag,
  deleteTag,
  batchUpdateTags,
  getTagProducts,
  getProductTags,
  getAvailableTags,
  unbindProductTag,
  bindProductTag,
  getUnboundProducts
} from '@/api/tag'

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

describe('tag.js - 标签接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTagList - 获取标签列表', () => {
    it('应该发送 GET 请求到 /tag/list', async () => {
      const params = { page: 1, page_size: 10 }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getTagList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/list',
        method: 'get',
        params
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTagDetail - 获取标签详情', () => {
    it('应该发送 GET 请求到 /tag/detail 并包含 id 参数', async () => {
      const tagId = 1
      const mockResponse = { code: 200, data: { id: 1, name: '测试标签' } }
      request.mockResolvedValue(mockResponse)

      const result = await getTagDetail(tagId)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/detail',
        method: 'get',
        params: { id: tagId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTagBoundProducts - 获取标签已绑定的商品列表', () => {
    it('应该发送 GET 请求到 /tag/bound-products 并包含 tag_id 和分页参数', async () => {
      const tagId = 1
      const params = { page: 2, pageSize: 20 }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getTagBoundProducts(tagId, params)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/bound-products',
        method: 'get',
        params: {
          tag_id: tagId,
          page: params.page,
          pageSize: params.pageSize
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('不传分页参数时应该使用默认值', async () => {
      const tagId = 1
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      await getTagBoundProducts(tagId)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/bound-products',
        method: 'get',
        params: {
          tag_id: tagId,
          page: 1,
          pageSize: 10
        }
      })
    })
  })

  describe('createTag - 创建标签', () => {
    it('应该发送 POST 请求到 /tag/create', async () => {
      const tagData = { name: '新标签' }
      const mockResponse = { code: 200, data: { id: 1 } }
      request.mockResolvedValue(mockResponse)

      const result = await createTag(tagData)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/create',
        method: 'post',
        data: tagData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateTag - 更新标签', () => {
    it('应该发送 PUT 请求到 /tag/update', async () => {
      const tagData = { id: 1, name: '更新后的标签' }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateTag(tagData)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/update',
        method: 'put',
        data: tagData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteTag - 删除标签', () => {
    it('应该发送 DELETE 请求到 /tag/delete 并包含 id 参数', async () => {
      const tagId = 1
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await deleteTag(tagId)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/delete',
        method: 'delete',
        params: { id: tagId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('batchUpdateTags - 批量更新标签（绑定商品）', () => {
    it('应该发送 POST 请求到 /tag/batch-tag-product', async () => {
      const productId = 1
      const tags = [1, 2, 3]
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await batchUpdateTags(productId, tags)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/batch-tag-product',
        method: 'post',
        data: {
          product_id: productId,
          tag_Ids: tags
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTagProducts - 获取标签关联的已上架商品列表', () => {
    it('应该发送 GET 请求到 /tag/online-products 并包含 shop_id', async () => {
      const params = { page: 1, pageSize: 10 }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getTagProducts(params)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/online-products',
        method: 'get',
        params: { ...params, shop_id: 'mock-shop-id' }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getProductTags - 获取商品已绑定标签', () => {
    it('应该发送 GET 请求到 /tag/bound-tags 并包含 product_id', async () => {
      const productId = 1
      const mockResponse = { code: 200, data: [] }
      request.mockResolvedValue(mockResponse)

      const result = await getProductTags(productId)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/bound-tags',
        method: 'get',
        params: { product_id: productId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAvailableTags - 获取商品未绑定标签', () => {
    it('应该发送 GET 请求到 /tag/unbound-tags 并包含 product_id', async () => {
      const productId = 1
      const mockResponse = { code: 200, data: [] }
      request.mockResolvedValue(mockResponse)

      const result = await getAvailableTags(productId)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/unbound-tags',
        method: 'get',
        params: { product_id: productId }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('unbindProductTag - 批量解绑商品标签', () => {
    it('应该发送 DELETE 请求到 /tag/batch-untag', async () => {
      const tagId = 1
      const productIds = [1, 2, 3]
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await unbindProductTag(tagId, productIds)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/batch-untag',
        method: 'delete',
        data: {
          tag_id: Number(tagId),
          product_ids: productIds
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('tagId 应该被转换为数字类型', async () => {
      const tagId = '5'
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      await unbindProductTag(tagId, [1])

      const callArgs = request.mock.calls[0][0]
      expect(callArgs.data.tag_id).toBe(5)
      expect(typeof callArgs.data.tag_id).toBe('number')
    })
  })

  describe('bindProductTag - 批量绑定商品标签', () => {
    it('应该发送 POST 请求到 /tag/batch-tag', async () => {
      const tagId = 1
      const productIds = [4, 5, 6]
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await bindProductTag(tagId, productIds)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/batch-tag',
        method: 'post',
        data: {
          tag_id: Number(tagId),
          product_ids: productIds
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('tagId 应该被转换为数字类型', async () => {
      const tagId = '10'
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      await bindProductTag(tagId, [1])

      const callArgs = request.mock.calls[0][0]
      expect(callArgs.data.tag_id).toBe(10)
      expect(typeof callArgs.data.tag_id).toBe('number')
    })
  })

  describe('getUnboundProducts - 获取标签未绑定的商品列表', () => {
    it('应该发送 GET 请求到 /tag/unbound-products 并包含正确的参数', async () => {
      const tagId = 1
      const params = { page: 2, limit: 20 }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getUnboundProducts(tagId, params)

      expect(request).toHaveBeenCalledWith({
        url: '/tag/unbound-products',
        method: 'get',
        params: {
          tag_id: tagId,
          page: params.page,
          pageSize: params.limit
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
