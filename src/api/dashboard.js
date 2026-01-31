import request from '@/utils/request'
import { isAdminRole } from '@/utils/auth'

/**
 * 获取数据看板统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.shop_id - 店铺ID (管理员可选，店主不需要)
 * @param {string} params.period - 销售趋势周期：week(本周)/month(本月)/year(全年)，默认week
 * @returns {Promise} 返回统计数据
 */
export function getDashboardStats(params = {}) {
  const role = isAdminRole() ? 'admin' : 'shopOwner'
  return request({
    url: `/${role}/dashboard/stats`,
    method: 'get',
    params
  })
}
