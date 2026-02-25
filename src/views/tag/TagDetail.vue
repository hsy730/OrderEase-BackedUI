<template>
  <div class="tag-detail-page">
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
            <h1 class="page-title">标签详情</h1>
            <p class="tag-name-sub">{{ tag.name }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="bindDialogVisible = true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>绑定商品</span>
          </button>
          <button class="action-btn danger" :disabled="selectedProducts.length === 0" @click="handleBatchUnbind">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            <span>批量解绑</span>
          </button>
        </div>
      </div>

      <div class="detail-content" v-loading="loading">
        <div class="main-content">
          <section class="info-card tag-info-section">
            <div class="section-header">
              <h2 class="section-title">基本信息</h2>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">标签ID</span>
                <span class="info-value">{{ tag.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">标签名称</span>
                <span class="info-value">{{ tag.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ formatTime(tag.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间</span>
                <span class="info-value">{{ formatTime(tag.updated_at) }}</span>
              </div>
            </div>
          </section>

          <section class="info-card description-section" v-if="tag.description">
            <div class="section-header">
              <h2 class="section-title">标签描述</h2>
            </div>
            <div class="description-content">
              <p>{{ tag.description }}</p>
            </div>
          </section>

          <section class="info-card products-section">
            <div class="section-header">
              <h2 class="section-title">已绑定商品</h2>
              <span class="item-count">{{ products.length }} 件商品</span>
            </div>
            <div class="products-table-wrapper">
              <el-table
                ref="productTable"
                :key="tableKey"
                :data="products"
                class="products-table"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="40" />
                <el-table-column label="商品信息" min-width="200">
                  <template #default="{ row }">
                    <div class="product-info">
                      <div class="product-name">{{ row.name }}</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="价格" width="120" align="right">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.price?.toFixed(2) || '0.00' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="100" align="center">
                  <template #default="{ row }">
                    <span :class="{ 'low-stock': row.stock < 10 }">{{ row.stock }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140" fixed="right">
                  <template #default="{ row }">
                    <div class="operation-buttons">
                      <el-button type="primary" link @click="viewProduct(row)">查看</el-button>
                      <el-button type="danger" link @click="handleUnbind(row)">解绑</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="fetchTagDetail"
                @size-change="fetchTagDetail"
              />
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <div class="info-card summary-card">
            <h2 class="section-title">标签摘要</h2>
            <div class="summary-list">
              <div class="summary-item">
                <span class="summary-label">绑定商品</span>
                <span class="summary-value">{{ pagination.total }} 件</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">创建时间</span>
                <span class="summary-value">{{ formatTime(tag.created_at) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">更新时间</span>
                <span class="summary-value">{{ formatTime(tag.updated_at) }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <BindProductDialog
      v-model:modelValue="bindDialogVisible"
      :tag-id="tag.id"
      @bind="handleBind"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTagDetail, getTagBoundProducts, unbindProductTag, bindProductTag } from '@/api/tag'
import { ElMessageBox, ElMessage } from 'element-plus'
import { formatTime } from '@/utils/date'
import BindProductDialog from '@/components/product/BindProductDialog.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tag = ref({})
const products = ref([])
const tableKey = ref(0)
const bindDialogVisible = ref(false)
const selectedProducts = ref([])
const productTable = ref(null)
const searchText = ref('')

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleBatchUnbind = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要解绑选中的 ${selectedProducts.value.length} 个商品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    const productIds = selectedProducts.value.map(p => p.id)
    await unbindProductTag(route.params.id, productIds)
    ElMessage.success('批量解绑成功')
    await fetchTagDetail()
    tableKey.value++
    selectedProducts.value = []
    productTable.value?.clearSelection()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量解绑失败')
      console.error('批量解绑失败:', error)
    }
  } finally {
    loading.value = false
  }
}

const handleBind = async (productIds) => {
  try {
    loading.value = true
    await bindProductTag(tag.value.id, productIds)
    ElMessage.success('绑定成功')
    await fetchTagDetail()
    tableKey.value++
  } catch (error) {
    ElMessage.error('绑定失败')
    console.error('绑定失败:', error)
  } finally {
    loading.value = false
  }
}

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchTagDetail = async () => {
  loading.value = true
  try {
    const [tagRes, productsRes] = await Promise.all([
      getTagDetail(route.params.id),
      getTagBoundProducts(route.params.id, {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        search: searchText.value
      })
    ])
    
    pagination.value.total = productsRes.total
    tag.value = {
      id: tagRes.id,
      name: tagRes.name,
      description: tagRes.description,
      created_at: tagRes.created_at,
      updated_at: tagRes.updated_at
    }
    products.value = productsRes.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      status: p.status,
      image_url: p.image_url,
      stock: p.stock
    }))
  } catch (error) {
    console.error('获取标签详情失败:', error)
  } finally {
    loading.value = false
  }
}

const viewProduct = (product) => {
  router.push({
    name: 'ProductDetail',
    params: { id: product.id }
  })
}

const handleUnbind = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要解绑商品 "${product.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    await unbindProductTag(route.params.id, [product.id])
    ElMessage.success('解绑成功')
    await fetchTagDetail()
    tableKey.value++
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('解绑失败')
      console.error('解绑失败:', error)
    }
  } finally {
    loading.value = false
  }
}



onMounted(() => {
  fetchTagDetail()
})
</script>

<style scoped>
.tag-detail-page {
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

.tag-name-sub {
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

.action-btn.danger {
  color: var(--color-danger);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.item-count {
  font-size: 14px;
  color: #86868b;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 12px;
  border-radius: 20px;
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

.products-table-wrapper {
  margin: 0 -24px;
  padding: 0 24px;
}

.products-table {
  width: 100%;
}

.products-table :deep(.el-table) {
  border: none;
}

.products-table :deep(.el-table__border) {
  display: none;
}

.products-table :deep(.el-table th.el-table__cell) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.products-table :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.products-table :deep(.el-table tr:hover > td) {
  background: rgba(0, 0, 0, 0.02) !important;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1f;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-danger);
}

.low-stock {
  color: var(--color-danger);
  font-weight: 500;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
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
