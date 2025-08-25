<template>
  <div class="tag-detail-container">
    <div class="tag-detail">
      <div class="header">
        <h2>标签详情</h2>
        <el-button @click="$router.back()">返回</el-button>
      </div>

      <div class="content" v-loading="loading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标签ID">{{ tag.id }}</el-descriptions-item>
          <el-descriptions-item label="标签名称">{{ tag.name }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(tag.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(tag.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ tag.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>

        <div class="product-list">
          <div class="list-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h3>已绑定商品</h3>
            <div class="action-buttons">
              <el-button
                type="primary"
                @click="bindDialogVisible = true"
              >
                绑定
              </el-button>
              <el-button
                type=""
                :disabled="selectedProducts.length === 0"
                @click="handleBatchUnbind"
              >
                解绑
              </el-button>
            </div>
          </div>
          <el-table
            ref="productTable"
            :key="tableKey"
            :data="products"
            border
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="35" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="price" label="价格" width="120">
              <template #default="{ row }">
                ¥{{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewProduct(row)">查看</el-button>
                <el-button type="danger" link @click="handleUnbind(row)">解绑</el-button>
              </template>
            </el-table-column>
          </el-table>
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
      </div>

      <BindProductDialog
        v-model:modelValue="bindDialogVisible"
        :tag-id="tag.id"
        @bind="handleBind"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTagDetail, getTagBoundProducts, unbindProductTag, bindProductTag } from '@/api/tag'
import { ElMessageBox, ElMessage } from 'element-plus'
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

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 批量解绑商品
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
    ElMessage.success('批量解绑成功，正在刷新商品列表...')
    await fetchTagDetail() // 刷新数据
    tableKey.value++ // 强制刷新表格
    selectedProducts.value = [] // 清空选择
    productTable.value.clearSelection() // 清除表格选择状态
    ElMessage.success('商品列表已更新')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量解绑失败')
      console.error('批量解绑失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 绑定商品
const handleBind = async (productIds) => {
  try {
    loading.value = true
    await bindProductTag(tag.value.id, productIds)
    ElMessage.success('绑定成功，正在刷新商品列表...')
    await fetchTagDetail() // 刷新数据
    tableKey.value++ // 强制刷新表格
    ElMessage.success('商品列表已更新')
  } catch (error) {
    ElMessage.error('绑定失败')
    console.error('绑定失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取标签详情
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

// 查看商品详情
const viewProduct = (product) => {
  router.push({
    name: 'ProductDetail',
    params: { id: product.id }
  })
}

// 解绑商品标签
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
    ElMessage.success('解绑成功，正在刷新商品列表...')
    loading.value = true
    await fetchTagDetail() // 刷新数据
    tableKey.value++ // 强制刷新表格
    ElMessage.success('商品列表已更新')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('解绑失败')
      console.error('解绑失败:', error)
    }
  } finally {
    loading.value = false
  }
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
  })
}

onMounted(() => {
  fetchTagDetail()
})
</script>

<style scoped>
.tag-detail-container {
  height: 100%;
  
  .tag-detail {
    padding: 20px;
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
  }

  .product-list {
    margin-top: 20px;
  }

  .product-list h3 {
    margin: 20px 0 10px;
    font-size: 16px;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .el-pagination {
    margin-top: 10px;
    padding: 0;
    display: flex;
    justify-content: flex-end;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
  }

  .el-pagination.is-background .btn-next,
  .el-pagination.is-background .btn-prev,
  .el-pagination.is-background .el-pager li {
    background-color: transparent;
    border: none;
    border-radius: 0;
  }

  .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #409eff;
    color: #fff;
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
}
</style>