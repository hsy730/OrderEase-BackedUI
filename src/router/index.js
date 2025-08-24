import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/user',
        name: 'User',
        component: () => import('@/views/user/UserList.vue'),
        meta: { title: '用户管理' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: () => import('@/layout/index.vue'),
        redirect: (to) => {
            // 从本地存储获取用户信息
            const userInfo = JSON.parse(localStorage.getItem('admin') || '{}')
            // 根据角色返回不同路径
            return userInfo.role === 'admin' ? '/shop' : '/order'
        },
        children: [
            {
                path: 'user',
                name: 'User',
                component: () => import('@/views/user/UserList.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'order',
                name: 'Order',
                component: () => import('@/views/order/OrderManage.vue'),
                meta: { title: '订单管理' }
            },
            {
                path: 'order/:id',
                name: 'OrderDetail',
                component: () => import('@/views/order/OrderDetail.vue'),
                meta: { title: '订单详情' }
            },
            {
                path: 'product',
                name: 'Product',
                component: () => import('@/views/product/ProductManage.vue'),
                meta: { title: '商品管理' }
            },
            {
                path: 'shop',
                name: 'Shop',
                component: () => import('@/views/shop/ShopManage.vue'),
                meta: { title: '店铺管理' }
            },
            {
                path: 'product/:id',
                name: 'ProductDetail',
                component: () => import('@/views/product/ProductDetail.vue'),
                meta: { title: '商品详情' }
            },
            {
                path: 'shop/:id',
                name: 'ShopDetail',
                component: () => import('@/views/shop/ShopDetail.vue'),
                meta: { title: '店铺详情' }
            },
            {
                path: 'tag',
                name: 'TagManage',
                component: () => import('@/views/tag/TagManage.vue'),
                meta: { title: '标签管理' }
            },
            {
                path: 'tag/:id',
                name: 'TagDetail',
                component: () => import('@/views/tag/TagDetail.vue'),
                meta: { title: '标签详情' }
            },
            {
                path: 'migration',
                name: 'Migration',
                component: () => import('@/views/migration/index.vue'),
                meta: { title: '数据迁移' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

// 在路由配置文件中添加base路径
const router = createRouter({
  history: createWebHistory('/order-ease-adminiui/'),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const adminInfo = localStorage.getItem('admin')
    
    console.log('Current route:', to.path)
    console.log('Admin info:', adminInfo)

    if (to.path === '/login') {
        if (adminInfo) {
            const user = JSON.parse(adminInfo)
            const defaultPath = user.role === 'admin' ? '/shop' : '/order'
            next(defaultPath)
        } else {
            next()
        }
    } else {
        if (adminInfo) {
            next()
        } else {
            next('/login')
        }
    }
})

export default router