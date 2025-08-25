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
          <!-- 店铺图片展示区 -->
          <div class="shop-image" v-if="shopInfo.image_url">
            <el-image
              :src="getImageUrl(shopInfo.image_url)"
              :preview-src-list="[getImageUrl(shopInfo.image_url)]"
              :initial-index="0"
              fit="cover"
              :preview-teleported="true"
              class="thumbnail"
              @click="handlePreview"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
            <div class="image-hint">
              <el-icon><ZoomIn /></el-icon>
              <span>点击查看大图</span>
            </div>
          </div>
          <div class="no-image" v-else>
            <el-icon><Picture /></el-icon>
            <span>暂无店铺图片</span>
          </div>
        </el-col>

        <!-- 右侧店铺详情 -->

        <el-col :span="16">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="店铺ID">{{ shopInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="店铺名称">
              {{ shopInfo.name }}
               <span class="shop-status" :class="isValid ? 'valid' : 'invalid'">{{ isValid ? '营业中' : '已过期' }}</span>
            </el-descriptions-item>
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
                <span v-if="!shopInfo.tags || shopInfo.tags.length === 0">暂无标签</span>
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
import { Picture, ZoomIn } from '@element-plus/icons-vue'
import { getShopDetail } from '@/api/shop'
import { API_BASE_URL, API_PREFIX } from '@/config'
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

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  // 如果path已经是完整URL，直接返回
  if (path.startsWith('http')) return path
  // 如果path以/开头，去掉开头的/
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}${API_PREFIX}/admin/shop/image?path=${cleanPath}`
}

// 处理图片预览
const handlePreview = () => {
  // Element Plus的el-image组件会自动处理预览
  console.log('预览图片:', getImageUrl(shopInfo.value.image_url))
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
  margin-bottom: 20px;
}

.shop-name {
  font-size: 20px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.shop-status {
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

.shop-image {
  position: relative;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.shop-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.shop-image:hover .image-hint {
  opacity: 1;
}

.thumbnail {
  width: 100%;
  height: 100%;
}

.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  background: #f5f7fa;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.image-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-hint .el-icon {
  font-size: 14px;
}

.no-image {
  width: 100%;
  max-width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  background: #f5f7fa;
  border-radius: 8px;
}

.no-image .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
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