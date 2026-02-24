<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    title=""
    width="720px"
    :before-close="handleClose"
    class="apple-dialog bind-product-dialog"
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">绑定商品</h3>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </template>

    <div class="dialog-content">
      <div class="search-section">
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="queryParams.keyword"
            type="text"
            placeholder="搜索商品名称..."
            @keyup.enter="handleSearch"
          />
          <button v-if="queryParams.keyword" class="clear-btn" @click="clearSearch">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <button class="search-btn" @click="handleSearch">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>搜索</span>
        </button>
      </div>

      <div class="products-section" v-loading="loading">
        <div class="section-header">
          <span class="section-title">可选商品</span>
          <span class="selected-count" v-if="selectedProducts.length > 0">
            已选择 {{ selectedProducts.length }} 件
          </span>
        </div>

        <div class="products-table-wrapper">
          <el-table
            :data="products"
            class="products-table"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="40" />
            <el-table-column label="商品名称" min-width="200">
              <template #default="{ row }">
                <div class="product-info">
                  <span class="product-name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" width="120" align="right">
              <template #default="{ row }">
                <span class="price">¥{{ row.price?.toFixed(2) || '0.00' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <button class="bind-btn" @click="handleBind(row)">绑定</button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.limit"
            :total="total"
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 50]"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-confirm" @click="handleBatchBind">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>绑定选中</span>
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getUnboundProducts } from '@/api/tag'
import { ElMessage } from 'element-plus'

const props = defineProps({
  tagId: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'refresh', 'bind'])

const loading = ref(false)
const products = ref([])
const total = ref(0)
const selectedProducts = ref([])

const queryParams = ref({
  page: 1,
  limit: 10,
  keyword: ''
})

const fetchUnboundProducts = async () => {
  try {
    loading.value = true
    const res = await getUnboundProducts(props.tagId, {
      page: queryParams.value.page,
      pageSize: queryParams.value.limit,
      keyword: queryParams.value.keyword
    })
    products.value = res.data
    total.value = res.total
  } catch (error) {
    console.error('获取未绑定商品失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.value.page = 1
  fetchUnboundProducts()
}

const clearSearch = () => {
  queryParams.value.keyword = ''
  handleSearch()
}

const handleSizeChange = (size) => {
  queryParams.value.limit = size
  fetchUnboundProducts()
}

const handlePageChange = (page) => {
  queryParams.value.page = page
  fetchUnboundProducts()
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleBind = (product) => {
  emit('bind', [product.id])
  handleClose()
}

const handleBatchBind = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要绑定的商品')
    return
  }
  const productIds = selectedProducts.value.map(p => p.id)
  emit('bind', productIds)
  handleClose()
}

const handleClose = () => {
  emit('update:modelValue', false)
  return false
}

watch(() => props.modelValue, (val) => {
  if (val) {
    queryParams.value = {
      page: 1,
      limit: 10,
      keyword: ''
    }
    selectedProducts.value = []
    fetchUnboundProducts()
  }
}, { immediate: true })
</script>

<style scoped>
.bind-product-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.bind-product-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.bind-product-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.bind-product-dialog :deep(.el-dialog__footer) {
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

.dialog-content {
  padding: 24px;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 44px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #3b82f6;
  background: #ffffff;
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

.clear-btn {
  border: none;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  color: #86868b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #1d1d1f;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 18px;
  height: 44px;
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

.search-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.products-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.selected-count {
  font-size: 13px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.products-table-wrapper {
  max-height: 320px;
  overflow-y: auto;
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
  background: transparent;
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
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-danger);
}

.bind-btn {
  padding: 6px 14px;
  background: rgba(59, 130, 246, 0.1);
  border: none;
  border-radius: 6px;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bind-btn:hover {
  background: #3b82f6;
  color: #ffffff;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
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
</style>
