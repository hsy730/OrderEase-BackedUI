import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';
import { getCurrentShopId} from '@/api/shop';
import { API_BASE_URL, API_PREFIX } from '@/config'



// 获取商品列表
export function getProductList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/list`,
        method: 'get',
        params: { ...params, shop_id: getCurrentShopId()}
    })
}

// 获取商品详情
export function getProductDetail(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/detail`,
        method: 'get',
        params: { id, shop_id: getCurrentShopId()}
    })
}

// 创建商品
export function createProduct(data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/create`,
        method: 'post',
        data: { ...data, shop_id: getCurrentShopId()}
    })
}

// 更新商品
export function updateProduct(id, data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/update`,
        method: 'put',
        params: { id, shop_id: getCurrentShopId()},
        data
    })
}

// 删除商品
export function deleteProduct(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/delete`,
        method: 'delete',
        params: { id, shop_id: getCurrentShopId()}
    })
}

// 上传商品图片
export function uploadProductImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/upload-image`,
        method: 'post',
        params: { id, shop_id: getCurrentShopId()},
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
  
  return `${API_BASE_URL}${API_PREFIX}/${isAdminRole() ? 'admin' : 'shopOwner'}/product/image?path=${cleanPath}`
}

// 更新商品状态
export const updateProductStatus = (id, status) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/product/toggle-status`,
    method: 'put',
    data: { id, status, shop_id: getCurrentShopId()}
  })
}