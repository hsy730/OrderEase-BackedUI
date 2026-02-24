<template>
  <div class="user-manage">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">用户管理</h1>
        <p class="page-description">管理和查看所有用户信息</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索用户名"
          clearable
          @input="handleSearchInput"
          style="width: 200px;"
        />
        <el-button type="primary" :icon="Plus" @click="showCreateDialog" v-if="isAdmin">新建</el-button>
        <el-button :icon="Refresh" @click="handleRefresh" title="刷新" style="margin-left: 0;"></el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="userList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="用户名" min-width="120"></el-table-column>
      <el-table-column prop="role" label="角色" min-width="100" :formatter="formatRole"></el-table-column>
      <el-table-column prop="phone" label="电话" min-width="120"></el-table-column>
      <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="name" :rules="[{ required: true, message: '请输入用户名' }]">
          <el-input v-model="form.name" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item v-if="!form.id" label="密码" prop="password" required :rules="[{ required: true, message: '请输入密码' }]">
          <el-input v-model="form.password" type="password" show-password @input="formRef?.validateField('password')" />
        </el-form-item>
        <el-form-item v-else label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password @input="formRef?.validateField('password')" placeholder="不填写则保持原密码不变" />
        </el-form-item>
        <el-form-item label="电话" prop="phone" :rules="[{ validator: validatePhone, trigger: 'blur' }]">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="邮寄" value="delivery" />
            <el-option label="自提" value="pickup" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role">
            <el-option label="公共用户" value="public_user" />
            <el-option label="普通用户" value="private_user" />
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
import '@/assets/table-global.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { getUserList, createUser, deleteUser, updateUser } from '@/api/user'

// 角色格式化函数
const formatRole = (row) => {
  const roleMap = {
    'user': '普通用户',
    'system': '公共用户'
  }
  return roleMap[row.role] || row.role;
}

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
const searchText = ref('')
let searchTimeout = null

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
// 处理搜索输入
const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadUsers()
  }, 500)
}

// 获取用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: page.value,
      page_size: pageSize.value,
      search: searchText.value
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
// 验证电话格式
const validatePhone = (rule, value, callback) => {
  if (!value) {
    return callback();
  }
  // 匹配中国大陆手机号和固定电话的正则表达式
  const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;
  if (phoneRegex.test(value)) {
    callback();
  } else {
    callback(new Error('请输入有效的电话号码'));
  }
};

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
      console.log('更新用户数据:', data)
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
      // 使用后端返回的具体错误信息
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

// 刷新数据
const handleRefresh = () => {
  loading.value = true
  loadUsers()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-manage {
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
