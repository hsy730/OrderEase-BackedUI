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

// 批量处理标签
export const batchUpdateTags = (productId, tagsToAdd = [], tagsToRemove = []) => {
  const requests = []
  
  if (tagsToAdd.length > 0) {
    requests.push(request({
      url: '/tag/batch-tag',
      method: 'post',
      data: {
        productId,
        tagIds: tagsToAdd,
        action: 'add'
      }
    }))
  }
  
  if (tagsToRemove.length > 0) {
    requests.push(request({
      url: '/tag/batch-tag',
      method: 'post',
      data: {
        productId,
        tagIds: tagsToRemove,
        action: 'remove'
      }
    }))
  }
  
  return Promise.all(requests)
}

// 获取标签关联的已上架商品列表
export const getTagProducts = (params) => {
  return request({
    url: '/tag/online-products',
    method: 'get',
    params
  })
}

// 获取商品已绑定标签
export const getProductTags = (productId) => {
  return request({
    url: '/tag/bound-tags',
    method: 'get',
    params: { product_id: productId }
  })
}

// 获取商品未绑定标签
export const getAvailableTags = (productId) => {
  return request({
    url: '/tag/unbound-tags',
    method: 'get',
    params: { product_id: productId }
  })
}
