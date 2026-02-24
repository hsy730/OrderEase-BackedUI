<template>
  <div class="tag-manage">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">标签管理</h1>
        <p class="page-description">管理和查看所有标签信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新建</el-button>
        <el-button :icon="Refresh" @click="handleRefresh" title="刷新"></el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="tagList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="标签名称" min-width="120" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <!-- <el-table-column prop="product_count" label="商品数量" width="100" align="center" /> -->
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="info" link @click="handleViewDetails(row)">查看</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <!--<el-button type="success" link @click="handleAddProducts(row)">添加商品</el-button>-->
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
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

    <!-- 标签表单对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogType === 'add' ? '新增标签' : '编辑标签'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
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
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 商品选择对话框 -->
    <el-dialog
      v-model="showProductDialog"
      title="选择商品"
      width="600px"
    >
      <el-select
        v-model="selectedProducts"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="请输入商品名称"
        :remote-method="fetchProducts"
        :loading="productLoading"
        style="width: 100%"
      >
        <el-option
          v-for="item in productOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="showProductDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBatchTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import '@/assets/table-global.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { getTagList, createTag, updateTag, deleteTag, batchUpdateTags, getTagProducts } from '@/api/tag'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

// 查看详情
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

// 批量打标签相关
const showProductDialog = ref(false)
const selectedTag = ref(null)
const selectedProducts = ref([])
const productOptions = ref([])
const productLoading = ref(false)

// 获取商品列表
const fetchProducts = async (query = '') => {
  productLoading.value = true
  try {
    const res = await getTagProducts({
      keyword: query,
      // page: 1,
      // pageSize: 10,
      tag_id: selectedTag.value?.id
    })
    productOptions.value = res.products.map(p => ({
      id: p.id,
      name: p.name
    }))
    // 设置已选商品
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

// 添加商品
const handleAddProducts = async (row) => {
  selectedTag.value = row
  selectedProducts.value = []
  await fetchProducts()
  showProductDialog.value = true
}

// 提交批量打标签
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

// 分页相关
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取标签列表
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

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  fetchTagList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  page.value = val
  fetchTagList()
}

// 新增标签
const handleAdd = () => {
  dialogType.value = 'add'
  form.name = ''
  form.description = ''
  showDialog.value = true
}

// 编辑标签
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    description: row.description
  })
  showDialog.value = true
}

// 删除标签
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该标签吗？删除后不可恢复', '提示', {
      type: 'warning'
    })
    await deleteTag(row.id)
    ElMessage.success('删除成功')
    fetchTagList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
      // 使用后端返回的具体错误信息
      ElMessage.error(error.response?.data?.error || '删除标签失败')
    }
  }
}

// 提交表单
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

// 刷新数据
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
.tag-manage {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.page-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-button--primary.is-link),
:deep(.el-button--danger.is-link),
:deep(.el-button--info.is-link) {
  padding: 4px 8px;
  height: auto;
  font-size: 13px;
  margin: 0;
  min-width: auto;
}

:deep(.el-button--primary.is-link) {
  color: #409eff;
}

:deep(.el-button--danger.is-link) {
  color: #f56c6c;
}

:deep(.el-button--info.is-link) {
  color: #909399;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .header-actions {
    width: 100%;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
