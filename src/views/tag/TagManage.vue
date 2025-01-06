<template>
  <div class="tag-manage">
    <div class="header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="handleAdd">新增标签</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tagList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="标签名称" min-width="120" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="product_count" label="商品数量" width="100" align="center" />
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加分页器 -->
    <div class="pagination-container">
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
            rows="3"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTagList, createTag, updateTag, deleteTag } from '@/api/tag'

const loading = ref(false)
const tagList = ref([])
const showDialog = ref(false)
const dialogType = ref('add')
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '',
  description: ''
})

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
      ElMessage.error('删除标签失败')
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

onMounted(() => {
  fetchTagList()
})
</script>

<style scoped>
.tag-manage {
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
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 