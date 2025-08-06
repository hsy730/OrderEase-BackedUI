import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

// 获取简单用户列表
export const getSimpleUserList = () => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/user/simple-list`,
    method: 'get'
  })
} 