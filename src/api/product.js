import request from '@/utils/request'
import { getCurrentShopId} from '@/api/shop';

// 获取商品列表
export function getProductList(params) {
    return request({
        url: '/product/list',
        method: 'get',
        params
    })
}

// 获取商品详情
export function getProductDetail(id) {
    return request({
        url: '/product/detail',
        method: 'get',
        params: { id }
    })
}

// 创建商品
export function createProduct(data) {
    return request({
        url: '/product/create',
        method: 'post',
        data
    })
}

// 更新商品
export function updateProduct(id, data) {
    return request({
        url: '/product/update',
        method: 'put',
        params: { id },
        data
    })
}

// 删除商品
export function deleteProduct(id) {
    return request({
        url: '/product/delete',
        method: 'delete',
        params: { id, shop_id: getCurrentShopId()}
    })
}

// 上传商品图片
export function uploadProductImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    return request({
        url: '/product/upload-image',
        method: 'post',
        params: { id },
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const getProductImageUrl = (path) => {
  if (!path) return ''
  
  // 如果path已经是完整URL，直接返回
  if (path.startsWith('http')) return path
  
  // 如果path以/开头，去掉开头的/
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  return `/product/image?path=${cleanPath}` // 返回相对路径，前缀由拦截器自动添加
}

// 更新商品状态
export const updateProductStatus = (id, status) => {
  return request({
    url: '/product/toggle-status',
    method: 'put',
    data: { id, status }
  })
}
