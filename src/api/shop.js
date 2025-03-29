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
