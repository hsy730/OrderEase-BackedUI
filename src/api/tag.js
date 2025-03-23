import request from '@/utils/request'

// 获取标签列表
export const getTagList = (params) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/list`,
    method: 'get',
    params
  })
}

// 获取标签详情
export const getTagDetail = (id) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/detail`,
    method: 'get',
    params: { id }
  })
}

// 获取标签已绑定的商品列表
export const getTagBoundProducts = (tagId, params) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/bound-products`,
    method: 'get',
    params: {
      tag_id: tagId,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    }
  })
}

// 创建标签
export const createTag = (data) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/create`,
    method: 'post',
    data
  })
}

// 更新标签
export const updateTag = (data) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/update`,
    method: 'put',
    data
  })
}

// 删除标签
export const deleteTag = (id) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/delete`,
    method: 'delete',
    params: { id }
  })
}

// 批量更新标签
export const batchUpdateTags = (productId, tags) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/batch-tag-product`,
    method: 'post',
    data: {
      product_id: productId,
      tag_Ids: tags
    }
  })
}

// 获取标签关联的已上架商品列表
export const getTagProducts = (params) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/online-products`,
    method: 'get',
    params
  })
}

// 获取商品已绑定标签
export const getProductTags = (productId) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/bound-tags`,
    method: 'get',
    params: { product_id: productId }
  })
}

// 获取商品未绑定标签
export const getAvailableTags = (productId) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/unbound-tags`,
    method: 'get',
    params: { product_id: productId }
  })
}

// 批量解绑商品标签
export const unbindProductTag = (tagId, productId) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/batch-untag`,
    method: 'delete',
    data: {
      tag_id: Number(tagId),
      product_ids: [Number(productId)]
    }
  })
}

// 批量绑定商品标签
export const bindProductTag = (tagId, productIds) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/batch-tag`,
    method: 'post',
    data: {
      tag_id: Number(tagId),
      product_ids: productIds.map(id => Number(id))
    }
  })
}

// 获取标签未绑定的商品列表
export const getUnboundProducts = (tagId, params) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/tag/unbound-products`,
    method: 'get',
    params: {
      tag_id: tagId,
      page: params.page,
      pageSize: params.limit
    }
  })
}
