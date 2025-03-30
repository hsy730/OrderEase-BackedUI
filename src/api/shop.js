import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

// 获取店铺列表
export function getShopList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/list`,
        method: 'get',
        params: {
            page: params.page,
            page_size: params.page_size
        }
    })
}

export function createShop(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/create`,
        method: 'post',
        params: {
            page: params.page,
            page_size: params.page_size
        }
    })
}

export function updateShop(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/update`,
        method: 'put',
        params: {
            page: params.page,
            page_size: params.page_size
        }
    })
}

export function deleteShop(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/shop/list`,
        method: 'get',
        params: {
            page: params.page,
            page_size: params.page_size
        }
    })
}

