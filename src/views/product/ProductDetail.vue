<template>
  <div class="product-detail-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <button class="back-btn" @click="$router.back()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回</span>
          </button>
          <div class="header-info">
            <h1 class="page-title">商品详情</h1>
            <p class="product-name-sub">{{ product.name }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="handleUpdate">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>更新</span>
          </button>
          <button class="action-btn" @click="handleManageTags">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>管理标签</span>
          </button>
        </div>
      </div>

      <div class="detail-content" v-loading="loading">
        <div class="main-content">
          <section class="info-card product-image-section">
            <div class="section-header">
              <h2 class="section-title">商品图片</h2>
            </div>
            <div class="product-image-container">
              <div class="product-image" v-if="product.image_url" @click="handlePreview">
                <SmartImage
                  :src="getImageUrl(product.image_url)"
                  :alt="product.name"
                  class="thumbnail"
                  @error="handleImageError"
                />
                <div class="image-hint">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                    <path d="M11 8v6M8 11h6"/>
                  </svg>
                  <span>点击查看大图</span>
                </div>
              </div>
              <div class="no-image" v-else>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <span>暂无商品图片</span>
              </div>
            </div>
          </section>

          <section class="info-card product-info-section">
            <div class="section-header">
              <h2 class="section-title">基本信息</h2>
              <span class="stock-badge" :class="{ low: product.stock < 10 }">
                库存: {{ product.stock }}
              </span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">商品ID</span>
                <span class="info-value">{{ product.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">商品名称</span>
                <span class="info-value">{{ product.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">商品价格</span>
                <span class="info-value price">¥{{ product.price }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">库存数量</span>
                <span class="info-value">{{ product.stock }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ formatTime(product.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间</span>
                <span class="info-value">{{ formatTime(product.updated_at) }}</span>
              </div>
            </div>
          </section>

          <section class="info-card description-section" v-if="product.description">
            <div class="section-header">
              <h2 class="section-title">商品描述</h2>
            </div>
            <div class="description-content">
              <p>{{ product.description }}</p>
            </div>
          </section>

          <section class="info-card tags-section">
            <div class="section-header">
              <h2 class="section-title">商品标签</h2>
            </div>
            <div class="tags-container">
              <span
                v-for="tag in product.tags"
                :key="tag.id"
                class="tag-item"
              >
                {{ tag.name }}
              </span>
              <span v-if="!product.tags || product.tags.length === 0" class="no-tags">暂无标签</span>
            </div>
          </section>

          <section class="info-card options-section" v-if="product.option_categories && product.option_categories.length > 0">
            <div class="section-header">
              <h2 class="section-title">商品选项参数</h2>
              <span class="item-count">{{ product.option_categories.length }} 个选项类别</span>
            </div>
            <div class="option-categories-container">
              <div v-for="category in product.option_categories" :key="category.id" class="category-item">
                <div class="category-header">
                  <span class="category-name">{{ category.name }}</span>
                  <span v-if="category.is_required" class="required-mark">必选</span>
                  <span v-if="category.is_multiple" class="multiple-mark">多选</span>
                </div>
                <div class="category-options">
                  <span
                    v-for="option in category.options"
                    :key="option.id"
                    class="option-tag"
                    :class="{ default: option.is_default }"
                  >
                    {{ option.name }}
                    <span v-if="option.price_adjustment !== 0" class="price-adjustment">
                      {{ option.price_adjustment > 0 ? '+' : '' }}{{ option.price_adjustment }}
                    </span>
                    <span v-if="option.is_default" class="default-mark">默认</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <div class="info-card summary-card">
            <h2 class="section-title">商品摘要</h2>
            <div class="summary-list">
              <div class="summary-item">
                <span class="summary-label">商品价格</span>
                <span class="summary-value price">¥{{ product.price }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">库存数量</span>
                <span class="summary-value">{{ product.stock }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">创建时间</span>
                <span class="summary-value">{{ formatTime(product.created_at) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">更新时间</span>
                <span class="summary-value">{{ formatTime(product.updated_at) }}</span>
              </div>
            </div>
            <div class="summary-total">
              <span class="total-label">商品总价</span>
              <span class="total-value">¥{{ product.price }}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="product.name"
      width="80%"
      top="50px"
      center
      append-to-body
    >
      <div class="image-preview-container">
        <SmartImage
          v-if="product.image_url"
          :src="getImageUrl(product.image_url)"
          :alt="product.name"
          class="preview-image"
          @error="handleImageError"
        />
        <div v-else class="preview-placeholder">
          <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="900px"
      :close-on-click-modal="false"
      center
      append-to-body
    >
      <ProductForm
        ref="productFormRef"
        :product-id="currentProductId"
      />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <tag-manage-dialog ref="tagManageDialogRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductDetail, deleteProduct, getProductImageUrl, updateProduct } from '@/api/product'
import { getProductTags } from '@/api/tag'
import { formatTime } from '@/utils/date'
import SmartImage from '@/components/SmartImage.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import TagManageDialog from '@/components/product/TagManageDialog.vue'

const route = useRoute()
const router = useRouter()

const product = ref({})
const tags = ref([])
const loading = ref(false)
const dialogVisible = ref(false)

const editDialogVisible = ref(false)
const editDialogTitle = ref('编辑商品')
const currentProductId = ref(null)
const productFormRef = ref(null)

const tagManageDialogRef = ref(null)

const components = {
  SmartImage
}

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
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  }
  loading.value = false
}

const getImageUrl = (path) => {
  if (!path) return ''
  return getProductImageUrl(path)
}

const handlePreview = () => {
  if (product.value.image_url) {
    dialogVisible.value = true
  }
}



const handleImageError = () => {
  ElMessage.error('图片加载失败')
}

const handleUpdate = () => {
  editDialogTitle.value = '编辑商品'
  currentProductId.value = product.value.id
  editDialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await productFormRef.value.submit()
    editDialogVisible.value = false
    ElMessage.success('商品更新成功')
    fetchProductDetail()
  } catch (error) {
    console.error('更新商品失败:', error)
    ElMessage.error('更新商品失败')
  }
}

const handleManageTags = () => {
  tagManageDialogRef.value?.open({
    productId: product.value.id,
    productName: product.value.name
  })
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.header-info {
  padding-top: 4px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.product-name-sub {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.action-btn.primary {
  background: var(--color-primary);
  color: #fff;
}

.action-btn.primary:hover {
  background: var(--color-primary-dark, #3b82f6);
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.stock-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
}

.stock-badge.low {
  background: rgba(255, 149, 0, 0.12);
  color: #ff9500;
}

.item-count {
  font-size: 14px;
  color: #86868b;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 12px;
  border-radius: 20px;
}

.product-image-container {
  display: flex;
  justify-content: center;
}

.product-image {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.product-image:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.product-image:hover .image-hint {
  opacity: 1;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s;
}

.no-image {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #86868b;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 16px;
}

.no-image span {
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: #86868b;
}

.info-value {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 500;
}

.info-value.price {
  color: var(--color-danger);
  font-weight: 600;
}

.description-content {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

.description-content p {
  margin: 0;
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.6;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  font-size: 14px;
  color: #1d1d1f;
  transition: all 0.2s;
}

.tag-item:hover {
  background: rgba(0, 0, 0, 0.08);
}

.no-tags {
  font-size: 14px;
  color: #86868b;
}

.option-categories-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.required-mark {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
  border-radius: 10px;
}

.multiple-mark {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-primary);
  border-radius: 10px;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  font-size: 13px;
  color: #1d1d1f;
  transition: all 0.2s;
}

.option-tag:hover {
  background: rgba(0, 0, 0, 0.08);
}

.option-tag.default {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-primary);
}

.price-adjustment {
  color: var(--color-danger);
  font-size: 12px;
  margin-left: 4px;
}

.default-mark {
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.8;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-card .section-title {
  margin-bottom: 20px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: #86868b;
}

.summary-value {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

.summary-value.price {
  color: var(--color-danger);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-danger);
  letter-spacing: -0.5px;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-placeholder {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #86868b;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 12px;
}

@media screen and (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
