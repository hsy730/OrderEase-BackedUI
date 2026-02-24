<template>
  <div class="shop-manage">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">店铺管理</h1>
        <p class="page-description">管理和查看所有店铺信息</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索店铺名称"
          clearable
          @input="handleSearchInput"
          style="width: 200px;"
        />
        <el-button type="primary" :icon="Plus" @click="handleAdd">新建</el-button>
        <el-button :icon="Refresh" @click="handleRefresh" title="刷新" style="margin-left: 0;"></el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="shopList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="店铺名称" width="200" />
      <el-table-column prop="valid_until" label="到期时间" min-width="250" />
      <el-table-column label="操作" width="220" fixed="right" >
        <template #default="{ row }">
          <el-button type="info" link @click="handleView(row)">查看</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="shop-dialog"
      @close="handleDialogClose"
    >
      <shop-form
        ref="shopFormRef"
        :shop-id="currentShopId"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

// 在 script 部分添加引入
<script setup>
import '@/assets/table-global.css'
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import {
    getShopList,
    deleteShop,
    createShop,
    updateShop,
    getShopDetail  // 新增详情接口
} from '@/api/shop'
import ShopForm from '@/components/shop/ShopForm.vue' // 新增引入表单组件
import { useRouter } from 'vue-router'

const loading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const shopFormRef = ref(null)
const shopList = ref([])

// 获取店铺列表
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

// 搜索处理
const handleSearchInput = () => {
  currentPage.value = 1
  fetchData()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

// 删除店铺
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
      // 使用后端返回的具体错误信息
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})

// 新增/编辑处理
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentShopId = ref(null)

const handleAdd = () => {
  dialogTitle.value = '新增店铺'
  currentShopId.value = null
  dialogVisible.value = true
}

// 编辑店铺
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

// 对话框关闭时重置表单
const handleDialogClose = () => {
  if (shopFormRef.value) {
    // shopFormRef.value.resetForm()
  }
}

// 提交表单
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

// 在script setup中添加查看方法
const router = useRouter()

const handleView = (row) => {
  router.push(`/shop/${row.id}`)
}

// 刷新数据
const handleRefresh = () => {
  loading.value = true
  fetchData()
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
.shop-manage {
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

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-input {
    flex: 1;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>

<style>
/* 对话框样式 - 使用全局选择器覆盖 Element Plus 默认样式 */
.shop-dialog .el-dialog__body {
  padding: 20px 24px;
}

.shop-dialog .el-dialog__footer {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
