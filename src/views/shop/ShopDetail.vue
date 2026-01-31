<template>
  <div class="shop-detail">
    <div class="header">
      <h2>{{ shopInfo.name }} 详情</h2>
      <div class="header-actions">
        <el-button  @click="handleGetTempToken">获取令牌</el-button>
        <el-button  @click="handleEdit">修改店铺</el-button>
        <el-button  @click="handleEditStatusFlow">状态流转</el-button>
        <el-button v-if="isAdminRole()" @click="$router.back()">返回</el-button>
      </div>
    </div>

    <!-- 编辑店铺对话框 -->
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

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="20">
        <!-- 左侧店铺信息 -->
        <el-col :span="3">
          <!-- 店铺图片展示区 -->
          <div class="shop-image" v-if="shopInfo.image_url">
            <SmartImage
          :src="getImageUrl(shopInfo.image_url)"
          alt="店铺图片"
          class="thumbnail"
          @click="handlePreview"
          @error="handleImageError"
        />
            <div class="image-hint">
              <el-icon><ZoomIn /></el-icon>
              <span>点击查看大图</span>
            </div>
          </div>
          <div class="no-image" v-else>
            <span>暂无店铺图片</span>
          </div>
        </el-col>

        <!-- 右侧店铺详情 -->

        <el-col :span="21">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="店铺ID">{{ shopInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="店铺名称">
              {{ shopInfo.name }}
               <span class="shop-status" :class="isValid ? 'valid' : 'invalid'">{{ isValid ? '营业中' : '已过期' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="店主账号">{{ shopInfo.owner_username }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ shopInfo.contact_phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ shopInfo.contact_email }}</el-descriptions-item>
            <el-descriptions-item label="店铺地址">{{ shopInfo.address || '暂无地址' }}</el-descriptions-item>
            <el-descriptions-item label="有效期至">{{ formatTime(shopInfo.valid_until) }}</el-descriptions-item>
            <el-descriptions-item label="店铺描述">
              {{ shopInfo.description || '暂无描述' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="isAdminRole()" label="店铺设置">
              <pre class="settings-content">{{ JSON.stringify(shopInfo.settings, null, 2) || '暂无设置' }}</pre>
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
    
    <!-- 图片预览对话框 -->
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
    
    <!-- 令牌显示对话框 -->
    <el-dialog
      v-model="tokenDialogVisible"
      title="店铺临时令牌"
      width="500px"
      center
      append-to-body
    >
      <div class="token-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="店铺ID">{{ tokenInfo.shop_id }}</el-descriptions-item>
          <el-descriptions-item label="临时令牌">
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
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ formatTime(tokenInfo.expires_at) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="tokenDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 状态流转编辑对话框 -->
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
import { Picture, ZoomIn, CopyDocument } from '@element-plus/icons-vue'
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

// 编辑店铺相关状态
const editDialogVisible = ref(false)
const dialogTitle = ref('')
const currentShopId = ref(null)
const shopFormRef = ref(null)

// 状态流转编辑相关状态
const statusFlowDialogVisible = ref(false)
const statusFlowData = ref(getDefaultOrderStatusFlow())
const orderStatusFlowRef = ref(null)

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
    
    // 初始化状态流转数据
    statusFlowData.value = shopData.order_status_flow || getDefaultOrderStatusFlow()
  } catch (tagsError) {
    console.error('获取店铺标签失败:', tagsError)
    shopInfo.value.tags = []
    // 初始化状态流转数据
    statusFlowData.value = getDefaultOrderStatusFlow()
  }
  loading.value = false
}

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  return getShopImageUrl(path)
}

// 处理图片预览
const handlePreview = () => {
  if (shopInfo.value.image_url) {
    dialogVisible.value = true
  }
}

// 处理图片加载错误
const handleImageError = () => {
  console.error('店铺图片加载失败')
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

// 获取店铺临时令牌
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

// 复制令牌到剪贴板
const handleCopyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token)
    ElMessage.success('令牌已复制到剪贴板')
  } catch (error) {
    // 降级方案：使用传统方法
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

// 编辑店铺
const handleEdit = () => {
  dialogTitle.value = '修改店铺'
  currentShopId.value = route.params.id
  editDialogVisible.value = true
}

// 提交编辑表单
const handleSubmit = async () => {
  try {
    await shopFormRef.value.submit()
    editDialogVisible.value = false
    ElMessage.success('店铺更新成功')
    // 刷新店铺详情
    fetchShopDetail()
  } catch (error) {
    console.error('更新店铺失败:', error)
  }
}

// 打开状态流转编辑对话框
const handleEditStatusFlow = () => {
  // 深拷贝状态流转数据，避免直接修改原始数据
  statusFlowData.value = JSON.parse(JSON.stringify(shopInfo.value.order_status_flow || getDefaultOrderStatusFlow()))
  statusFlowDialogVisible.value = true
}

// 处理状态流转数据更新
const handleStatusFlowUpdate = (newStatusFlow) => {
  statusFlowData.value = newStatusFlow
}

// 保存状态流转数据
const handleSaveStatusFlow = async () => {
  try {
    // 构建更新数据
    const updateData = {
      id: shopInfo.value.id,
      order_status_flow: statusFlowData.value
    }
    
    // 调用更新接口
    await updateOrderStatusFlow(updateData)
    
    ElMessage.success('状态流转更新成功')
    statusFlowDialogVisible.value = false
    
    // 刷新店铺详情
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
.shop-detail {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.token-content {
  margin: 20px 0;
}

.token-with-copy {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.token-text {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  word-break: break-all;
  color: #303133;
}

.copy-button {
  flex-shrink: 0;
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
  max-width: 200px;
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
  max-width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  background: #f5f7fa;
  border-radius: 8px;
}

.image-preview-container {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
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

.settings-content {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.el-descriptions) {
    padding: 0;
  }

  :deep(.el-descriptions__body) {
    background-color: transparent;
  }

  :deep(.el-descriptions__label) {
    width: 120px;
    min-width: 120px;
  }
</style>