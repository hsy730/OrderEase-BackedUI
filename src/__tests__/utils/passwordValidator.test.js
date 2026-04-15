import { describe, it, expect } from 'vitest'
import { validatePassword, validateStrictPassword, validateWeakPassword, getPasswordRegex, getStrictPasswordRegex, getWeakPasswordRegex } from '@/utils/passwordValidator'

describe('passwordValidator.js - 密码验证工具函数', () => {
  describe('validatePassword - 普通用户密码验证', () => {
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

  describe('validateStrictPassword - 店主/管理员严格密码验证', () => {
    it('空密码应该返回"请输入密码"', () => {
      const errors = validateStrictPassword('')
      expect(errors).toContain('请输入密码')
    })

    it('null/undefined 应该返回"请输入密码"', () => {
      expect(validateStrictPassword(null)).toContain('请输入密码')
      expect(validateStrictPassword(undefined)).toContain('请输入密码')
    })

    it('有效严格密码 - 8位', () => {
      const errors = validateStrictPassword('Abc123!@')
      expect(errors).toEqual([])
    })

    it('有效严格密码 - 较长', () => {
      const errors = validateStrictPassword('MyStr0ng!Pass')
      expect(errors).toEqual([])
    })

    it('有效严格密码 - 20位', () => {
      const errors = validateStrictPassword('MyStr0ng!Pass12345!')
      expect(errors).toEqual([])
    })

    it('密码长度不足8位应该报错', () => {
      const errors = validateStrictPassword('Abc123!')
      expect(errors).toContain('密码长度必须在8-20位')
    })

    it('密码长度超过20位应该报错', () => {
      const errors = validateStrictPassword('MyStr0ng!Pass12345!TooLong')
      expect(errors).toContain('密码长度必须在8-20位')
    })

    it('密码不包含数字应该报错', () => {
      const errors = validateStrictPassword('Abcdefg!')
      expect(errors).toContain('密码必须包含数字')
    })

    it('密码不包含小写字母应该报错', () => {
      const errors = validateStrictPassword('ABC123!@')
      expect(errors).toContain('密码必须包含小写字母')
    })

    it('密码不包含大写字母应该报错', () => {
      const errors = validateStrictPassword('abc123!@')
      expect(errors).toContain('密码必须包含大写字母')
    })

    it('密码不包含特殊字符应该报错', () => {
      const errors = validateStrictPassword('Abc12345')
      expect(errors).toContain('密码必须包含特殊字符')
    })

    it('只有数字和小写字母应该报错缺少大写字母', () => {
      const errors = validateStrictPassword('abc12345')
      expect(errors).toContain('密码必须包含大写字母')
      expect(errors).toContain('密码必须包含特殊字符')
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

  describe('getStrictPasswordRegex - 获取严格密码正则表达式', () => {
    it('应该返回一个 RegExp 对象', () => {
      const regex = getStrictPasswordRegex()
      expect(regex).toBeInstanceOf(RegExp)
    })

    it('正则表达式应该匹配有效严格密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('Abc123!@')).toBe(true)
      expect(regex.test('MyStr0ng!Pass')).toBe(true)
      expect(regex.test('MyStr0ng!Pass12345!')).toBe(true)
    })

    it('正则表达式不应该匹配过短密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('Abc123!')).toBe(false)
    })

    it('正则表达式不应该匹配过长密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('MyStr0ng!Pass12345!TooLong')).toBe(false)
    })

    it('正则表达式不应该匹配缺少数字的密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('Abcdefg!')).toBe(false)
    })

    it('正则表达式不应该匹配缺少小写字母的密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('ABC123!@')).toBe(false)
    })

    it('正则表达式不应该匹配缺少大写字母的密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('abc123!@')).toBe(false)
    })

    it('正则表达式不应该匹配缺少特殊字符的密码', () => {
      const regex = getStrictPasswordRegex()
      expect(regex.test('Abc12345')).toBe(false)
    })
  })

  describe('validateWeakPassword - 普通用户弱密码验证', () => {
    it('空密码应该返回"请输入密码"', () => {
      const errors = validateWeakPassword('')
      expect(errors).toContain('请输入密码')
    })

    it('null/undefined 应该返回"请输入密码"', () => {
      expect(validateWeakPassword(null)).toContain('请输入密码')
      expect(validateWeakPassword(undefined)).toContain('请输入密码')
    })

    it('有效弱密码 - 字母和数字', () => {
      const errors = validateWeakPassword('abc123')
      expect(errors).toEqual([])
    })

    it('有效弱密码 - 纯字母', () => {
      const errors = validateWeakPassword('abcdef')
      expect(errors).toEqual([])
    })

    it('有效弱密码 - 纯数字', () => {
      const errors = validateWeakPassword('123456')
      expect(errors).toEqual([])
    })

    it('有效弱密码 - 20个字符', () => {
      const errors = validateWeakPassword('abcdefghijklmn12345')
      expect(errors).toEqual([])
    })

    it('有效弱密码 - 大写字母', () => {
      const errors = validateWeakPassword('ABCDEF')
      expect(errors).toEqual([])
    })

    it('有效弱密码 - 包含特殊字符（类似强密码）', () => {
      const errors = validateWeakPassword('Abc123!@')
      expect(errors).toEqual([])
    })

    it('密码长度不足6位应该报错', () => {
      const errors = validateWeakPassword('ab12')
      expect(errors).toContain('密码长度必须在6-20位')
    })

    it('密码长度超过20位应该报错', () => {
      const errors = validateWeakPassword('abcdefghijklmnopqrstuvwxyz123456')
      expect(errors).toContain('密码长度必须在6-20位')
    })

    it('只包含特殊字符应该报错', () => {
      const errors = validateWeakPassword('!@#$%^')
      expect(errors).toContain('密码必须包含字母或数字')
    })
  })

  describe('getWeakPasswordRegex - 获取弱密码正则表达式', () => {
    it('应该返回一个 RegExp 对象', () => {
      const regex = getWeakPasswordRegex()
      expect(regex).toBeInstanceOf(RegExp)
    })

    it('正则表达式应该匹配有效弱密码', () => {
      const regex = getWeakPasswordRegex()
      expect(regex.test('abc123')).toBe(true)
      expect(regex.test('abcdef')).toBe(true)
      expect(regex.test('123456')).toBe(true)
      expect(regex.test('ABCDEF')).toBe(true)
      expect(regex.test('Abc123!@')).toBe(true)
      expect(regex.test('abcdefghijklmn12345')).toBe(true)
    })

    it('正则表达式不应该匹配过短密码', () => {
      const regex = getWeakPasswordRegex()
      expect(regex.test('ab12')).toBe(false)
      expect(regex.test('a')).toBe(false)
    })

    it('正则表达式不应该匹配过长密码', () => {
      const regex = getWeakPasswordRegex()
      expect(regex.test('abcdefghijklmnopqrstuvwxyz123456')).toBe(false)
    })

    it('正则表达式不应该匹配纯特殊字符', () => {
      const regex = getWeakPasswordRegex()
      expect(regex.test('!@#$%^')).toBe(false)
      expect(regex.test('!@#$%@#$%')).toBe(false)
    })
  })
})
