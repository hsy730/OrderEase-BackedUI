<template>
  <div class="app-wrapper">
    <!-- 侧边栏宽度调整为180px -->
    <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
      <div class="logo">订单管理系统</div>
      <el-menu
        :default-active="route.path"
        router
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/shop" v-if="isAdmin">
          <el-icon><Shop /></el-icon>
          <span>店铺管理</span>
        </el-menu-item>

        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
      
        <el-menu-item index="/tag">
          <el-icon><Collection /></el-icon>
          <span>标签管理</span>
        </el-menu-item>

        <el-menu-item index="/user" v-if="isAdmin">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-menu-item 
          v-if="isAdmin"
          index="/migration"
        >
          <el-icon><Upload /></el-icon>
          <span>数据迁移</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主要内容区调整左边距 -->
    <div class="main-container" :style="{ marginLeft: sidebarWidth + 'px' }">
      <div class="navbar">
        <!-- 添加折叠按钮 -->
        <div class="hamburger" @click="toggleSidebar">
          <el-icon :class="{ 'is-active': !isCollapse }"><Fold /></el-icon>
        </div>
        <div class="right-menu">
          <!-- 切换店铺 -->
          <el-select 
            v-if="isAdmin"
            v-model.number="shopId"
            placeholder="切换店铺"
            filterable
            remote
            :remote-method="handleShopSearch"
            :loading="searchLoading"
            style="width: 120px; margin-right: 16px"
            @change="handleShopChange"
          >
            <el-option
              v-for="shop in shopList"
              :key="shop.id"
              :label="shop.name"
              :value="shop.id"
            />
          </el-select>

          <!-- 获取登录令牌按钮 -->
          <el-button 
            type="primary"
            size="small"
            @click="handleGetToken"
            style="margin-right: 16px"
          >
            登录令牌
          </el-button>

          <el-dropdown trigger="click" @command="handleCommand">
            <span class="avatar-wrapper">
              <img src="@/assets/settings.png" alt="JPEG Image" width="30" height="30">
              <!-- <span class="username">管理员</span> -->
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </div>
      </div>

      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="['Migration']">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="old_password">
          <el-input
            v-model="passwordForm.old_password"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input
            v-model="passwordForm.confirm_password"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelChangePassword">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changing">
          确认
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 令牌显示对话框 -->
    <el-dialog
      v-model="tokenDialogVisible"
      title="店铺临时令牌"
      width="500px"
      center
      append-to-body
    >
      <div class="token-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="店铺ID">{{ tokenInfo.shop_id }}</el-descriptions-item>
          <el-descriptions-item label="临时令牌">{{ tokenInfo.token }}</el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ formatTime(tokenInfo.expires_at) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="tokenDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Goods, Fold, Upload, Collection, User, Shop } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changePassword, logout } from '@/api/auth'
import { getShopList, getCurrentShopId, getShopTempToken } from '@/api/shop'

import { debounce } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const sidebarWidth = ref(140) // 默认宽度
const showMigration = ref(false)
const isAdmin = ref(JSON.parse(localStorage.getItem('admin') || '{}').role === 'admin')
const shopList = ref([])
const shopId = ref(null)
const searchLoading = ref(false)

// 添加搜索处理方法
const handleShopSearch = debounce(async (query) => {
  try {
    searchLoading.value = true
    const { data } = await getShopList({ 
      page: 1, 
      page_size: 50,
      search: query
    })
    shopList.value = data
  } catch (error) {
    console.error('搜索店铺失败:', error)
    ElMessage.error('店铺搜索失败')
  } finally {
    searchLoading.value = false
  }
}, 500)

// 获取店铺列表
onMounted(async () => {
  if (!isAdmin.value) {
    return;
  }
  try {
    const { data } = await getShopList( { page : 1, page_size : 50 })
    shopList.value = data
    const curShopId = getCurrentShopId()
    if (curShopId > 0) { // 如果有当前店铺ID，直接使用该ID
      shopId.value = curShopId
    } else {
      shopId.value = data[0]?.id || null
      localStorage.setItem('currentShopId', shopId.value)
    }
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    ElMessage.error('店铺列表加载失败')
  }
  showMigration.value = localStorage.getItem('migration_switch') === '1'
})

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  sidebarWidth.value = isCollapse.value ? 50 : 140
}

// 修改密码相关的状态
const showPasswordDialog = ref(false)
const changing = ref(false)
const passwordFormRef = ref(null)

// 令牌对话框相关状态
const tokenDialogVisible = ref(false)
const tokenInfo = ref({})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 密码验证规则
// 自定义密码验证函数
const validateNewPassword = (rule, value, callback) => {
  const errors = []
  
  // 检查必填性
  if (!value) {
    errors.push('请输入新密码')
  }
  
  // 检查长度
  if (value && value.length < 8) {
    errors.push('密码长度至少8位')
  }
  
  // 检查是否包含数字
  if (value && !/(?=.*[0-9])/.test(value)) {
    errors.push('密码必须包含数字')
  }
  
  // 检查是否包含大写字母
  if (value && !/(?=.*[A-Z])/.test(value)) {
    errors.push('密码必须包含大写字母')
  }
  
  // 检查是否包含小写字母
  if (value && !/(?=.*[a-z])/.test(value)) {
    errors.push('密码必须包含小写字母')
  }
  
  // 检查是否包含特殊字符
  if (value && !/(?=.*[@#$%^&*])/.test(value)) {
    errors.push('密码必须包含特殊字符（如：@#$%^&*等）')
  }
  
  if (errors.length > 0) {
    callback(new Error(errors.join('，')))
  } else {
    callback()
  }
}

const passwordRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { 
      validator: validateNewPassword,
      trigger: 'blur'
    }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '暂无'
  return new Date(time).toLocaleString()
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确认退出登录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await logout()
      localStorage.removeItem('admin')
      router.push('/login')
      ElMessage.success('退出成功')
    } catch (error) {
      if (error === 'cancel') return
      console.error('退出失败:', error)
      ElMessage.error('退出失败')
    }
  } else if (command === 'changePassword') {
    showPasswordDialog.value = true
  }
}

// 处理修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    // 先进行表单验证
    await passwordFormRef.value.validate()
    changing.value = true
    
    // 验证两次密码是否一致
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      ElMessage.error('两次输入的密码不一致')
      changing.value = false
      return // 直接返回，不关闭对话框
    }
    
    // 调用修改密码接口
    await changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
    
    ElMessage.success('密码修改成功，请重新登录')
    localStorage.removeItem('admin')
    showPasswordDialog.value = false // 只有在成功时才关闭对话框
    router.push('/login')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.error || '修改密码失败')
    // 失败时不关闭对话框
  } finally {
    changing.value = false
  }
}

// 取消修改密码
const cancelChangePassword = () => {
  showPasswordDialog.value = false
  passwordFormRef.value?.resetFields()
}

// 检查是否显示数据迁移菜单
onMounted(() => {
  showMigration.value = localStorage.getItem('migration_switch') === '1'
})

// 添加监听 storage 事件，实时响应变化
window.addEventListener('storage', (e) => {
  if (e.key === 'migration_switch') {
    showMigration.value = e.newValue === '1'
  }
})
// 切换店铺
const switchShopLoading = ref(false)
const handleShopChange = async (shopId) => {
  let refresh = false;
  if (localStorage.getItem('currentShopId')) {
    refresh = true;
  }
  localStorage.setItem('currentShopId', shopId)
  ElMessage.success('店铺切换成功')
  if (refresh) {
    router.go(0) // 添加页面刷新
  }
}   

// 获取登录令牌
const handleGetToken = async () => {
  try {
    const result = await getShopTempToken(shopId.value || 0)
    console.log('获取店铺临时令牌成功:', result)
    tokenInfo.value = result
    tokenDialogVisible.value = true
  } catch (error) {
    console.error('获取登录令牌失败:', error)
    ElMessage.error(error.response?.data?.error || '获取登录令牌失败')
  }
}
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background: #304156;
  transition: width 0.3s;
  z-index: 1001;
  overflow-x: hidden;
}

.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
  overflow: hidden;
  white-space: nowrap;
}

.main-container {
  min-height: 100%;
  transition: margin-left 0.3s;
  position: relative;
}

.navbar {
  height: 50px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  padding: 0 15px;
  justify-content: space-between;
  position: relative;
  z-index: 1000;
}

.hamburger {
  padding: 0 15px;
  cursor: pointer;
  transition: background .3s;
  height: 100%;
  display: flex;
  align-items: center;
}

.hamburger:hover {
  background: rgba(0,0,0,.025);
}

.hamburger .el-icon {
  font-size: 20px;
  transition: transform .3s;
}

.hamburger .is-active {
  transform: rotate(180deg);
}

.right-menu {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
}

:deep(.el-avatar) {
  background-color: transparent;
  border: 1px solid #ddd;
  overflow: hidden;
}

:deep(.el-avatar img) {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

.app-main {
  padding: 15px;
  min-height: calc(100vh - 50px);
  box-sizing: border-box;
  background: #f0f2f5;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu-item) {
  padding-left: 16px !important;
  display: flex;
  align-items: center;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px;
}

:deep(.el-menu--collapse .el-menu-item) {
  padding-left: 16px !important;
}

/* 
  说明：
  1. :deep() 是 Vue3 的深度选择器，用于修改组件内部样式
  2. !important 用于提高样式优先级，覆盖 element-plus 的默认样式
  3. 这些样式会影响所有菜单项的间距和对齐方式
*/

/* 添加一些对话框相关的样式 */
:deep(.el-dialog__body) {
  padding: 20px 40px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-menu-item.is-active) {
  font-weight: normal;
  border: none;
}

/* 令牌对话框样式 */
.token-content {
  margin: 20px 0;
}

:deep(.el-descriptions) {
  padding: 0;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}
</style>
