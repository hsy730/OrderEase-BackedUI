import { describe, it, expect } from 'vitest'
import {
  ORDER_STATUS,
  PRODUCT_STATUS,
  USER_ROLE,
  COMMON_STATUS,
  getOrderStatusLabel,
  getOrderStatusType,
  getOrderStatusOptions,
  getProductStatusLabel,
  getProductStatusType,
  getProductStatusOptions,
  getUserRoleLabel,
  getUserRoleOptions,
  getCommonStatusLabel,
  getCommonStatusType
} from '@/utils/status'

describe('status.js - 状态映射工具函数', () => {
  describe('ORDER_STATUS 订单状态常量', () => {
    it('应该包含所有预定义的订单状态', () => {
      expect(ORDER_STATUS.PENDING).toEqual({ value: 1, label: '待处理', type: 'warning' })
      expect(ORDER_STATUS.ACCEPTED).toEqual({ value: 2, label: '已接单', type: 'primary' })
      expect(ORDER_STATUS.PREPARING).toEqual({ value: 3, label: '备货中', type: 'info' })
      expect(ORDER_STATUS.SHIPPED).toEqual({ value: 4, label: '已发货', type: 'success' })
      expect(ORDER_STATUS.COMPLETED).toEqual({ value: 10, label: '已完成', type: 'success' })
      expect(ORDER_STATUS.CANCELLED).toEqual({ value: -1, label: '已取消', type: 'danger' })
    })
  })

  describe('getOrderStatusLabel - 订单状态标签', () => {
    it('应该返回正确的状态标签', () => {
      expect(getOrderStatusLabel(1)).toBe('待处理')
      expect(getOrderStatusLabel(2)).toBe('已接单')
      expect(getOrderStatusLabel(3)).toBe('备货中')
      expect(getOrderStatusLabel(4)).toBe('已发货')
      expect(getOrderStatusLabel(10)).toBe('已完成')
      expect(getOrderStatusLabel(-1)).toBe('已取消')
    })

    it('未知状态应该返回"未知状态"', () => {
      expect(getOrderStatusLabel(999)).toBe('未知状态')
      expect(getOrderStatusLabel(undefined)).toBe('未知状态')
    })
  })

  describe('getOrderStatusType - 订单状态类型', () => {
    it('应该返回正确的 el-tag 类型', () => {
      expect(getOrderStatusType(1)).toBe('warning')
      expect(getOrderStatusType(2)).toBe('primary')
      expect(getOrderStatusType(3)).toBe('info')
      expect(getOrderStatusType(4)).toBe('success')
      expect(getOrderStatusType(10)).toBe('success')
      expect(getOrderStatusType(-1)).toBe('danger')
    })

    it('未知状态应该返回"info"', () => {
      expect(getOrderStatusType(999)).toBe('info')
    })
  })

  describe('getOrderStatusOptions - 订单状态选项列表', () => {
    it('应该返回所有状态的选项列表', () => {
      const options = getOrderStatusOptions()
      expect(options).toHaveLength(6)
      options.forEach(option => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
      })
    })
  })

  describe('PRODUCT_STATUS 商品状态常量', () => {
    it('应该包含所有商品状态', () => {
      expect(PRODUCT_STATUS.ONLINE).toEqual({ value: 'online', label: '已上架', type: 'success' })
      expect(PRODUCT_STATUS.OFFLINE).toEqual({ value: 'offline', label: '已下架', type: 'info' })
    })
  })

  describe('getProductStatusLabel - 商品状态标签', () => {
    it('应该返回正确的商品状态标签', () => {
      expect(getProductStatusLabel('online')).toBe('已上架')
      expect(getProductStatusLabel('offline')).toBe('已下架')
    })

    it('未知状态应该返回"未知状态"', () => {
      expect(getProductStatusLabel('unknown')).toBe('未知状态')
    })
  })

  describe('getProductStatusType - 商品状态类型', () => {
    it('应该返回正确的 el-tag 类型', () => {
      expect(getProductStatusType('online')).toBe('success')
      expect(getProductStatusType('offline')).toBe('info')
    })

    it('未知状态应该返回"info"', () => {
      expect(getProductStatusType('unknown')).toBe('info')
    })
  })

  describe('getProductStatusOptions - 商品状态选项列表', () => {
    it('应该返回所有商品状态的选项列表', () => {
      const options = getProductStatusOptions()
      expect(options).toHaveLength(2)
    })
  })

  describe('USER_ROLE 用户角色常量', () => {
    it('应该包含所有用户角色', () => {
      expect(USER_ROLE.ADMIN).toEqual({ value: 'admin', label: '管理员' })
      expect(USER_ROLE.USER).toEqual({ value: 'user', label: '普通用户' })
      expect(USER_ROLE.SYSTEM).toEqual({ value: 'system', label: '公共用户' })
      expect(USER_ROLE.PUBLIC_USER).toEqual({ value: 'public_user', label: '公共用户' })
      expect(USER_ROLE.PRIVATE_USER).toEqual({ value: 'private_user', label: '普通用户' })
    })
  })

  describe('getUserRoleLabel - 用户角色标签', () => {
    it('应该返回正确的角色标签', () => {
      expect(getUserRoleLabel('admin')).toBe('管理员')
      expect(getUserRoleLabel('user')).toBe('普通用户')
      expect(getUserRoleLabel('system')).toBe('公共用户')
    })

    it('未知角色应该返回"未知角色"', () => {
      expect(getUserRoleLabel('superadmin')).toBe('未知角色')
    })
  })

  describe('getUserRoleOptions - 用户角色选项列表', () => {
    it('应该返回所有角色的选项列表', () => {
      const options = getUserRoleOptions()
      expect(options).toHaveLength(5)
    })
  })

  describe('COMMON_STATUS 通用状态常量', () => {
    it('应该包含启用/禁用状态', () => {
      expect(COMMON_STATUS.ENABLED).toEqual({ value: 1, label: '启用', type: 'success' })
      expect(COMMON_STATUS.DISABLED).toEqual({ value: 0, label: '禁用', type: 'danger' })
    })
  })

  describe('getCommonStatusLabel - 通用状态标签', () => {
    it('应该返回正确的通用状态标签', () => {
      expect(getCommonStatusLabel(1)).toBe('启用')
      expect(getCommonStatusLabel(0)).toBe('禁用')
    })

    it('未知状态应该返回"未知"', () => {
      expect(getCommonStatusLabel(2)).toBe('未知')
    })
  })

  describe('getCommonStatusType - 通用状态类型', () => {
    it('应该返回正确的 el-tag 类型', () => {
      expect(getCommonStatusType(1)).toBe('success')
      expect(getCommonStatusType(0)).toBe('danger')
    })

    it('未知状态应该返回"info"', () => {
      expect(getCommonStatusType(2)).toBe('info')
    })
  })
})
