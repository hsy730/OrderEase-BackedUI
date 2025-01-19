import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: () => import('@/layout/index.vue'),
        redirect: '/order',
        children: [
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
                path: 'product/:id',
                name: 'ProductDetail',
                component: () => import('@/views/product/ProductDetail.vue'),
                meta: { title: '商品详情' }
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

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const adminInfo = localStorage.getItem('admin')
    
    console.log('Current route:', to.path)
    console.log('Admin info:', adminInfo)

    if (to.path === '/login') {
        if (adminInfo) {
            next('/order')
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