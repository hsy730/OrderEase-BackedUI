// 解析JWT token获取过期时间
const getTokenExpirationTime = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(base64))
    return payload.exp * 1000 // 转换为毫秒
  } catch (error) {
    return 0
  }
}

// 检查token是否需要刷新（过期前10分钟刷新）
export const needRefreshToken = (token) => {
  if (!token) return false

  const expirationTime = getTokenExpirationTime(token)
  const now = Date.now()
  const refreshThreshold = 10 * 60 * 1000 // 10分钟
  
  return now > (expirationTime - refreshThreshold)
} 