import request from '@/utils/request'

// 获取标签列表
export const getTagList = (params) => {
  return request({
    url: '/tag/list',
    method: 'get',
    params
  })
}

// 获取标签详情
export const getTagDetail = (id) => {
  return request({
    url: '/tag/detail',
    method: 'get',
    params: { id }
  })
}

// 创建标签
export const createTag = (data) => {
  return request({
    url: '/tag/create',
    method: 'post',
    data
  })
}

// 更新标签
export const updateTag = (data) => {
  return request({
    url: '/tag/update',
    method: 'put',
    data
  })
}

// 删除标签
export const deleteTag = (id) => {
  return request({
    url: '/tag/delete',
    method: 'delete',
    params: { id }
  })
} 