import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  needRefreshToken,
  getAdminInfo,
  getToken,
  getRefreshToken,
  saveAdminInfo,
  isAdminRole,
  getCurrentShopId,
  setCurrentShopId,
  clearAuthInfo,
  getUserRole,
  getRolePrefix
} from '@/utils/auth'

const localStorageMock = (function() {
  let store = {}
  return {
    getItem: function(key) { return store[key] || null },
    setItem: function(key, value) { store[key] = value },
    removeItem: function(key) { delete store[key] },
    clear: function() { store = {} }
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

if (typeof window === 'undefined') {
  globalThis.window = { atob: (str) => Buffer.from(str, 'base64').toString('binary') }
}

describe('auth.js - 认证工具函数', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('needRefreshToken - 检查token是否需要刷新', () => {
    it('空 token 应该返回 false', () => {
      expect(needRefreshToken(null)).toBe(false)
      expect(needRefreshToken(undefined)).toBe(false)
      expect(needRefreshToken('')).toBe(false)
    })

    it('即将过期（10分钟内）的 token 应该返回 true', () => {
      const now = Date.now()
      const exp = Math.floor((now + 5 * 60 * 1000) / 1000) // 5分钟后过期
      const payload = btoa(JSON.stringify({ exp }))
      const token = `header.${payload}.signature`

      expect(needRefreshToken(token)).toBe(true)
    })

    it('未过期的 token 应该返回 false', () => {
      const now = Date.now()
      const exp = Math.floor((now + 60 * 60 * 1000) / 1000) // 1小时后过期
      const payload = btoa(JSON.stringify({ exp }))
      const token = `header.${payload}.signature`

      expect(needRefreshToken(token)).toBe(false)
    })

    it('无效的 token 应该返回 true（解析失败时默认需要刷新）', () => {
      expect(needRefreshToken('invalid-token')).toBe(true)
      expect(needRefreshToken('not.a.jwt')).toBe(true)
    })
  })

  describe('getAdminInfo - 获取管理员信息', () => {
    it('应该从 localStorage 获取管理员信息', () => {
      const adminData = { token: 'test-token', role: 'admin' }
      localStorage.setItem('admin', JSON.stringify(adminData))

      expect(getAdminInfo()).toEqual(adminData)
    })

    it('localStorage 中没有数据时应该返回空对象', () => {
      expect(getAdminInfo()).toEqual({})
    })

    it('localStorage 数据格式错误时应该返回空对象', () => {
      localStorage.setItem('admin', 'invalid-json')
      expect(getAdminInfo()).toEqual({})
    })
  })

  describe('getToken - 获取 token', () => {
    it('应该返回存储的 token', () => {
      saveAdminInfo({ token: 'my-token' })
      expect(getToken()).toBe('my-token')
    })

    it('没有 token 时应该返回 null', () => {
      expect(getToken()).toBeNull()
    })
  })

  describe('getRefreshToken - 获取 refreshToken', () => {
    it('应该返回存储的 refreshToken', () => {
      saveAdminInfo({ refreshToken: 'my-refresh-token' })
      expect(getRefreshToken()).toBe('my-refresh-token')
    })

    it('没有 refreshToken 时应该返回 null', () => {
      expect(getRefreshToken()).toBeNull()
    })
  })

  describe('saveAdminInfo - 保存管理员信息', () => {
    it('应该正确保存到 localStorage', () => {
      const adminData = { token: 'new-token', role: 'admin', refreshToken: 'refresh' }
      saveAdminInfo(adminData)

      const stored = localStorage.getItem('admin')
      expect(JSON.parse(stored)).toEqual(adminData)
    })
  })

  describe('isAdminRole - 检查是否为管理员角色', () => {
    it('admin 角色应该返回 true', () => {
      saveAdminInfo({ role: 'admin' })
      expect(isAdminRole()).toBe(true)
    })

    it('非 admin 角色应该返回 false', () => {
      saveAdminInfo({ role: 'user' })
      expect(isAdminRole()).toBe(false)
    })

    it('无角色信息时应该返回 false', () => {
      expect(isAdminRole()).toBe(false)
    })
  })

  describe('getCurrentShopId / setCurrentShopId - 店铺ID管理', () => {
    it('getCurrentShopId 应该返回当前店铺ID', () => {
      localStorage.setItem('currentShopId', 'shop-123')
      expect(getCurrentShopId()).toBe('shop-123')
    })

    it('没有设置店铺ID时应该返回空字符串', () => {
      expect(getCurrentShopId()).toBe('')
    })

    it('setCurrentShopId 应该正确保存店铺ID', () => {
      setCurrentShopId('shop-456')
      expect(localStorage.getItem('currentShopId')).toBe('shop-456')
    })

    it('setCurrentShopId 传入空值时应该移除店铺ID', () => {
      localStorage.setItem('currentShopId', 'shop-123')
      setCurrentShopId('')
      expect(localStorage.getItem('currentShopId')).toBeNull()

      localStorage.setItem('currentShopId', 'shop-123')
      setCurrentShopId(null)
      expect(localStorage.getItem('currentShopId')).toBeNull()
    })
  })

  describe('clearAuthInfo - 清除认证信息', () => {
    it('应该清除所有认证相关的 localStorage 数据', () => {
      localStorage.setItem('admin', JSON.stringify({ token: 'test' }))
      localStorage.setItem('currentShopId', 'shop-1')

      clearAuthInfo()

      expect(localStorage.getItem('admin')).toBeNull()
      expect(localStorage.getItem('currentShopId')).toBeNull()
    })
  })

  describe('getUserRole - 获取用户角色', () => {
    it('应该返回用户角色', () => {
      saveAdminInfo({ role: 'admin' })
      expect(getUserRole()).toBe('admin')
    })

    it('没有角色时应该返回空字符串', () => {
      expect(getUserRole()).toBe('')
    })
  })

  describe('getRolePrefix - 获取角色前缀', () => {
    it('管理员角色应该返回 /admin', () => {
      saveAdminInfo({ role: 'admin' })
      expect(getRolePrefix()).toBe('/admin')
    })

    it('非管理员角色应该返回 /shopOwner', () => {
      saveAdminInfo({ role: 'shopOwner' })
      expect(getRolePrefix()).toBe('/shopOwner')
    })
  })
})
