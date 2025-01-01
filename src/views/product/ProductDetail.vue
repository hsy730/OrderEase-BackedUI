<template>
  <div class="product-detail">
    <div class="header">
      <h2>商品详情</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="20">
        <!-- 左侧商品信息 -->
        <el-col :span="8">
          <!-- 商品图片展示区 -->
          <div class="product-image" v-if="product.image_url">
            <el-image
              :src="getImageUrl(product.image_url)"
              :preview-src-list="[getImageUrl(product.image_url)]"
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
        </el-col>

        <!-- 右侧商品详情 -->
        <el-col :span="16">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="商品ID">{{ product.id }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ product.name }}</el-descriptions-item>
            <el-descriptions-item label="商品价格">¥{{ product.price }}</el-descriptions-item>
            <el-descriptions-item label="库存">{{ product.stock }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(product.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(product.updated_at) }}</el-descriptions-item>
            <el-descriptions-item label="商品描述">
              {{ product.description || '暂无描述' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Picture, ZoomIn } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { API_BASE_URL, API_PREFIX } from '@/config'

const route = useRoute()
const loading = ref(false)
const product = ref({})

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true
  try {
    const data = await getProductDetail(route.params.id)
    console.log('商品详情数据:', data) // 用于调试
    product.value = data
  } catch (error) {
    console.error('获取商品详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  // 如果path已经是完整URL，直接返回
  if (path.startsWith('http')) return path
  // 如果path以/开头，去掉开头的/
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}${API_PREFIX}/product/image?path=${cleanPath}`
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '暂无'
  return new Date(time).toLocaleString()
}

// 处理图片预览
const handlePreview = () => {
  // Element Plus的el-image组件会自动处理预览
  console.log('预览图片:', getImageUrl(product.value.image_url))
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail {
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

.product-image {
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

.product-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.product-image:hover .image-hint {
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

:deep(.el-descriptions) {
  padding: 0;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}
</style> 