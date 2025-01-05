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
        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
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
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="avatar-wrapper">
              <el-avatar :size="30" icon="UserFilled" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Goods, Fold } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const sidebarWidth = ref(140) // 默认宽度

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  sidebarWidth.value = isCollapse.value ? 50 : 140
}

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('admin')
    router.push('/login')
    ElMessage.success('退出成功')
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
</style> 