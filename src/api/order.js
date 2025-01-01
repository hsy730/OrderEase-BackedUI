import request from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
    return request({
        url: '/order/list',
        method: 'get',
        params
    })
}

// 获取订单详情
export function getOrderDetail(id) {
    return request({
        url: '/order/detail',
        method: 'get',
        params: { id }
    })
}

// 创建订单
export function createOrder(data) {
    return request({
        url: '/order/create',
        method: 'post',
        data
    })
}

// 更新订单
export function updateOrder(id, data) {
    return request({
        url: '/order/update',
        method: 'put',
        params: { id },
        data
    })
}

// 删除订单
export function deleteOrder(id) {
    return request({
        url: '/order/delete',
        method: 'delete',
        params: { id }
    })
} 