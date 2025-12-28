<template>
  <div class="order-manage">
    <div class="content-wrapper">
      <div class="header">
        <h2>订单管理</h2>
        <div class="header-buttons">
          <el-button type="primary" @click="handleCreate">新建</el-button>
          <el-button @click="handleRefresh" :icon="Refresh" title="刷新" style="margin-left: 0px;"></el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" destroy-on-hide>
        <el-tab-pane label="当前订单" name="current">
          <CurrentOrder ref="currentOrderRef" />
        </el-tab-pane>
        <el-tab-pane label="全部订单" name="all">
          <AllOrder ref="allOrderRef" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增/编辑订单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <order-form
        ref="orderFormRef"
        :form-data="formData"
        @submit="handleSubmit"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import CurrentOrder from './CurrentOrder.vue'
import AllOrder from './AllOrder.vue'
import OrderForm from '@/components/order/OrderForm.vue'

const activeTab = ref('current') // 当前激活的标签页
const currentOrderRef = ref(null) // 当前订单组件引用
const allOrderRef = ref(null) // 全部订单组件引用

// 新增/编辑订单对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const orderFormRef = ref(null)

// 新建订单
const handleCreate = () => {
  dialogTitle.value = '新增订单'
  formData.value = {}
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await orderFormRef.value.submit()
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}

// 表单提交成功
const handleSubmit = () => {
  dialogVisible.value = false
  // 刷新当前激活标签页的数据
  handleRefresh()
  ElMessage.success('操作成功')
}

// 刷新列表
const handleRefresh = () => {
  // 根据当前激活的标签页调用对应子组件的刷新方法
  if (activeTab.value === 'current') {
    currentOrderRef.value?.handleRefresh()
  } else {
    allOrderRef.value?.handleRefresh()
  }
}
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

.header-buttons {
  display: flex;
  gap: 10px;
}
</style>