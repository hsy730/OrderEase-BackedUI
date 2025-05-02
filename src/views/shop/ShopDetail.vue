<template>
  <div class="shop-detail">
    <h2>{{ shopInfo.name }} 详情</h2>
    <!-- 添加详情内容 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getShopDetail } from '@/api/shop'

const route = useRoute()
const shopInfo = ref({})

onMounted(async () => {
  const { data } = await getShopDetail(route.params.id)
  shopInfo.value = data
})
</script>