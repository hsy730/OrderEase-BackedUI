import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { API_PREFIX } from '@/config'

const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PREFIX}`,
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const adminInfo = localStorage.getItem('admin')
    if (adminInfo) {
      const { token } = JSON.parse(adminInfo)
      config.headers['Authorization'] = `Bearer ${token}`
    }

    if (config.url) {
      config.url = encodeURI(config.url)
    }

    return config
  },
  error => {
    console.error('请求错误:', error)
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