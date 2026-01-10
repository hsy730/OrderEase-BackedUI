<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapse }">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5H5.4125H19.4125H19.425L19.825 3H21.825L21.425 5H21.4125H7.4125H7.4L3 21H1L5.4 5H3V3ZM8.4125 7H18.4125L17.6125 11H9.2125L8.4125 7ZM9.6125 13H17.2125L16.4125 17H10.4125L9.6125 13Z" fill="currentColor"/>
            </svg>
          </div>
          <transition name="fade">
            <span v-show="!isCollapse" class="logo-text">OrderEase</span>
          </transition>
        </div>
      </div>

      <nav class="sidebar-nav">
        <el-menu
          :default-active="route.path"
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          class="sidebar-menu"
        >
          <el-menu-item index="/dashboard">
            <template #title>
              <el-icon><DataBoard /></el-icon>
              <span>数据概览</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/shop" v-if="isAdmin">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>店铺管理</span>
            </template>
          </el-menu-item>

          <el-menu-item :index="'/shop/' + currentShop.id" v-if="!isAdmin && currentShop.id">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>我的店铺</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/product">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/tag">
            <template #title>
              <el-icon><Collection /></el-icon>
              <span>标签管理</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/user" v-if="isAdmin">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/migration" v-if="isAdmin && showMigration">
            <template #title>
              <el-icon><Upload /></el-icon>
              <span>数据迁移</span>
            </template>
          </el-menu-item>
        </el-menu>
      </nav>

      <div class="sidebar-footer">
        <el-tooltip content="收起/展开" placement="right" :disabled="!isCollapse">
          <button class="collapse-btn" @click="toggleSidebar">
            <el-icon :class="{ 'rotate-180': !isCollapse }">
              <Fold />
            </el-icon>
          </button>
        </el-tooltip>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="navbar">
        <div class="navbar-left">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path" :to="{ path: item.path }">
                <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>

        <div class="navbar-right">
          <!-- 店铺选择器 -->
          <div class="shop-selector" v-if="isAdmin">
            <el-select
              v-model.number="shopId"
              placeholder="选择店铺"
              filterable
              remote
              :remote-method="handleShopSearch"
              :loading="searchLoading"
              @change="handleShopChange"
            >
              <el-option
                v-for="shop in shopList"
                :key="shop.id"
                :label="shop.name"
                :value="shop.id"
              />
            </el-select>
          </div>
          <div class="current-shop" v-else>
            <el-icon><Shop /></el-icon>
            <span>{{ currentShop.name || '店铺名称' }}</span>
          </div>

          <!-- 通知铃铛 -->
          <div class="notification-bell">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" type="danger">
              <el-button :icon="Bell" circle @click="showNotificationPanel" />
            </el-badge>
          </div>

          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-dropdown">
              <div class="user-avatar">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="user-info">
                <span class="user-name">{{ userInfo?.username || '管理员' }}</span>
                <span class="user-role">{{ isAdmin ? '管理员' : '店主' }}</span>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">
                  <el-icon><Lock /></el-icon>
                  <span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" class="logout-item">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive :include="['Migration']">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="450px"
      :close-on-click-modal="false"
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
        <el-form-item label="确认密码" prop="confirm_password">
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
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 通知面板 -->
    <el-drawer v-model="notificationDrawer" title="通知中心" size="380px">
      <div class="notification-list">
        <div class="notification-item" v-for="item in notifications" :key="item.id">
          <div class="notification-icon" :class="`notification-${item.type}`">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-desc">{{ item.desc }}</div>
            <div class="notification-time">{{ item.time }}</div>
          </div>
        </div>
        <el-empty v-if="notifications.length === 0" description="暂无通知" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Goods, Fold, Upload, Collection, User, Shop, Bell, ArrowDown, UserFilled, Lock, SwitchButton, DataBoard } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changePassword, logout } from '@/api/auth'
import { getShopList, getCurrentShopId, getShopDetail } from '@/api/shop'
import { debounce } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const showMigration = ref(false)
const isAdmin = ref(JSON.parse(localStorage.getItem('admin') || '{}').role === 'admin')
const userInfo = ref(JSON.parse(localStorage.getItem('admin') || '{}'))
const shopList = ref([])
const shopId = ref(null)
const searchLoading = ref(false)
const currentShop = ref({})

// 通知相关
const unreadCount = ref(0)
const notificationDrawer = ref(false)
const notifications = ref([])

// 面包屑
const breadcrumbList = computed(() => {
  const routes = []
  const pathArray = route.path.split('/').filter(item => item)
  let currentPath = ''

  pathArray.forEach((path, index) => {
    currentPath += '/' + path
    const title = route.meta?.title || path

    let icon = null
    if (path === 'dashboard') icon = DataBoard
    else if (path === 'shop') icon = Shop
    else if (path === 'order') icon = Document
    else if (path === 'product') icon = Goods
    else if (path === 'tag') icon = Collection
    else if (path === 'user') icon = User

    routes.push({
      path: currentPath,
      title: title,
      icon: index === pathArray.length - 1 ? null : icon
    })
  })

  return routes
})

// 店铺搜索
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
  } finally {
    searchLoading.value = false
  }
}, 500)

onMounted(async () => {
  if (isAdmin.value) {
    try {
      const { data } = await getShopList({ page: 1, page_size: 50 })
      shopList.value = data
      const curShopId = getCurrentShopId()
      if (curShopId > 0) {
        shopId.value = curShopId
      } else {
        shopId.value = data[0]?.id || null
        localStorage.setItem('currentShopId', shopId.value)
      }
    } catch (error) {
      console.error('获取店铺列表失败:', error)
    }
  } else {
    const curShopId = getCurrentShopId()
    if (curShopId > 0) {
      try {
        const result = await getShopDetail(curShopId)
        currentShop.value = result || {}
      } catch (error) {
        console.error('获取当前店铺信息失败:', error)
      }
    }
  }
  showMigration.value = localStorage.getItem('migration_switch') === '1'
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 修改密码
const showPasswordDialog = ref(false)
const changing = ref(false)
const passwordFormRef = ref(null)

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const validateNewPassword = (rule, value, callback) => {
  const errors = []

  if (!value) {
    errors.push('请输入新密码')
  }

  if (value && value.length < 8) {
    errors.push('密码长度至少8位')
  }

  if (value && !/(?=.*[0-9])/.test(value)) {
    errors.push('密码必须包含数字')
  }

  if (value && !/(?=.*[A-Z])/.test(value)) {
    errors.push('密码必须包含大写字母')
  }

  if (value && !/(?=.*[a-z])/.test(value)) {
    errors.push('密码必须包含小写字母')
  }

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
    { validator: validateNewPassword, trigger: 'blur' }
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
    }
  } else if (command === 'changePassword') {
    showPasswordDialog.value = true
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changing.value = true

    await changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })

    ElMessage.success('密码修改成功，请重新登录')
    localStorage.removeItem('admin')
    showPasswordDialog.value = false
    router.push('/login')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.error || '修改密码失败')
  } finally {
    changing.value = false
  }
}

const cancelChangePassword = () => {
  showPasswordDialog.value = false
  passwordFormRef.value?.resetFields()
}

window.addEventListener('storage', (e) => {
  if (e.key === 'migration_switch') {
    showMigration.value = e.newValue === '1'
  }
})

const handleShopChange = async (shopId) => {
  let refresh = false
  if (localStorage.getItem('currentShopId')) {
    refresh = true
  }
  localStorage.setItem('currentShopId', shopId)
  ElMessage.success('店铺切换成功')
  if (refresh) {
    router.go(0)
  }
}

const showNotificationPanel = () => {
  notificationDrawer.value = true
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-slow);
  z-index: 100;
}

.sidebar-collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar-header {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--sidebar-border);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md) 0;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  margin: 0 var(--spacing-sm);
  border-radius: var(--radius-md);
  height: 44px;
  line-height: 44px;
  color: var(--sidebar-text);
  transition: all var(--transition-base);
}

:deep(.el-menu-item:hover) {
  background-color: var(--sidebar-bg-hover);
  color: var(--color-text-primary);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--sidebar-bg-active);
  color: var(--sidebar-text-active);
  font-weight: 600;
}

:deep(.el-menu-item .el-icon) {
  margin-right: var(--spacing-sm);
  font-size: 18px;
}

:deep(.el-menu--collapse) {
  width: var(--sidebar-width-collapsed);
}

:deep(.el-menu--collapse .el-menu-item) {
  padding: 0;
  justify-content: center;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin-right: 0;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--sidebar-border);
}

.collapse-btn {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-secondary);
}

.collapse-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.collapse-btn .el-icon {
  font-size: 18px;
  transition: transform var(--transition-slow);
}

.collapse-btn .rotate-180 {
  transform: rotate(180deg);
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-secondary);
}

/* 导航栏 */
.navbar {
  height: var(--navbar-height);
  background: var(--navbar-bg);
  border-bottom: 1px solid var(--navbar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  transition: all var(--transition-base);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__item .el-icon) {
  margin-right: 4px;
  font-size: 16px;
}

:deep(.el-breadcrumb__inner) {
  color: var(--color-text-secondary);
  font-weight: 500;
}

:deep(.el-breadcrumb__inner:hover) {
  color: var(--color-primary);
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--color-text-primary);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.shop-selector {
  width: 180px;
}

.current-shop {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.current-shop .el-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.notification-bell :deep(.el-button) {
  border: none;
  background: var(--color-bg-secondary);
}

.notification-bell :deep(.el-button:hover) {
  background: var(--color-bg-tertiary);
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-base);
}

.user-dropdown:hover {
  background: var(--color-bg-secondary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-avatar .el-icon {
  font-size: 18px;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.dropdown-icon {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

:deep(.logout-item) {
  color: var(--color-danger);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

/* 内容区 */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-base);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 通知面板 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-item:hover {
  background: var(--color-bg-tertiary);
  transform: translateX(4px);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon .el-icon {
  font-size: 20px;
}

.notification-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.notification-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.notification-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.notification-info {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .navbar {
    padding: 0 var(--spacing-md);
  }

  .shop-selector {
    display: none;
  }

  .user-info {
    display: none;
  }
}
</style>
