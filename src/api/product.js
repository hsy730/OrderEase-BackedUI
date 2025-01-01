import request from '@/utils/request'

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
        params: { id }
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