<template>
  <div class="shop-manage-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">店铺管理</h1>
          <p class="page-description">管理和查看所有店铺信息</p>
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
              placeholder="搜索店铺名称..."
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
            <span>新建店铺</span>
          </button>
        </div>
      </div>

      <div class="table-card">
        <el-table
          v-loading="loading"
          :data="shopList"
          class="shop-table"
        >
          <el-table-column label="店铺名称" min-width="180">
            <template #default="{ row }">
              <div class="shop-info">
                <span class="shop-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" min-width="200">
            <template #default="{ row }">
              <span class="time-text">{{ formatTime(row.valid_until) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <button class="op-btn view" @click="handleView(row)">查看</button>
                <button class="op-btn edit" @click="handleEdit(row)">编辑</button>
                <button class="op-btn delete" @click="handleDelete(row)">删除</button>
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
        width="720px"
        :close-on-click-modal="false"
        class="apple-dialog shop-dialog"
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

        <shop-form
          ref="shopFormRef"
          :shop-id="currentShopId"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    getShopList,
    deleteShop,
    createShop,
    updateShop,
    getShopDetail
} from '@/api/shop'
import ShopForm from '@/components/shop/ShopForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const shopFormRef = ref(null)
const shopList = ref([])
let searchTimeout = null

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

const fetchData = async () => {
  try {
    loading.value = true
    const response = await getShopList({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchText.value
    })
    shopList.value = response.data || []
    total.value = response.total || 1
  } catch (error) {
    ElMessage.error('获取店铺列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 500)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该店铺？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteShop(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentShopId = ref(null)

const handleAdd = () => {
  dialogTitle.value = '新增店铺'
  currentShopId.value = null
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    loading.value = true
    dialogTitle.value = '编辑店铺'
    currentShopId.value = row.id
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取店铺详情失败')
    console.error('编辑店铺错误:', error)
  } finally {
    loading.value = false
  }
}

const handleDialogClose = () => {
  if (shopFormRef.value) {
  }
}

const handleSubmit = async () => {
  try {
    await shopFormRef.value.submit()
    dialogVisible.value = false
    ElMessage.success(currentShopId.value ? '更新成功' : '添加成功')
    fetchData()
  } catch (error) {
    console.log('handleSubmit error', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

const handleView = (row) => {
  router.push(`/shop/${row.id}`)
}

const handleRefresh = () => {
  loading.value = true
  fetchData()
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
.shop-manage-page {
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

.shop-table {
  width: 100%;
}

.shop-table :deep(.el-table) {
  border: none;
}

.shop-table :deep(.el-table__border) {
  display: none;
}

.shop-table :deep(.el-table th.el-table__cell) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.shop-table :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.shop-table :deep(.el-table tr:hover > td) {
  background: rgba(0, 0, 0, 0.02) !important;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shop-name {
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1f;
}

.time-text {
  font-size: 14px;
  color: #6e6e73;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-btn {
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

.op-btn.delete {
  color: #ef4444;
}

.op-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.shop-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.shop-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.shop-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.shop-dialog :deep(.el-dialog__footer) {
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
