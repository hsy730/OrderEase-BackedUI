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
                path: 'product',
                name: 'Product',
                component: () => import('@/views/product/ProductManage.vue'),
                meta: { title: '商品管理' }
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