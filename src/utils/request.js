import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_BASE_URL, API_PREFIX, API_TIMEOUT } from '@/config'

const request = axios.create({
    baseURL: `${API_BASE_URL}${API_PREFIX}`,
    timeout: API_TIMEOUT
})

// 响应拦截器
request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        const message = error.response?.data?.error || '网络错误'
        ElMessage.error(message)
        return Promise.reject(error)
    }
)

export default request 