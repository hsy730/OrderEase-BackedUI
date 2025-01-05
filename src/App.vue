<template>
  <el-container class="layout-container">
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

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

.el-main {
  padding: 0;
  background-color: #f0f2f5;
}
</style>
