import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';
import { API_BASE_URL, API_PREFIX } from '@/config'

export function getCurrentShopId() {
    const shopId = localStorage.getItem('currentShopId');
    return shopId ? Number(shopId) : 0;
}

// 获取店铺列表
export function getShopList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/shop/list`,
        method: 'get',
        params: {
            page: params.page,
            page_size: params.page_size,
            search: params.search,
        }
    })
}

export function createShop(shopData) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/shop/create`,
        method: 'post',
        data: shopData,
    })
}

// 确保整个文件只声明一次 deleteShop
export function updateShop(shopData) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/shop/update`,
        method: 'put',
        data: shopData,
    })
}

export function deleteShop(shopId) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/shop/delete`,
        method: 'delete',
        params: {
            shop_id: shopId,
        }
    })
}

// 修改获取店铺详情接口
export function getShopDetail(shopId) {
  return request({
    url: `/admin/shop/detail`,
    method: 'get',
    params: {
      shop_id: shopId
    }
  })
}

export function uploadShopImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/shop/upload-image`,
        method: 'post',
        params: { id, shop_id: getCurrentShopId()},
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function getShopImageUrl(path) {
    return `${API_BASE_URL}${API_PREFIX}${isAdminRole() ? '/admin' : '/shopOwner'}/shop/image?path=${path}`
}