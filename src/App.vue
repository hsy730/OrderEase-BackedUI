<template>
  <el-container class="layout-container">
    <el-aside width="130px">
      <el-menu
        router
        :default-active="$route.path"
        class="menu"
        :collapse="isCollapse"
      >
        <div class="menu-header" @click="toggleCollapse">
          <el-icon class="toggle-icon">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <el-menu-item index="/products" class="menu-item">
          <el-icon><Goods /></el-icon>
          <template #title>商品管理</template>
        </el-menu-item>
        <el-menu-item index="/orders" class="menu-item">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { Goods, List, Expand, Fold } from '@element-plus/icons-vue'

const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.layout-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.menu {
  height: 100%;
  border-right: none;
}

.menu-header {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  transition: background-color 0.3s;
}

.menu-header:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.toggle-icon {
  font-size: 20px;
}

.el-menu {
  border-right: none !important;
}

.el-menu:not(.el-menu--collapse) {
  width: 160px;
}

.menu-item {
  display: flex;
  align-items: center;
}

.menu-item .el-icon {
  margin-right: 8px;
  width: 24px;
  text-align: center;
}

/* 调整主内容区域的样式 */
.el-main {
  padding: 0;
  background-color: #f0f2f5;
}

/* 调整菜单样式 */
:deep(.el-menu) {
  background-color: #304156;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: #bfcbd9;
}

:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
  color: #409eff;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

/* 折叠时的样式 */
.el-menu--collapse {
  width: 64px;
}

.el-menu--collapse .el-menu-item {
  padding: 0 !important;
  text-align: center;
}
</style>
