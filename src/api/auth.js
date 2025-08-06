import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

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
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/logout`,
    method: 'post'
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/change-password`,
    method: 'post',
    data
  })
}

// 刷新Token
export const refreshToken = (refreshToken) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/refresh-token`,
    method: 'post',
    data: {
      refreshToken
    }
  })
}