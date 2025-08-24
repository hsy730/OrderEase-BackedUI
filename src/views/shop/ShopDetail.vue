<template>
  <div class="shop-detail">
    <div class="header">
      <h2>{{ shopInfo.name }} 详情</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="20">
        <!-- 左侧店铺信息 -->
        <el-col :span="8">
          <div class="shop-info-card">
            <div class="shop-name">{{ shopInfo.name }}</div>
            <div class="shop-status" :class="isValid ? 'valid' : 'invalid'">{{ isValid ? '营业中' : '已过期' }}</div>
          </div>
        </el-col>

        <!-- 右侧店铺详情 -->

        <el-col :span="16">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="店铺ID">{{ shopInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="店铺名称">{{ shopInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ shopInfo.contact_phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ shopInfo.contact_email }}</el-descriptions-item>
            <el-descriptions-item label="有效期至">{{ formatTime(shopInfo.valid_until) }}</el-descriptions-item>
            <el-descriptions-item label="店铺描述">
              {{ shopInfo.description || '暂无描述' }}
            </el-descriptions-item>
            <el-descriptions-item label="店铺标签">
              <div class="tags-container">
                <el-tag
                  v-for="tag in shopInfo.tags"
                  :key="tag.id"
                  class="shop-tag"
                >
                  {{ tag.name }}
                </el-tag>
                <span v-if="shopInfo.tags.length === 0">暂无标签</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getShopDetail } from '@/api/shop'
// import { getShopTags } from '@/api/tag'

const route = useRoute()
const loading = ref(false)
const shopInfo = ref({
  tags: []
})

// 获取店铺详情
const fetchShopDetail = async () => {
  loading.value = true
  try {
    const [shopData, tagsData] = await Promise.all([
      getShopDetail(route.params.id),
      // getShopTags(route.params.id).then(res => res.tags ? res.tags : [])
    ])

    console.log('店铺详情数据:', shopData)
    console.log('店铺标签数据:', tagsData)

    shopInfo.value = {
      ...shopData,
      tags: tagsData
    }
  } catch (tagsError) {
    console.error('获取店铺标签失败:', tagsError)
    shopInfo.value.tags = []
  }
  loading.value = false
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '暂无'
  return new Date(time).toLocaleString()
}

// 计算店铺是否有效
const isValid = computed(() => {
  if (!shopInfo.value.valid_until) return false
  const validUntil = new Date(shopInfo.value.valid_until)
  return validUntil > new Date()
})

onMounted(() => {
  fetchShopDetail()
})
</script>

<style scoped>
.shop-detail {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.shop-info-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.shop-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.shop-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.valid {
  background: #f0f9eb;
  color: #67c23a;
}

.invalid {
  background: #fef0f0;
  color: #f56c6c;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.shop-tag {
  cursor: default;
  transition: all 0.2s;
}

.shop-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-descriptions) {
  padding: 0;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}
</style>