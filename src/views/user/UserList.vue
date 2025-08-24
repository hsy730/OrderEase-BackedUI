<template>
  <div class="user-manage">
    <div class="header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showCreateDialog" v-if="isAdmin">新建用户</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="userList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="用户名" min-width="120"></el-table-column>
      <el-table-column prop="role" label="角色" min-width="100"></el-table-column>
      <el-table-column prop="phone" label="电话" min-width="120"></el-table-column>
      <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
            <el-form-item label="密码" prop="password" >
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="邮寄" value="delivery" />
            <el-option label="自提" value="pickup" />
            <el-option label="系统用户" value="system" />
          </el-select>
        </el-form-item>
      
        <el-form-item label="角色" prop="role" :rules="[{ required: true, message: '请选择用户角色' }]">
          <el-select v-model="form.role">
            <el-option label="公共用户" value="system" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item> 
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, deleteUser, updateUser } from '@/api/user'

const userList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建用户')
const dialogType = ref('add')
const loading = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const isAdmin = JSON.parse(localStorage.getItem('admin') || '{}').role === 'admin'

// 分页相关
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const form = ref({
  id: null,
  name: '',
  password: '',
  role: 'user',
  shop_id: null,
  phone: '',
  address: '',
  type: 'delivery'
})
// 获取用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: page.value,
      page_size: pageSize.value
    })
    userList.value = res.data
    total.value = res.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  loadUsers()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  page.value = val
  loadUsers()
}

const showCreateDialog = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新建用户'
  form.value = {
    id: null,
    name: '',
    password: '',
    role: 'user',
    shop_id: null,
    phone: '',
    address: '',
    type: 'delivery'
  }
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑用户'
  form.value = {
    id: row.id,
    name: row.name,
    password: '',
    role: row.role,
    shop_id: row.shop_id || null,
    phone: row.phone || '',
    address: row.address || '',
    type: row.type || 'delivery'
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate()
  
  submitting.value = true
  try {
    if (dialogType.value === 'add') {
      await createUser({
        ...form.value
      })
      ElMessage.success('创建成功')
    } else {
      // 对于编辑，只提交非空密码
      const data = { ...form.value }
      if (!data.password) {
        delete data.password
      }
      await updateUser(data)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    loadUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

// 删除用户
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该用户吗？删除后不可恢复', '提示', { type: 'warning' })
    await deleteUser({id: id})
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-manage {
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

:deep(.el-button--primary.is-link),
:deep(.el-button--danger.is-link) {
  padding: 4px 8px;
  height: auto;
  font-size: 13px;
  margin: 0;
  min-width: auto;
}
</style>