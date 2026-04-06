import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportData, importData } from '@/api/migration'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

import request from '@/utils/request'

describe('migration.js - 数据迁移接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportData - 导出数据', () => {
    it('应该发送 GET 请求到 /admin/data/export，responseType 为 blob', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' })
      const mockResponse = { data: mockBlob, status: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await exportData()

      expect(request).toHaveBeenCalledWith({
        url: '/admin/data/export',
        method: 'get',
        responseType: 'blob'
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('importData - 导入数据', () => {
    it('应该发送 POST 请求到 /admin/data/import，包含 FormData 和正确的 Content-Type', async () => {
      const formData = new FormData()
      formData.append('file', new File(['test'], 'data.json'))
      const mockResponse = { code: 200, message: '导入成功' }
      request.mockResolvedValue(mockResponse)

      const result = await importData(formData)

      expect(request).toHaveBeenCalledWith({
        url: '/admin/data/import',
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
