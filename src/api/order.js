import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth';

// 获取订单列表
export function getOrderList(params) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/order/list`,
        method: 'get',
        params
    })
}

// 获取订单详情
export function getOrderDetail(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/order/detail`,
        method: 'get',
        params: { id }
    })
}

// 创建订单
export function createOrder(data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/order/create`,
        method: 'post',
        data
    })
}

// 更新订单
export function updateOrder(id, data) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/order/update`,
        method: 'put',
        params: { id },
        data
    })
}

// 删除订单
export function deleteOrder(id) {
    return request({
        url: `${isAdminRole() ? '/admin' : '/shop'}/order/delete`,
        method: 'delete',
        params: { id }
    })
}

// 翻转订单状态
export const toggleOrderStatus = (id) => {
  return request({
    url: `${isAdminRole() ? '/admin' : '/shop'}/order/toggle-status`,
    method: 'put'
  })
} 
