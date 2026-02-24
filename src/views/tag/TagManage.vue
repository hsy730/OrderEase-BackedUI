<template>
  <div class="tag-manage-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">标签管理</h1>
          <p class="page-description">管理和查看所有标签信息</p>
        </div>
        <div class="header-actions">
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
            <span>新建标签</span>
          </button>
        </div>
      </div>

      <div class="table-card">
        <el-table
          v-loading="loading"
          :data="tagList"
          class="tag-table"
        >
          <el-table-column label="标签名称" min-width="140">
            <template #default="{ row }">
              <div class="tag-info">
                <span class="tag-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="240">
            <template #default="{ row }">
              <span class="tag-desc">{{ row.description || '暂无描述' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <button class="op-btn view" @click="handleViewDetails(row)">查看</button>
                <button class="op-btn edit" @click="handleEdit(row)">编辑</button>
                <button class="op-btn delete" @click="handleDelete(row)">删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <el-dialog
        v-model="showDialog"
        :title="dialogType === 'add' ? '新增标签' : '编辑标签'"
        width="480px"
        :close-on-click-modal="false"
        class="apple-dialog tag-dialog"
        destroy-on-close
        :show-close="false"
      >
        <template #header>
          <div class="dialog-header">
            <h3 class="dialog-title">{{ dialogType === 'add' ? '新增标签' : '编辑标签' }}</h3>
            <button class="close-btn" @click="showDialog = false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="apple-form"
        >
          <el-form-item label="标签名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入标签名称" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入标签描述"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="showDialog = false">取消</button>
            <button class="btn-confirm" @click="handleSubmit" :disabled="submitting">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ submitting ? '提交中...' : '确定' }}</span>
            </button>
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="showProductDialog"
        title=""
        width="560px"
        class="apple-dialog product-dialog"
        destroy-on-close
        :show-close="false"
      >
        <template #header>
          <div class="dialog-header">
            <h3 class="dialog-title">选择商品</h3>
            <button class="close-btn" @click="showProductDialog = false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </template>

        <el-select
          v-model="selectedProducts"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入商品名称搜索"
          :remote-method="fetchProducts"
          :loading="productLoading"
          class="full-width-select"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>

        <template #footer>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="showProductDialog = false">取消</button>
            <button class="btn-confirm" @click="handleBatchTag">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTagList, createTag, updateTag, deleteTag, batchUpdateTags, getTagProducts } from '@/api/tag'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const handleViewDetails = (row) => {
  router.push(`/tag/${row.id}`)
}

const tagList = ref([])
const showDialog = ref(false)
const dialogType = ref('add')
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '',
  description: ''
})

const showProductDialog = ref(false)
const selectedTag = ref(null)
const selectedProducts = ref([])
const productOptions = ref([])
const productLoading = ref(false)

const fetchProducts = async (query = '') => {
  productLoading.value = true
  try {
    const res = await getTagProducts({
      keyword: query,
      tag_id: selectedTag.value?.id
    })
    productOptions.value = res.products.map(p => ({
      id: p.id,
      name: p.name
    }))
    selectedProducts.value = res.products
      .filter(p => p.has_tag)
      .map(p => p.id)
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    productLoading.value = false
  }
}

const handleAddProducts = async (row) => {
  selectedTag.value = row
  selectedProducts.value = []
  await fetchProducts()
  showProductDialog.value = true
}

const handleBatchTag = async () => {
  if (!selectedProducts.value.length) {
    ElMessage.warning('请选择至少一个商品')
    return
  }

  try {
    await batchUpdateTags({
      tag_id: selectedTag.value.id,
      product_ids: selectedProducts.value
    })
    ElMessage.success('批量打标签成功')
    showProductDialog.value = false
    fetchTagList()
  } catch (error) {
    console.error('批量打标签失败:', error)
    ElMessage.error('批量打标签失败')
  }
}

const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchTagList = async () => {
  loading.value = true
  try {
    const res = await getTagList({
      page: page.value,
      pageSize: pageSize.value
    })
    tagList.value = res.tags
    total.value = res.total
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  fetchTagList()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchTagList()
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.name = ''
  form.description = ''
  showDialog.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    description: row.description
  })
  showDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该标签？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteTag(row.id)
    ElMessage.success('删除成功')
    fetchTagList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
      ElMessage.error(error.response?.data?.error || '删除标签失败')
    }
  }
}

const handleSubmit = async () => {
  await formRef.value.validate()

  submitting.value = true
  try {
    if (dialogType.value === 'add') {
      await createTag({
        name: form.name,
        description: form.description
      })
      ElMessage.success('创建成功')
    } else {
      await updateTag({
        id: form.id,
        name: form.name,
        description: form.description
      })
      ElMessage.success('更新成功')
    }
    showDialog.value = false
    fetchTagList()
  } catch (error) {
    console.error('保存标签失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

const handleRefresh = () => {
  loading.value = true
  fetchTagList()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  fetchTagList()
})
</script>

<style scoped>
.tag-manage-page {
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

.tag-table {
  width: 100%;
}

.tag-table :deep(.el-table) {
  border: none;
}

.tag-table :deep(.el-table__border) {
  display: none;
}

.tag-table :deep(.el-table th.el-table__cell) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tag-table :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tag-table :deep(.el-table tr:hover > td) {
  background: rgba(0, 0, 0, 0.02) !important;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-name {
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1f;
}

.tag-desc {
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

.tag-dialog :deep(.el-dialog),
.product-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.tag-dialog :deep(.el-dialog__header),
.product-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.tag-dialog :deep(.el-dialog__body),
.product-dialog :deep(.el-dialog__body) {
  padding: 0 24px 24px;
}

.tag-dialog :deep(.el-dialog__footer),
.product-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
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

.apple-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  padding-bottom: 8px;
}

.apple-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.apple-form :deep(.el-input__wrapper),
.apple-form :deep(.el-textarea__inner) {
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.apple-form :deep(.el-input__wrapper:hover),
.apple-form :deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 0, 0, 0.2);
}

.apple-form :deep(.el-input__wrapper.is-focus),
.apple-form :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.apple-form :deep(.el-input__inner) {
  height: 40px;
}

.apple-form :deep(.el-input__inner::placeholder),
.apple-form :deep(.el-textarea__inner::placeholder) {
  color: #86868b;
}

.full-width-select {
  width: 100%;
}

.full-width-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.full-width-select :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
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
  }
}
</style>
