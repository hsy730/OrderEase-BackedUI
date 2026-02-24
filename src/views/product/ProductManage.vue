<template>
  <div class="product-manage-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">商品管理</h1>
          <p class="page-description">管理和查看所有商品信息</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              v-model="searchText"
              type="text"
              placeholder="搜索商品名称..."
              @input="handleSearchInput"
            />
          </div>
          <button class="action-btn" @click="handleRefresh" title="刷新">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button class="action-btn primary" @click="handleAdd">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>新建商品</span>
          </button>
        </div>
      </div>

      <div class="table-card">
        <el-table
          v-loading="loading"
          :data="productList"
          class="product-table"
        >
          <el-table-column label="商品信息" min-width="200">
            <template #default="{ row }">
              <div class="product-info">
                <div class="product-image">
                  <SmartImage
                    v-if="row.image_url"
                    :src="getImageUrl(row.image_url)"
                    :alt="row.name"
                  />
                  <div v-else class="image-placeholder">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                </div>
                <div class="product-detail">
                  <div class="product-name">{{ row.name }}</div>
                  <div class="product-desc">{{ row.description || '暂无描述' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="100" align="right">
            <template #default="{ row }">
              <span class="price">¥{{ Number(row.price || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" align="center">
            <template #default="{ row }">
              <span :class="['stock-badge', { 'low': row.stock < 10 }]">{{ row.stock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <span class="status-badge" :class="row.status">
                {{ row.status === 'online' ? '已上架' : '已下架' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="140">
            <template #default="{ row }">
              <span class="time-text">{{ formatTime(row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="140">
            <template #default="{ row }">
              <span class="time-text">{{ formatTime(row.updated_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <button class="op-btn view" @click="handleView(row)">查看</button>
                <button class="op-btn edit" @click="handleEdit(row)">编辑</button>
                <el-dropdown trigger="click">
                  <button class="op-btn more">
                    更多
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-if="row.status !== 'online'"
                        @click="handleStatusChange(row, 'online')"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#34c759" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style="color: #34c759;">上架</span>
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="row.status === 'online'"
                        @click="handleStatusChange(row, 'offline')"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ff9500" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <span style="color: #ff9500;">下架</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleManageTags(row)">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#3b82f6" stroke-width="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <span>管理标签</span>
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleDelete(row)" divided>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ef4444" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                        <span style="color: #ef4444;">删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="920px"
        :close-on-click-modal="false"
        class="apple-dialog product-dialog"
        destroy-on-close
        :show-close="false"
      >
        <template #header>
          <div class="dialog-header">
            <h3 class="dialog-title">{{ dialogTitle }}</h3>
            <button class="close-btn" @click="dialogVisible = false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </template>

        <product-form
          ref="productFormRef"
          :product-id="currentProductId"
          @submit="handleSubmitSuccess"
        />

        <template #footer>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="dialogVisible = false">取消</button>
            <button class="btn-confirm" @click="handleSubmit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>确定</span>
            </button>
          </div>
        </template>
      </el-dialog>

      <tag-manage-dialog ref="tagManageDialogRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SmartImage from '@/components/SmartImage.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import TagManageDialog from '@/components/product/TagManageDialog.vue'
import { getProductList, deleteProduct, updateProductStatus, getProductImageUrl } from '@/api/product'

const router = useRouter()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentProductId = ref(null)
const productList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const productFormRef = ref(null)
const tagManageDialogRef = ref(null)
const searchText = ref('')
let searchTimeout = null

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProductList()
  }, 500)
}

const fetchProductList = async () => {
  loading.value = true
  try {
    const response = await getProductList({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchText.value
    })
    productList.value = response.data || []
    total.value = response.total || 0
    currentPage.value = response.page || 1
    pageSize.value = response.pageSize || 10
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    productList.value = []
  } finally {
    loading.value = false
  }
}

const getImageUrl = (path) => {
  return getProductImageUrl(path)
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
  }).replace(/\//g, '-')
}

const handleAdd = () => {
  dialogTitle.value = '新增商品'
  currentProductId.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  currentProductId.value = row.id
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/product/${row.id}`)
}

const handleManageTags = (row) => {
  tagManageDialogRef.value?.open({
    productId: row.id,
    productName: row.name
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该商品？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchProductList()
  } catch (error) {
    if (error === 'cancel') return
    console.error('删除商品失败:', error)
    ElMessage.error(error.response?.data?.error || '删除失败')
  }
}

const handleSubmit = async () => {
  if (!productFormRef.value) return

  try {
    await productFormRef.value.submit()
    dialogVisible.value = false
    ElMessage.success(currentProductId.value ? '更新成功' : '添加成功')
    fetchProductList()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.error || '保存失败')
  }
}

const handleSubmitSuccess = () => {
  dialogVisible.value = false
}

const handleStatusChange = async (row, newStatus) => {
  const confirmMessage = newStatus === 'online'
    ? '商品上架后，才能购买，确认上架？'
    : '商品下架后，不能购买，确认下架？'

  try {
    await ElMessageBox.confirm(confirmMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await updateProductStatus(row.id, newStatus)
    row.status = newStatus
    ElMessage.success(newStatus === 'online' ? '商品已上架' : '商品已下架')
  } catch (error) {
    if (error === 'cancel') return
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    fetchProductList()
  }
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchProductList()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchProductList()
}

const handleRefresh = () => {
  loading.value = true
  fetchProductList()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.product-manage-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.page-description {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 40px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
  min-width: 220px;
}

.search-box:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-box svg {
  color: #86868b;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1d1d1f;
  outline: none;
}

.search-box input::placeholder {
  color: #86868b;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 40px;
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.table-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.product-table {
  width: 100%;
}

.product-table :deep(.el-table) {
  border: none;
}

.product-table :deep(.el-table__border) {
  display: none;
}

.product-table :deep(.el-table th.el-table__cell) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.product-table :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.product-table :deep(.el-table tr:hover > td) {
  background: rgba(0, 0, 0, 0.02) !important;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1f;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-desc {
  font-size: 12px;
  color: #86868b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-danger);
}

.stock-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.stock-badge.low {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.online {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-badge.offline {
  background: rgba(0, 0, 0, 0.06);
  color: #86868b;
}

.time-text {
  font-size: 13px;
  color: #6e6e73;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.op-btn.view {
  color: #86868b;
}

.op-btn.view:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
}

.op-btn.edit {
  color: #3b82f6;
}

.op-btn.edit:hover {
  background: rgba(59, 130, 246, 0.1);
}

.op-btn.more {
  color: #86868b;
}

.op-btn.more:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.product-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.product-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.product-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.product-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1d1d1f;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.01);
}

.btn-cancel {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.08);
}

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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
  
  .search-box {
    flex: 1;
    min-width: 160px;
  }
}
</style>
