import request from '@/utils/request'

// 导出数据
export const exportData = () => {
  return request({
    url: '/admin/data/export',
    method: 'get',
    responseType: 'blob' // 设置响应类型为 blob，用于处理二进制文件
  })
}

// 导入数据
export const importData = (formData) => {
  return request({
    url: '/admin/data/import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
} 