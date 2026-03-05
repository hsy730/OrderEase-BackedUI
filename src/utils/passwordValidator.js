// 密码验证工具函数

/**
 * 验证密码是否符合要求
 * @param {string} password - 密码字符串
 * @returns {string[]} - 错误信息数组，为空表示验证通过
 */
export const validatePassword = (password) => {
  const errors = []

  if (!password) {
    errors.push('请输入密码')
  }

  if (password && password.length < 8) {
    errors.push('密码长度至少8位')
  }

  if (password && !/(?=.*[0-9])/.test(password)) {
    errors.push('密码必须包含数字')
  }

  if (password && !/(?=.*[A-Z])/.test(password)) {
    errors.push('密码必须包含大写字母')
  }

  if (password && !/(?=.*[a-z])/.test(password)) {
    errors.push('密码必须包含小写字母')
  }

  if (password && !/(?=.*[^a-zA-Z0-9])/.test(password)) {
    errors.push('密码必须包含特殊字符（如：@#$%^&*等）')
  }

  return errors
}

/**
 * 获取密码验证的正则表达式
 * @returns {RegExp} - 密码验证的正则表达式
 */
export const getPasswordRegex = () => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[A-Za-z\d\W]{8,}$/
}
