<template>
  <div class="order-manage">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">订单管理</h1>
        <p class="page-description">管理和查看所有订单信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新建
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh" style="margin-left: 0px;"/>
      </div>
    </div>

    <div class="page-content">
      <!-- 状态标签页 -->
      <el-tabs v-model="activeTab" class="order-tabs">
        <el-tab-pane name="current">
          <template #label>
            <span class="tab-label">
              <el-icon><Clock /></el-icon>
              当前订单
              <el-badge v-if="currentOrderCount > 0" :value="currentOrderCount" class="tab-badge" />
            </span>
          </template>
          <CurrentOrder ref="currentOrderRef" />
        </el-tab-pane>
        <el-tab-pane name="all">
          <template #label>
            <span class="tab-label">
              <el-icon><List /></el-icon>
              全部订单
            </span>
          </template>
          <AllOrder ref="allOrderRef" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增/编辑订单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
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
import { Plus, Refresh, Clock, List } from '@element-plus/icons-vue'
import CurrentOrder from './CurrentOrder.vue'
import AllOrder from './AllOrder.vue'
import OrderForm from '@/components/order/OrderForm.vue'

const activeTab = ref('current')
const currentOrderRef = ref(null)
const allOrderRef = ref(null)
const currentOrderCount = ref(0)

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
  handleRefresh()
  ElMessage.success('操作成功')
}

// 刷新列表
const handleRefresh = () => {
  if (activeTab.value === 'current') {
    currentOrderRef.value?.handleRefresh()
  } else {
    allOrderRef.value?.handleRefresh()
  }
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
.order-manage {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.page-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.page-content {
  flex: 1;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.order-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

:deep(.el-tabs__nav-wrap) {
  padding: var(--spacing-sm) 0;
}

:deep(.el-tabs__item) {
  height: 44px;
  line-height: 44px;
  padding: 0 var(--spacing-lg);
  font-size: 14px;
  font-weight: 500;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-label .el-icon {
  font-size: 16px;
}

.tab-badge {
  margin-left: 4px;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
  height: 100%;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 响应式 */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
