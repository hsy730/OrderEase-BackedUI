import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/products'
    },
    {
        path: '/products',
        name: 'ProductManage',
        component: () => import('@/views/product/ProductManage.vue')
    },
    {
        path: '/products/:id',
        name: 'ProductDetail',
        component: () => import('@/views/product/ProductDetail.vue')
    },
    {
        path: '/orders',
        name: 'OrderManage',
        component: () => import('@/views/order/OrderManage.vue')
    },
    {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/OrderDetail.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 