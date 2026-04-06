import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getSimpleUserList,
  createUser,
  getUserList,
  deleteUser,
  updateUser
} from '@/api/user'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

import request from '@/utils/request'

describe('user.js - 用户接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSimpleUserList - 获取简单用户列表', () => {
    it('应该发送 GET 请求到 /user/simple-list', async () => {
      const params = { page: 1, page_size: 10 }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getSimpleUserList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/user/simple-list',
        method: 'get',
        params
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createUser - 创建用户', () => {
    it('应该发送 POST 请求到 /admin/user/create', async () => {
      const userData = { username: 'testuser', password: '123456', role: 'user' }
      const mockResponse = { code: 200, data: { id: 1 } }
      request.mockResolvedValue(mockResponse)

      const result = await createUser(userData)

      expect(request).toHaveBeenCalledWith({
        url: '/admin/user/create',
        method: 'post',
        data: userData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getUserList - 获取用户列表', () => {
    it('应该发送 GET 请求到 /admin/user/list', async () => {
      const params = { page: 1, page_size: 20, role: 'user' }
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      const result = await getUserList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/admin/user/list',
        method: 'get',
        params
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteUser - 删除用户', () => {
    it('应该发送 DELETE 请求到 /admin/user/delete 并包含参数', async () => {
      const params = { id: 1 }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await deleteUser(params)

      expect(request).toHaveBeenCalledWith({
        url: '/admin/user/delete',
        method: 'delete',
        params
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateUser - 更新用户', () => {
    it('应该发送 PUT 请求到 /admin/user/update', async () => {
      const userData = { id: 1, username: 'updated', role: 'admin' }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await updateUser(userData)

      expect(request).toHaveBeenCalledWith({
        url: '/admin/user/update',
        method: 'put',
        data: userData
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
