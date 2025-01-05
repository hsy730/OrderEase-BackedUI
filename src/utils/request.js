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

    const { token } = JSON.parse(adminInfo)
    
    // 如果不是刷新token的请求，且正在刷新token，则将请求加入队列
    if (!config.url.includes('/refresh-token') && isRefreshing) {
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
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('admin')
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
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