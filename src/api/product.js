import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

// 获取商品列表
export function getProductList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/product/list`,
        method: 'get',
        params: { ...params, shop_id: this.getShopId() }
    })
}

// 获取商品详情
export function getProductDetail(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/product/detail`,
        method: 'get',
        params: { id, shop_id: this.getShopId() }
    })
}

// 创建商品
export function createProduct(data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/product/create`,
        method: 'post',
        data: { ...data, shop_id: this.getShopId() }
    })
}

// 更新商品
export function updateProduct(id, data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/product/update`,
        method: 'put',
        params: { id, shop_id: this.getShopId() },
        data
    })
}

// 删除商品
export function deleteProduct(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/product/delete`,
        method: 'delete',
        params: { id, shop_id: this.getShopId() }
    })
}

// 上传商品图片
export function uploadProductImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/product/upload-image`,
        method: 'post',
        params: { id, shop_id: this.getShopId() },
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 更新商品状态
export const updateProductStatus = (id, status) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/product/toggle-status`,
    method: 'put',
    data: { id, status, shop_id: this.getShopId() }
  })
}