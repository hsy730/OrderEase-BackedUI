<template>
  <div class="order-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>订单管理</h2>
      </div>

      <el-tabs v-model="activeTab" destroy-on-hide>
        <el-tab-pane label="当前订单" name="current">
          <CurrentOrder />
        </el-tab-pane>
        <el-tab-pane label="全部订单" name="all">
          <AllOrder />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CurrentOrder from './CurrentOrder.vue'
import AllOrder from './AllOrder.vue'

const activeTab = ref('current') // 当前激活的标签页
</script>

<style scoped>
.order-manage {
  height: 100%;
}

.content-wrapper {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}
</style>