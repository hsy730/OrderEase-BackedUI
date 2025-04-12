import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

export function getCurrentShopId() {
    const shopId = localStorage.getItem('currentShopId');
    return shopId ? Number(shopId) : 0;
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
        data: { // 改为使用 data 传递 JSON 数据
            owner_username: shopData.owner_username,
            owner_password: shopData.owner_password,
            name: shopData.name,
            contact_phone: shopData.contact_phone,
            contact_email: shopData.contact_email,
            description: shopData.description,
            valid_until: shopData.valid_until
        }
    })
}

// 确保整个文件只声明一次 deleteShop
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

export function getShopDetail(shopId) {
  return request({
    url: `/shop/${shopId}`,
    method: 'get',
    params: {
      include: 'users,products'
    }
  })
}

