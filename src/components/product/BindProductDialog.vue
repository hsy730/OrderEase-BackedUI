<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    title="绑定商品"
    width="800px"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <div class="filter-container">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索商品名称"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="products"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleBind(row)">绑定</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleBatchBind">批量绑定</el-button>
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

const emit = defineEmits(['update:visible', 'refresh'])

const loading = ref(false)
const products = ref([])
const total = ref(0)
const selectedProducts = ref([])

const queryParams = ref({
  page: 1,
  limit: 10,
  keyword: ''
})

// 获取未绑定商品列表
const fetchUnboundProducts = async () => {
  try {
    loading.value = true
    const res = await getUnboundProducts(props.tagId, {
      page: queryParams.value.page,
      pageSize: queryParams.value.limit,
      keyword: queryParams.value.keyword
    })
    products.value = res.items
    total.value = res.total
  } catch (error) {
    console.error('获取未绑定商品失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  queryParams.value.page = 1
  fetchUnboundProducts()
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  queryParams.value.limit = size
  fetchUnboundProducts()
}

// 处理页码变化
const handlePageChange = (page) => {
  queryParams.value.page = page
  fetchUnboundProducts()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 处理绑定单个商品
const handleBind = (product) => {
  emit('bind', [product.id])
  handleClose()
}

// 处理批量绑定
const handleBatchBind = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要绑定的商品')
    return
  }
  const productIds = selectedProducts.value.map(p => p.id)
  emit('bind', productIds)
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
  return false // Prevent default close behavior
}

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  if (val) {
    // 重置搜索条件
    queryParams.value = {
      page: 1,
      limit: 10,
      keyword: ''
    }
    fetchUnboundProducts()
  }
}, { immediate: true })
</script>

<style scoped>
.dialog-content {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>