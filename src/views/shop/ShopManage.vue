<template>
  <div class="shop-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>店铺管理</h2>
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索店铺名称"
            clearable
            @input="handleSearchInput"
            style="width: 200px; margin-right: 10px;"
          />
        </div>
        <el-button type="primary" @click="handleAdd">新增店铺</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="shopList"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="店铺名称" width="200" align="center" />
        <el-table-column prop="valid_until" label="到期时间" min-width="250" />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
    </div>

    <!-- 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <shop-form
        ref="shopFormRef"
        :form-data="formData"
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
    getShopList, 
    deleteShop,
    createShop,  // 新增
    updateShop   // 新增
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
    await ElMessageBox.confirm('确认删除该店铺？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteShop(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})

// 新增/编辑处理
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})

const handleAdd = () => {
  dialogTitle.value = '新增店铺'
  formData.value = {
    owner_username: '',
    owner_password: '',
    name: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    valid_until: new Date().toISOString(),
    address: '',
    settings: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑店铺'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    await shopFormRef.value.submit()
    dialogVisible.value = false
    ElMessage.success(formData.value.id ? '更新成功' : '添加成功')  // 改为使用 formData 的 id 判断
    fetchData()
  } catch (error) {
    console.log('handleSubmit error', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

// 在script setup中添加查看方法
const router = useRouter()

const handleView = (row) => {
  router.push(`/shop/detail/${row.id}`)
}
</script>

<style scoped>
.shop-manage {
  height: 100%;
}

.content-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  margin-right: 20px;
}

.search-box {
  flex: 1;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>