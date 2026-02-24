import request from '@/utils/request'

export const getSimpleUserList = (params) => {
  return request({
    url: '/user/simple-list',
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
