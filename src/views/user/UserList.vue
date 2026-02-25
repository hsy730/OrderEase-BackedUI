<template>
  <div class="user-list-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">用户管理</h1>
          <p class="page-description">管理和查看所有用户信息</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              v-model="searchKeyword"
              type="text"
              placeholder="搜索用户名..."
              @input="handleSearchInput"
            />
          </div>
          <button class="action-btn" @click="handleRefresh" title="刷新">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button class="action-btn primary" @click="showCreateDialog" v-if="isAdmin">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>新建用户</span>
          </button>
        </div>
      </div>

      <!-- 使用 DataTable 组件 -->
      <DataTable
        :data="userList"
        :loading="loading"
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :show-header="false"
        :show-operation="true"
        operation-width="140"
        @size-change="loadUsers"
        @current-change="loadUsers"
      >
        <el-table-column prop="name" label="用户名" min-width="180">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-avatar">{{ row.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
              <el-tooltip :content="row.name" placement="top" :disabled="!isNameOverflow(row.name)">
                <span class="user-name">{{ row.name }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" min-width="100">
          <template #default="{ row }">
            <span class="role-badge" :class="row.role">{{ getUserRoleLabel(row.role) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="120">
          <template #default="{ row }">
            <span class="phone-text">{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200">
          <template #default="{ row }">
            <span class="address-text">{{ row.address || '-' }}</span>
          </template>
        </el-table-column>

        <template #operation="{ row }">
          <div class="operation-buttons">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </div>
        </template>
      </DataTable>

      <!-- 使用 AppDialog 组件 -->
      <AppDialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="520px"
        :confirm-loading="submitting"
        @confirm="submitForm"
      >
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="apple-form">
          <el-form-item label="用户名" prop="name" :rules="[{ required: true, message: '请输入用户名' }]">
            <el-input v-model="form.name" :disabled="!!form.id" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item v-if="!form.id" label="密码" prop="password" required :rules="[{ required: true, message: '请输入密码' }]">
            <el-input v-model="form.password" type="password" show-password @input="formRef?.validateField('password')" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item v-else label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password @input="formRef?.validateField('password')" placeholder="不填写则保持原密码不变" />
          </el-form-item>
          <div class="form-row">
            <el-form-item label="电话" prop="phone" :rules="[{ validator: validatePhone, trigger: 'blur' }]">
              <el-input v-model="form.phone" placeholder="请输入电话号码" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型">
                <el-option label="邮寄" value="delivery" />
                <el-option label="自提" value="pickup" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色">
              <el-option label="公共用户" value="public_user" />
              <el-option label="普通用户" value="private_user" />
            </el-select>
          </el-form-item>
        </el-form>
      </AppDialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, deleteUser, updateUser } from '@/api/user'
import { getUserRoleLabel } from '@/utils/status'
import { isAdminRole } from '@/utils/auth'
import DataTable from '@/components/common/DataTable.vue'
import AppDialog from '@/components/common/AppDialog.vue'

const isNameOverflow = (name) => {
  if (!name) return false
  return name.length > 15
}

const userList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建用户')
const dialogType = ref('add')
const loading = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const isAdmin = isAdminRole()

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
let searchTimeout = null

const form = ref({
  id: null,
  name: '',
  password: '',
  role: 'private_user',
  shop_id: null,
  phone: '',
  address: '',
  type: 'delivery'
})

const rules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 500)
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchKeyword.value
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

const showCreateDialog = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新建用户'
  form.value = {
    id: null,
    name: '',
    password: '',
    role: 'private_user',
    shop_id: null,
    phone: '',
    address: '',
    type: 'delivery'
  }
  dialogVisible.value = true
}

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

const validatePhone = (rule, value, callback) => {
  if (!value) {
    return callback();
  }
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

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该用户？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser({id: id})
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

const handleRefresh = () => {
  loading.value = true
  loadUsers()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  loadUsers()
})

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
})
</script>

<style scoped>
.user-list-page {
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

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 40px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
  min-width: 220px;
}

.search-box:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-box svg {
  color: #86868b;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1d1d1f;
  outline: none;
}

.search-box input::placeholder {
  color: #86868b;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-weight: 500;
  color: #1d1d1f;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.role-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.user,
.role-badge.private_user {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.role-badge.system,
.role-badge.public_user {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.phone-text,
.address-text {
  font-size: 14px;
  color: #6e6e73;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
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
.apple-form :deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.apple-form :deep(.el-input__wrapper:hover),
.apple-form :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 0, 0, 0.2);
}

.apple-form :deep(.el-input__wrapper.is-focus),
.apple-form :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.apple-form :deep(.el-input__inner) {
  height: 40px;
}

.apple-form :deep(.el-input__inner::placeholder) {
  color: #86868b;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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
    flex-wrap: wrap;
  }
  
  .search-box {
    flex: 1;
    min-width: 160px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
