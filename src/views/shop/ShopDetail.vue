<template>
  <div class="shop-detail-page">
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
            <h1 class="page-title">店铺详情</h1>
            <p class="shop-name-sub">{{ shopInfo.name }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="handleGetTempToken">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span>获取令牌</span>
          </button>
          <button class="action-btn primary" @click="handleEdit">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>修改店铺</span>
          </button>
          <button class="action-btn" @click="handleEditStatusFlow">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            <span>状态流转</span>
          </button>
        </div>
      </div>

      <div class="detail-content" v-loading="loading">
        <div class="main-content">
          <section class="info-card shop-image-section">
            <div class="section-header">
              <h2 class="section-title">店铺图片</h2>
            </div>
            <div class="shop-image-container">
              <div class="shop-image" v-if="shopInfo.image_url" @click="handlePreview">
                <SmartImage
                  :src="getImageUrl(shopInfo.image_url)"
                  alt="店铺图片"
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
                <span>暂无店铺图片</span>
              </div>
            </div>
          </section>

          <section class="info-card shop-info-section">
            <div class="section-header">
              <h2 class="section-title">基本信息</h2>
              <span class="shop-status" :class="isValid ? 'valid' : 'invalid'">
                {{ isValid ? '营业中' : '已过期' }}
              </span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">店铺ID</span>
                <span class="info-value">{{ shopInfo.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺名称</span>
                <span class="info-value">{{ shopInfo.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店主账号</span>
                <span class="info-value">{{ shopInfo.owner_username }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系方式</span>
                <span class="info-value">{{ shopInfo.contact_phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱</span>
                <span class="info-value">{{ shopInfo.contact_email || '暂无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">店铺地址</span>
                <span class="info-value">{{ shopInfo.address || '暂无地址' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">有效期至</span>
                <span class="info-value">{{ formatTime(shopInfo.valid_until) }}</span>
              </div>
            </div>
          </section>

          <section class="info-card description-section" v-if="shopInfo.description">
            <div class="section-header">
              <h2 class="section-title">店铺描述</h2>
            </div>
            <div class="description-content">
              <p>{{ shopInfo.description }}</p>
            </div>
          </section>

          <section class="info-card tags-section">
            <div class="section-header">
              <h2 class="section-title">店铺标签</h2>
            </div>
            <div class="tags-container">
              <span
                v-for="tag in shopInfo.tags"
                :key="tag.id"
                class="tag-item"
              >
                {{ tag.name }}
              </span>
              <span v-if="!shopInfo.tags || shopInfo.tags.length === 0" class="no-tags">暂无标签</span>
            </div>
          </section>

          <section class="info-card settings-section" v-if="isAdminRole()">
            <div class="section-header">
              <h2 class="section-title">店铺设置</h2>
            </div>
            <div class="settings-content">
              <pre>{{ JSON.stringify(shopInfo.settings, null, 2) || '暂无设置' }}</pre>
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <div class="info-card summary-card">
            <h2 class="section-title">店铺摘要</h2>
            <div class="summary-list">
              <div class="summary-item">
                <span class="summary-label">创建时间</span>
                <span class="summary-value">{{ formatTime(shopInfo.created_at) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">更新时间</span>
                <span class="summary-value">{{ formatTime(shopInfo.updated_at) }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="dialogTitle"
      width="600px"
      center
      append-to-body
    >
      <ShopForm
        ref="shopFormRef"
        :shop-id="currentShopId"
      />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogVisible"
      :title="shopInfo.name"
      width="80%"
      top="50px"
      center
      append-to-body
    >
      <div class="image-preview-container">
        <SmartImage
          :src="getImageUrl(shopInfo.image_url)"
          :alt="shopInfo.name"
          class="preview-image"
          @error="handleImageError"
        />
      </div>
    </el-dialog>

    <el-dialog
      v-model="tokenDialogVisible"
      title="店铺临时令牌"
      width="500px"
      center
      append-to-body
    >
      <div class="token-content">
        <div class="token-info-item">
          <span class="token-label">店铺ID</span>
          <span class="token-value">{{ tokenInfo.shop_id }}</span>
        </div>
        <div class="token-info-item">
          <span class="token-label">临时令牌</span>
          <div class="token-with-copy">
            <span class="token-text">{{ tokenInfo.token }}</span>
            <el-button
              size="small"
              :icon="CopyDocument"
              @click="handleCopyToken(tokenInfo.token)"
              class="copy-button"
              title="复制令牌"
            />
          </div>
        </div>
        <div class="token-info-item">
          <span class="token-label">过期时间</span>
          <span class="token-value">{{ formatTime(tokenInfo.expires_at) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="tokenDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="statusFlowDialogVisible"
      title="编辑订单状态流转"
      width="800px"
      center
      append-to-body
    >
      <OrderStatusFlow
        ref="orderStatusFlowRef"
        :initial-status-flow="statusFlowData"
        @update:status-flow="handleStatusFlowUpdate"
      />
      <template #footer>
        <el-button @click="statusFlowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveStatusFlow">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getShopDetail, getShopImageUrl, getShopTempToken, updateShop, updateOrderStatusFlow } from '@/api/shop'
import SmartImage from '@/components/SmartImage.vue'
import ShopForm from '@/components/shop/ShopForm.vue'
import OrderStatusFlow from '@/components/shop/OrderStatusFlow.vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDefaultOrderStatusFlow } from '@/utils/orderStatus'
import { isAdminRole } from '@/utils/auth'

const route = useRoute()
const loading = ref(false)
const shopInfo = ref({
  tags: []
})
const dialogVisible = ref(false)
const tokenDialogVisible = ref(false)
const tokenInfo = ref({})
const tokenLoading = ref(false)

const editDialogVisible = ref(false)
const dialogTitle = ref('')
const currentShopId = ref(null)
const shopFormRef = ref(null)

const statusFlowDialogVisible = ref(false)
const statusFlowData = ref(getDefaultOrderStatusFlow())
const orderStatusFlowRef = ref(null)

const fetchShopDetail = async () => {
  loading.value = true
  try {
    const [shopData, tagsData] = await Promise.all([
      getShopDetail(route.params.id),
    ])

    console.log('店铺详情数据:', shopData)

    shopInfo.value = {
      ...shopData,
      tags: tagsData
    }
    
    statusFlowData.value = shopData.order_status_flow || getDefaultOrderStatusFlow()
  } catch (tagsError) {
    console.error('获取店铺标签失败:', tagsError)
    shopInfo.value.tags = []
    statusFlowData.value = getDefaultOrderStatusFlow()
  }
  loading.value = false
}

const getImageUrl = (path) => {
  if (!path) return ''
  return getShopImageUrl(path)
}

const handlePreview = () => {
  if (shopInfo.value.image_url) {
    dialogVisible.value = true
  }
}

const handleImageError = () => {
  console.error('店铺图片加载失败')
}

const formatTime = (time) => {
  if (!time) return '暂无'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const isValid = computed(() => {
  if (!shopInfo.value.valid_until) return false
  const validUntil = new Date(shopInfo.value.valid_until)
  return validUntil > new Date()
})

const handleGetTempToken = async () => {
  tokenLoading.value = true
  try {
    const result = await getShopTempToken(route.params.id)
    tokenInfo.value = result
    tokenDialogVisible.value = true
  } catch (error) {
    console.error('获取令牌失败:', error)
    ElMessage.error('获取令牌失败，请稍后重试')
  } finally {
    tokenLoading.value = false
  }
}

const handleCopyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token)
    ElMessage.success('令牌已复制到剪贴板')
  } catch (error) {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = token
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('令牌已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
      ElMessage.error('复制失败，请手动复制')
    }
  }
}

const handleEdit = () => {
  dialogTitle.value = '修改店铺'
  currentShopId.value = route.params.id
  editDialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await shopFormRef.value.submit()
    editDialogVisible.value = false
    ElMessage.success('店铺更新成功')
    fetchShopDetail()
  } catch (error) {
    console.error('更新店铺失败:', error)
  }
}

const handleEditStatusFlow = () => {
  statusFlowData.value = JSON.parse(JSON.stringify(shopInfo.value.order_status_flow || getDefaultOrderStatusFlow()))
  statusFlowDialogVisible.value = true
}

const handleStatusFlowUpdate = (newStatusFlow) => {
  statusFlowData.value = newStatusFlow
}

const handleSaveStatusFlow = async () => {
  try {
    const updateData = {
      id: shopInfo.value.id,
      order_status_flow: statusFlowData.value
    }
    
    await updateOrderStatusFlow(updateData)
    
    ElMessage.success('状态流转更新成功')
    statusFlowDialogVisible.value = false
    
    fetchShopDetail()
  } catch (error) {
    console.error('更新状态流转失败:', error)
    ElMessage.error(error.response?.data?.message || '更新状态流转失败')
  }
}

onMounted(() => {
  fetchShopDetail()
})
</script>

<style scoped>
.shop-detail-page {
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

.shop-name-sub {
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

.shop-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.shop-status.valid {
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
}

.shop-status.invalid {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.shop-image-container {
  display: flex;
  justify-content: center;
}

.shop-image {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.shop-image:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.shop-image:hover .image-hint {
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

.settings-content {
  background: rgba(0, 0, 0, 0.02);
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
}

.settings-content pre {
  margin: 0;
  font-size: 13px;
  color: #1d1d1f;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
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

.token-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.token-info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.token-label {
  font-size: 13px;
  color: #86868b;
}

.token-value {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 500;
}

.token-with-copy {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-text {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  word-break: break-all;
  color: #1d1d1f;
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
