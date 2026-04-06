import { describe, it, expect } from 'vitest'
import { validatePassword, getPasswordRegex } from '@/utils/passwordValidator'

describe('passwordValidator.js - 密码验证工具函数', () => {
  describe('validatePassword - 密码验证', () => {
    it('空密码应该返回"请输入密码"', () => {
      const errors = validatePassword('')
      expect(errors).toContain('请输入密码')
    })

    it('null/undefined 应该返回"请输入密码"', () => {
      expect(validatePassword(null)).toContain('请输入密码')
      expect(validatePassword(undefined)).toContain('请输入密码')
    })

    it('密码长度不足8位应该报错', () => {
      const errors = validatePassword('Ab1!')
      expect(errors).toContain('密码长度至少8位')
    })

    it('密码不包含数字应该报错', () => {
      const errors = validatePassword('Abcdefg!')
      expect(errors).toContain('密码必须包含数字')
    })

    it('密码不包含大写字母应该报错', () => {
      const errors = validatePassword('abcdefg1!')
      expect(errors).toContain('密码必须包含大写字母')
    })

    it('密码不包含小写字母应该报错', () => {
      const errors = validatePassword('ABCDEFG1!')
      expect(errors).toContain('密码必须包含小写字母')
    })

    it('密码不包含特殊字符应该报错', () => {
      const errors = validatePassword('Abcdefg1')
      expect(errors).toContain('密码必须包含特殊字符（如：@#$%^&*等）')
    })

    it('符合所有规则的密码应该返回空数组', () => {
      const errors = validatePassword('Abc12345!')
      expect(errors).toEqual([])
    })

    it('符合所有规则的其他有效密码', () => {
      expect(validatePassword('Test@1234')).toEqual([])
      expect(validatePassword('MyPass#2024')).toEqual([])
      expect(validatePassword('Admin$9988')).toEqual([])
    })

    it('多个错误应该同时返回', () => {
      const errors = validatePassword('abc')
      expect(errors.length).toBeGreaterThan(1)
      expect(errors).toContain('密码长度至少8位')
      expect(errors).toContain('密码必须包含大写字母')
      expect(errors).toContain('密码必须包含数字')
      expect(errors).toContain('密码必须包含特殊字符（如：@#$%^&*等）')
    })
  })

  describe('getPasswordRegex - 获取密码正则表达式', () => {
    it('应该返回一个 RegExp 对象', () => {
      const regex = getPasswordRegex()
      expect(regex).toBeInstanceOf(RegExp)
    })

    it('正则表达式应该匹配有效密码', () => {
      const regex = getPasswordRegex()
      expect(regex.test('Abc12345!')).toBe(true)
      expect(regex.test('Test@1234')).toBe(true)
      expect(regex.test('Pass$word9')).toBe(true)
    })

    it('正则表达式不应该匹配无效密码', () => {
      const regex = getPasswordRegex()
      expect(regex.test('')).toBe(false)
      expect(regex.test('abc')).toBe(false)
      expect(regex.test('ABCDEFGH')).toBe(false)
      expect(regex.test('12345678')).toBe(false)
      expect(regex.test('Abcdefgh')).toBe(false)
    })
  })
})
