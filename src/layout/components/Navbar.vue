<script setup>
import { getShopList, switchShop } from '@/api/shop'
import { useUserStore } from '@/store'

// ...原有代码...
const currentShop = ref({})
const shopList = ref([])
const loading = ref(false)

const fetchShops = async () => {
    try {
        loading.value = true
        const { data } = await getShopList()
        shopList.value = data
        // 从本地存储获取已选商家
        currentShop.value = JSON.parse(localStorage.getItem('currentShop')) || data[0]
    } finally {
        loading.value = false
    }
}

const handleShopChange = async (shopId) => {
    try {
        await switchShop(shopId)
        const selected = shopList.value.find(shop => shop.id === shopId)
        currentShop.value = selected
        localStorage.setItem('currentShop', JSON.stringify(selected))
        // 刷新页面数据
        window.location.reload()
    } catch (error) {
        console.error('切换商家失败:', error)
    }
}

onMounted(fetchShops)
</script>

<template>
    <!-- 在原有导航栏代码附近添加 -->
    <div class="shop-selector">
        <el-dropdown @command="handleShopChange" v-loading="loading">
            <span class="el-dropdown-link">
                {{ currentShop?.name || '选择商家' }}
                <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item 
                        v-for="shop in shopList" 
                        :key="shop.id" 
                        :command="shop.id"
                        :class="{ 'is-active': shop.id === currentShop?.id }"
                    >
                        {{ shop.name }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
    
    <!-- 原有头像代码保持不变 -->
</template>

<style scoped>
.shop-selector {
    display: inline-block;
    margin-right: 20px;
}
.el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>