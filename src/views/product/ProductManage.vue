<template>
  <div class="product-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>商品管理</h2>
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索商品名称"
            clearable
            @input="handleSearchInput"
            style="width: 200px; margin-right: 10px;"
          />
        </div>
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="productList"
        border
        style="width: 100%"
      >
        <el-table-column label="商品信息" min-width="260" align="center">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                v-if="row.image_url"
                :src="getImageUrl(row.image_url)"
                class="product-image"
                :preview-teleported="false"
                :preview-disabled="true"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-detail">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-desc">{{ row.description || '暂无描述' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="center">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.price || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.stock < 10 }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150" align="center">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="150" align="center">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="info" link @click="handleView(row)">查看</el-button>
              <el-divider direction="vertical" />
              <el-button 
                v-if="row.status === 'pending' || row.status === ''"
                type="success" 
                link 
                @click="handleStatusChange(row, 'online')"
              >
                上架
              </el-button>
              <el-button 
                v-if="row.status === 'online'"
                type="warning" 
                link 
                @click="handleStatusChange(row, 'offline')"
              >
                下架
              </el-button>
              <el-divider direction="vertical" />
              <el-dropdown>
                <el-button type="primary" link>
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEdit(row)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="handleManageTags(row)">管理标签</el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(row)" style="color: #f56c6c;">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
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
      width="500px"
    >
      <product-form
        ref="productFormRef"
        :product-id="currentProductId"
        @submit="handleSubmitSuccess"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <tag-manage-dialog ref="tagManageDialogRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, ArrowDown } from '@element-plus/icons-vue'
import ProductForm from '@/components/product/ProductForm.vue'
import TagManageDialog from '@/components/product/TagManageDialog.vue'
import { getProductList, deleteProduct, updateProductStatus } from '@/api/product'
import { API_BASE_URL, API_PREFIX } from '@/config'

const router = useRouter()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentProductId = ref(null)
const productList = ref([])
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const productFormRef = ref(null)
const tagManageDialogRef = ref(null)
const searchText = ref('')
let searchTimeout = null

// 处理搜索输入
const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProductList()
  }, 500)
}

// 获取商品列表
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

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}${API_PREFIX}/product/image?path=${cleanPath}`
}

// 格式化时间
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

// 新增商品
const handleAdd = () => {
  dialogTitle.value = '新增商品'
  currentProductId.value = null
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  currentProductId.value = row.id
  dialogVisible.value = true
}

// 查看商品
const handleView = (row) => {
  router.push(`/product/${row.id}`)
}

// 管理标签
const handleManageTags = (row) => {
  tagManageDialogRef.value?.open({
    productId: row.id,
    productName: row.name
  })
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('商品删除后不可恢复，确认删除商品？', '提示', {
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
    ElMessage.error('删除失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.submit()
    dialogVisible.value = false
    ElMessage.success(currentProductId.value ? '更新成功' : '添加成功')
    // 刷新商品列表
    fetchProductList()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.error || '保存失败')
  }
}

// 对话框关闭时重置表单
const handleDialogClosed = () => {
  currentProductId.value = null
  formRef.value?.reset()
}

const handleSubmitSuccess = () => {
  dialogVisible.value = false
  // 可以在这里刷新商品列表
}

// 处理状态变更
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
    row.status = newStatus // 更新本地状态
    ElMessage.success(newStatus === 'online' ? '商品已上架' : '商品已下架')
  } catch (error) {
    if (error === 'cancel') return
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    fetchProductList()
  }
}

onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.product-manage {
  height: 100%;
}

.content-wrapper {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #ebeef5;
}

.image-placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  border: 1px solid #ebeef5;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.price {
  font-size: 14px;
  font-weight: 500;
  color: #f56c6c;
}

.low-stock {
  color: #f56c6c;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
  font-size: 13px;
}

:deep(.el-table .cell) {
  padding: 0;
  line-height: 1.4;
}

:deep(.el-button--primary.is-link),
:deep(.el-button--danger.is-link) {
  padding: 4px 8px;
  height: auto;
  font-size: 13px;
}

:deep(.el-button--primary.is-link) {
  color: #409eff;
}

:deep(.el-button--danger.is-link) {
  color: #f56c6c;
}

/* 调整表格行高 */
:deep(.el-table__row) {
  height: 56px;
}

/* 优化表格头部样式 */
:deep(.el-table__header) th {
  font-weight: 500;
  color: #606266;
  font-size: 13px;
}

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  gap: 4px;
}

:deep(.el-button--primary.is-link),
:deep(.el-button--danger.is-link) {
  padding: 4px 8px;
  height: auto;
  font-size: 13px;
  margin: 0;
  min-width: auto;
}

:deep(.el-divider--vertical) {
  height: 1em;
  margin: 0;
}
</style>
