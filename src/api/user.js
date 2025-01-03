import request from '@/utils/request'

// 获取简单用户列表
export const getSimpleUserList = () => {
  return request({
    url: '/user/simple-list',
    method: 'get'
  })
} 