<template>
  <div class="tag-detail">
    <div class="header">
      <h2>标签详情</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <div class="content" v-loading="loading">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标签ID">{{ tag.id }}</el-descriptions-item>
        <el-descriptions-item label="标签名称">{{ tag.name }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ tag.description || '暂无描述' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(tag.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(tag.updated_at) }}</el-descriptions-item>
      </el-descriptions>

      <div class="product-list">
        <h3>关联商品</h3>
        <el-table :data="products" border style="width: 100%">
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="price" label="价格" width="120" align="center">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewProduct(row)">查看</el-button>
              <el-button type="danger" link @click="handleUnbind(row)">解绑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTagDetail, unbindProductTag } from '@/api/tag'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const tag = ref({})
const products = ref([])

// 获取标签详情
const fetchTagDetail = async () => {
  loading.value = true
  try {
    const res = await getTagDetail(route.params.id)
    tag.value = {
      id: res.id,
      name: res.name,
      description: res.description,
      created_at: res.created_at,
      updated_at: res.updated_at
    }
    products.value = res.products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at
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
    await unbindProductTag(route.params.id, product.id)
    ElMessage.success('解绑成功')
    await fetchTagDetail() // 刷新数据
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
</style>