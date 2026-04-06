import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, logout, changePassword, refreshToken } from '@/api/auth'

vi.mock('@/utils/request', () => {
  const mockRequest = vi.fn()
  return {
    default: mockRequest,
    __mockRequest: mockRequest
  }
})

import request from '@/utils/request'

describe('auth.js - 认证接口', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login - 管理员登录', () => {
    it('应该发送 POST 请求到 /login', async () => {
      const mockData = { username: 'admin', password: '123456' }
      const mockResponse = { code: 200, data: { token: 'test-token' } }
      request.mockResolvedValue(mockResponse)

      const result = await login(mockData)

      expect(request).toHaveBeenCalledWith({
        url: '/login',
        method: 'post',
        data: mockData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('logout - 退出登录', () => {
    it('应该发送 POST 请求到 /logout', async () => {
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await logout()

      expect(request).toHaveBeenCalledWith({
        url: '/logout',
        method: 'post'
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('changePassword - 修改密码', () => {
    it('应该发送 POST 请求到 /change-password', async () => {
      const mockData = { oldPassword: 'old', newPassword: 'new123!' }
      const mockResponse = { code: 200 }
      request.mockResolvedValue(mockResponse)

      const result = await changePassword(mockData)

      expect(request).toHaveBeenCalledWith({
        url: '/change-password',
        method: 'post',
        data: mockData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('refreshToken - 刷新Token', () => {
    it('应该发送 POST 请求到 /refresh-token 并包含 refreshToken', async () => {
      const token = 'refresh-token-123'
      const mockResponse = { code: 200, data: { token: 'new-token', refreshToken: 'new-refresh' } }
      request.mockResolvedValue(mockResponse)

      const result = await refreshToken(token)

      expect(request).toHaveBeenCalledWith({
        url: '/refresh-token',
        method: 'post',
        data: { refreshToken: token }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
