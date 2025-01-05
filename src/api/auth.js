import request from '@/utils/request'

// 管理员登录
export const login = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/change-password',
    method: 'post',
    data
  })
} 