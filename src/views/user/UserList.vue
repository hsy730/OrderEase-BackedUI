<template>
  <div class="container">
    <el-button type="primary" @click="showCreateDialog" v-if="isAdmin">新建用户</el-button>
    
    <el-table :data="userList" style="width: 100%">
      <el-table-column prop="name" label="用户名"></el-table-column>
      <el-table-column prop="role" label="角色"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
            <el-option label="公共用户" value="common_user" />
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
import { getUserList, createUser } from '@/api/user'

const userList = ref([])
const dialogVisible = ref(false)
const form = ref({
  name: '',
  password: '',
  role: '',
  shop_id: null,
  name: '',
  phone: '',
  address: '',
  type: 'delivery'
})
const isAdmin = JSON.parse(localStorage.getItem('admin') || '{}').role === 'admin'

const loadUsers = async () => {
  const res = await getUserList({ page: 1, page_size: 10 })
  userList.value = res.data
}

const showCreateDialog = () => {
  form.value = {
  name: '',
  password: '',
  role: 'user',
  shop_id: null,
  name: '',
  phone: '',
  address: '',
  type: 'delivery'
}
  dialogVisible.value = true
}

const submitForm = async () => {
  console.log('提交数据：', JSON.stringify(form.value, null, 2));
await createUser({
  ...form.value
})
  dialogVisible.value = false
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>