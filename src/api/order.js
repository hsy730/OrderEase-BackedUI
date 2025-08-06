import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';
import { getCurrentShopId} from '@/api/shop';

// 获取订单列表
export function getOrderList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/order/list`,
        method: 'get',
        params: { ...params, shop_id: getCurrentShopId() }
    })
}

// 获取订单详情 
export function getOrderDetail(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/order/detail`,
        method: 'get',
        params: { id, shop_id: getCurrentShopId()}
    })
}

// 创建订单
export function createOrder(data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/order/create`,
        method: 'post',
        data: {...data, shop_id: getCurrentShopId()}
    })
}

// 更新订单
export function updateOrder(id, data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/order/update`,
        method: 'put',
        params: { id, shop_id: getCurrentShopId()},
        data
    })
}

// 删除订单
export function deleteOrder(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shopOwner'}/order/delete`,
        method: 'delete',
        params: { id, shop_id: getCurrentShopId()}
    })
}

// 翻转订单状态
export const toggleOrderStatus = (id) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shopOwner'}/order/toggle-status`,
    method: 'put'
  })
}
