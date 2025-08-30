<template>
  <div class="product-detail">
    <div class="header">
      <h2>商品详情</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="20">
        <!-- 左侧商品信息 -->
        <el-col :span="4">
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
        <el-col :span="20">
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
            <el-descriptions-item label="商品标签">
              <div class="tags-container">
                <el-tag
                  v-for="tag in product.tags"
                  :key="tag.id"
                  class="product-tag"
                >
                  {{ tag.name }}
                </el-tag>
                <span v-if="product.tags.length === 0">暂无标签</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="商品选项参数">
              <div v-if="product.option_categories && product.option_categories.length > 0" class="option-categories-container">
                <div v-for="category in product.option_categories" :key="category.id" class="category-item">
                  <div class="category-header">
                    <span class="category-name">{{ category.name }}</span>
                    <span v-if="category.is_required" class="required-mark">*</span>
                    <span v-if="category.is_multiple" class="multiple-mark">(多选)</span>
                  </div>
                  <div class="category-options">
                    <el-tag
                      v-for="option in category.options"
                      :key="option.id"
                      class="option-tag"
                      :type="option.is_default ? 'primary' : ''"
                    >
                      {{ option.name }}
                      <span v-if="option.price_adjustment !== 0" class="price-adjustment">
                        {{ option.price_adjustment > 0 ? '+' : '' }}{{ option.price_adjustment }}
                      </span>
                      <span v-if="option.is_default" class="default-mark">默认</span>
                    </el-tag>
                  </div>
                </div>
              </div>
              <span v-else>暂无选项参数</span>
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
import { getProductTags } from '@/api/tag'
import { API_BASE_URL, API_PREFIX } from '@/config'

const route = useRoute()
const loading = ref(false)
const product = ref({
  tags: [],
  option_categories: []
})

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true
  try {
    const [productData, tagsData] = await Promise.all([
      getProductDetail(route.params.id),
      getProductTags(route.params.id).then(res => res.tags? res.tags : [])
    ])
    
    console.log('商品详情数据:', productData)
    console.log('商品标签数据:', tagsData)
    
    product.value = {
      ...productData,
      tags: tagsData,
      option_categories: productData.option_categories || []
    }
    } catch (tagsError) {
      console.error('获取商品标签失败:', tagsError)
      product.value.tags = []
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
  return `${API_BASE_URL}${API_PREFIX}/admin/product/image?path=${cleanPath}`
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
  max-width: 100px;
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.product-tag {
  cursor: default;
  transition: all 0.2s;
}

.product-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 商品选项参数样式 */
.option-categories-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  background-color: #fafafa;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}

.multiple-mark {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  cursor: default;
  transition: all 0.2s;
}

.option-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.price-adjustment {
  color: #f56c6c;
  margin-left: 4px;
  font-size: 12px;
}

.default-mark {
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.8;
}

:deep(.el-descriptions) {
  padding: 0;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}
</style>