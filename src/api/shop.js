import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

export function getCurrentShopId() {
    const shopId = localStorage.getItem('currentShopId');
    return shopId ? Number(shopId) : -1;
}

// 获取店铺列表
export function getShopList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/list`,
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
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/create`,
        method: 'post',
        data: shopData,
    })
}

// 确保整个文件只声明一次 deleteShop
export function updateShop(shopData) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/update`,
        method: 'put',
        data: shopData,
    })
}

export function deleteShop(shopId) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/delete`,
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

