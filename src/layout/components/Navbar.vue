<template>
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
          v-model="selectedShopId"
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Shop, Bell, ArrowDown, UserFilled, Lock, SwitchButton, DataBoard, Document, Goods, Collection, User } from '@element-plus/icons-vue'

const props = defineProps({
  isAdmin: Boolean,
  userInfo: Object,
  shopList: Array,
  currentShop: {
    type: Object,
    default: () => ({})
  },
  shopId: [String, Number],
  searchLoading: Boolean,
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['shop-search', 'shop-change', 'show-notifications', 'change-password', 'logout'])

const route = useRoute()

const selectedShopId = computed({
  get: () => props.shopId,
  set: (val) => {}
})

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

const handleShopSearch = (query) => {
  emit('shop-search', query)
}

const handleShopChange = (shopId) => {
  emit('shop-change', shopId)
}

const showNotificationPanel = () => {
  emit('show-notifications')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    emit('logout')
  } else if (command === 'changePassword') {
    emit('change-password')
  }
}
</script>

<style scoped>
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

@media (max-width: 768px) {
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
