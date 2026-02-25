import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { API_PREFIX } from '@/config'
import { needRefreshToken, getAdminInfo, saveAdminInfo, clearAuthInfo } from '@/utils/auth'
import { refreshToken } from '@/api/auth'

const request = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PREFIX}`,
  timeout: 5000
})

// 是否正在刷新token
let isRefreshing = false
// 等待刷新token的请求队列
let requests = []

// 刷新token的函数
async function handleRefreshToken(storedRefreshToken, adminInfo) {
  try {
    const res = await refreshToken(storedRefreshToken)
    if (res.code !== 200) {
      throw new Error('刷新token失败')
    }
    const newToken = res.data.token
    const newRefreshToken = res.data.refreshToken

    // 更新本地存储
    const adminData = JSON.parse(adminInfo)
    adminData.token = newToken
    adminData.refreshToken = newRefreshToken
    saveAdminInfo(adminData)

    return newToken
  } catch (error) {
    // 刷新失败，清除本地存储并跳转登录
    clearAuthInfo()
    ElMessage.error('登录已过期，请重新登录')
    router.push('/login')
    throw error
  } finally {
    isRefreshing = false
  }
}

// 导入所需工具函数
import { isAdminRole } from '@/utils/auth'
import { getCurrentShopId } from '@/api/shop'
import { useUserStore } from '@/stores'

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 如果是登录请求，直接放行
    if (config.url.includes('/login')) {
      return config
    }

    const adminInfo = getAdminInfo()
    if (!adminInfo || Object.keys(adminInfo).length === 0) return config

    const { token, refreshToken: storedRefreshToken } = adminInfo
    
    // 如果不是刷新token的请求，且正在刷新token，则将请求加入队列
    if (!config.url.includes('/refresh-token') && isRefreshing) {
      return new Promise((resolve) => {
        requests.push((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`
          // 在这里也需要添加shop_id，确保队列中的请求也能正确处理
          addShopIdToRequest(config)
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
          const newToken = await handleRefreshToken(storedRefreshToken, adminInfo)

          // 处理队列中的请求
          requests.forEach((callback) => callback(newToken))
          requests = []
        } catch (error) {
          // 刷新失败，清除本地存储并跳转登录
          clearAuthInfo()
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
          // 在这里也需要添加shop_id，确保队列中的请求也能正确处理
          addShopIdToRequest(config)
          resolve(config)
        })
      })
    }

    // 设置token
    config.headers.Authorization = `Bearer ${token}`
    
    // 自动处理角色相关的 URL 前缀
    const userStore = useUserStore()
    addRolePrefixToUrl(config, userStore)
    
    // 添加shop_id到请求中
    addShopIdToRequest(config)
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 根据用户角色自动添加 URL 前缀
 * @param {Object} config - axios 请求配置
 * @param {Object} userStore - Pinia user store
 */
function addRolePrefixToUrl(config, userStore) {
  // 如果 URL 已经以 /admin 或 /shopOwner 开头，则跳过
  if (config.url.startsWith('/admin') || config.url.startsWith('/shopOwner')) {
    return
  }
  
  // 根据角色添加前缀
  const prefix = userStore.isAdmin ? '/admin' : '/shopOwner'
  config.url = prefix + config.url
}

// 添加shop_id到请求的函数
function addShopIdToRequest(config) {
  // 获取当前店铺ID
  const shopId = getCurrentShopId()
  if (shopId) {
    // 检查是否为FormData类型（通常用于文件上传）
    const isFormData = config.data instanceof FormData
    
    if (isFormData) {
      // FormData类型（文件上传）：将shop_id添加到query参数中
      config.params = { ...config.params, shop_id: shopId }
    } else {
      // 检查是否有body数据
      const hasBodyData = config.data && config.data !== ''
      
      if (hasBodyData) {
        // 有body数据且非FormData：将shop_id添加到body中
        if (config.data.shop_id == null) {
          config.data = { ...config.data, shop_id: shopId }
        }
      } 
      // 无body数据：将shop_id添加到query参数中
      if (config.params && config.params.shop_id == null) {
          config.params = { ...config.params, shop_id: shopId }
      }
    }
  }
}

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 对于 blob 类型请求，保留原始响应，因为 304 Not Modified 状态码可能没有 response.data
    if (response.config.responseType === 'blob') {
      return response
    }
    return response.data
  },
  async error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 尝试刷新token
          const adminInfo = getAdminInfo()
          if (adminInfo && Object.keys(adminInfo).length > 0) {
            const { refreshToken: storedRefreshToken } = adminInfo
            if (storedRefreshToken && !isRefreshing) {
              isRefreshing = true
              try {
                const newToken = await handleRefreshToken(storedRefreshToken, JSON.stringify(adminInfo))

                // 重试当前请求
                const originalRequest = error.config
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return request(originalRequest)
              } catch (refreshError) {
                  // 刷新失败，清除本地存储并跳转登录
                  clearAuthInfo()
                  ElMessage.error('登录已过期，请重新登录')
                  router.push('/login')
                } finally {
                  isRefreshing = false
              }
            } else {
              // 没有刷新token或正在刷新，清除本地存储并跳转登录
              clearAuthInfo()
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
          // ElMessage.error(error.response.data?.error || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request