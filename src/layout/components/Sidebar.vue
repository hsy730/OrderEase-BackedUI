<template>
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
        :default-active="activeMenu"
        router
        :collapse="isCollapse"
        :collapse-transition="false"
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>
            <span>数据概览</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/shop" v-if="isAdmin">
          <el-icon><Shop /></el-icon>
          <template #title>
            <span>店铺管理</span>
          </template>
        </el-menu-item>

        <el-menu-item :index="'/shop/' + currentShop.id" v-if="!isAdmin && currentShop.id">
          <el-icon><Shop /></el-icon>
          <template #title>
            <span>我的店铺</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <template #title>
            <span>订单管理</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <template #title>
            <span>商品管理</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/tag">
          <el-icon><Collection /></el-icon>
          <template #title>
            <span>标签管理</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/user" v-if="isAdmin">
          <el-icon><User /></el-icon>
          <template #title>
            <span>用户管理</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/migration" v-if="isAdmin">
          <el-icon><Upload /></el-icon>
          <template #title>
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Goods, Fold, Upload, Collection, User, Shop, DataBoard } from '@element-plus/icons-vue'

const props = defineProps({
  isCollapse: Boolean,
  isAdmin: Boolean,
  currentShop: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['toggle'])

const route = useRoute()

const activeMenu = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return '/dashboard'
  return '/' + segments[0]
})

const toggleSidebar = () => {
  emit('toggle')
}
</script>

<style scoped>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
}
</style>
