import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';
import { getCurrentShopId} from '@/api/shop';


export const getSimpleUserList = (params) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/user/simple-list`,
    method: 'get',
    params
  })
}

export const createUser = (data) => {
  return request({
    url: '/admin/user/create',
    method: 'post',
    data
  })
}

export const getUserList = (params) => {
  return request({
    url: '/admin/user/list',
    method: 'get',
    params
  })
}

export const deleteUser = (params) => {
  return request({
    url: '/admin/user/delete',
    method: 'delete',
    params
  })
}

export const updateUser = (data) => {
  return request({
    url: '/admin/user/update',
    method: 'put',
    data
  })
}