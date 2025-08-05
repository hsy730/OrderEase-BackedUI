import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { API_PREFIX } from '@/config'
import { needRefreshToken } from '@/utils/auth'
import { refreshToken } from '@/api/auth'

const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PREFIX}`,
  timeout: 5000
})

// 是否正在刷新token
let isRefreshing = false
// 等待刷新token的请求队列
let requests = []

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 如果是登录请求，直接放行
    if (config.url.includes('/login')) {
      return config
    }

    const adminInfo = localStorage.getItem('admin')
    if (!adminInfo) return config

    const { token, refreshToken: storedRefreshToken } = JSON.parse(adminInfo)
    
    // 如果不是刷新token的请求，且正在刷新token，则将请求加入队列
    if (!config.url.includes('/refresh-token') && isRefreshing) {
      return new Promise((resolve) => {
        requests.push((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`
          resolve(config)
        })
      })
    }

    // 检查是否需要刷新token
    if (!config.url.includes('/refresh-token') && needRefreshToken(token)) {
      // 开始刷新token
      if (!isRefreshing) {
        isRefreshing = true
        try {
          // 调用刷新token接口
          const res = await refreshToken(storedRefreshToken)
          const newToken = res.data.token
          const newRefreshToken = res.data.refreshToken

          // 更新本地存储
          const adminData = JSON.parse(adminInfo)
          adminData.token = newToken
          adminData.refreshToken = newRefreshToken
          localStorage.setItem('admin', JSON.stringify(adminData))

          // 处理队列中的请求
          requests.forEach((callback) => callback(newToken))
          requests = []
        } catch (error) {
          // 刷新失败，清除本地存储并跳转登录
          localStorage.removeItem('admin')
          ElMessage.error('刷新token失败，请重新登录')
          router.push('/login')
          requests = []
        } finally {
          isRefreshing = false
        }
      }

      // 将当前请求加入队列
      return new Promise((resolve) => {
        requests.push((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`
          resolve(config)
        })
      })
    }

    // 设置token
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  async error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 尝试刷新token
          const adminInfo = localStorage.getItem('admin')
          if (adminInfo) {
            const { refreshToken: storedRefreshToken } = JSON.parse(adminInfo)
            if (storedRefreshToken && !isRefreshing) {
              isRefreshing = true
              try {
                // 调用刷新token接口
                const res = await refreshToken(storedRefreshToken)
                const newToken = res.data.token
                const newRefreshToken = res.data.refreshToken

                // 更新本地存储
                const adminData = JSON.parse(adminInfo)
                adminData.token = newToken
                adminData.refreshToken = newRefreshToken
                localStorage.setItem('admin', JSON.stringify(adminData))

                // 重试当前请求
                const originalRequest = error.config
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return request(originalRequest)
              } catch (refreshError) {
                // 刷新失败，清除本地存储并跳转登录
                localStorage.removeItem('admin')
                ElMessage.error('登录已过期，请重新登录')
                router.push('/login')
              } finally {
                isRefreshing = false
              }
            } else {
              // 没有刷新token或正在刷新，清除本地存储并跳转登录
              localStorage.removeItem('admin')
              ElMessage.error('登录已过期，请重新登录')
              router.push('/login')
            }
          } else {
            // 没有admin信息，跳转登录
            router.push('/login')
          }
          break
        case 403:
          ElMessage.error('没有操作权限')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(error.response.data?.error || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request