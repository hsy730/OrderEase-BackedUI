<template>
  <div class="order-manage-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">订单管理</h1>
          <p class="page-description">管理和查看所有订单信息</p>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="handleRefresh" title="刷新">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button class="action-btn primary" @click="handleCreate">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>新建订单</span>
          </button>
        </div>
      </div>

      <div class="tabs-card">
        <div class="tabs-header">
          <button 
            :class="['tab-item', { active: activeTab === 'current' }]"
            @click="activeTab = 'current'"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>当前订单</span>
            <span v-if="currentOrderCount > 0" class="tab-badge">{{ currentOrderCount }}</span>
          </button>
          <button 
            :class="['tab-item', { active: activeTab === 'all' }]"
            @click="activeTab = 'all'"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>全部订单</span>
          </button>
        </div>
        
        <div class="tabs-content">
          <CurrentOrder v-show="activeTab === 'current'" ref="currentOrderRef" />
          <AllOrder v-show="activeTab === 'all'" ref="allOrderRef" />
        </div>
      </div>

      <!-- 使用 AppDialog 组件 -->
      <AppDialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="860px"
        :confirm-loading="submitting"
        @confirm="submitForm"
      >
        <order-form
          ref="orderFormRef"
          :form-data="formData"
          @submit="handleSubmit"
        />
      </AppDialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CurrentOrder from './CurrentOrder.vue'
import AllOrder from './AllOrder.vue'
import OrderForm from '@/components/order/OrderForm.vue'
import AppDialog from '@/components/common/AppDialog.vue'

const activeTab = ref('current')
const currentOrderRef = ref(null)
const allOrderRef = ref(null)
const currentOrderCount = ref(0)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const orderFormRef = ref(null)
const submitting = ref(false)

const handleCreate = () => {
  dialogTitle.value = '新增订单'
  formData.value = {}
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    submitting.value = true
    await orderFormRef.value.submit()
  } catch (error) {
    console.error('提交表单失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleSubmit = () => {
  dialogVisible.value = false
  handleRefresh()
  ElMessage.success('操作成功')
}

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
.order-manage-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.page-description {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 40px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.tabs-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.01);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
}

.tab-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tab-item.active svg {
  color: #ffffff;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab-item:not(.active) .tab-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tabs-content {
  min-height: 400px;
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .tabs-header {
    padding: 12px 16px;
    overflow-x: auto;
  }
  
  .tab-item {
    padding: 8px 14px;
    font-size: 13px;
    white-space: nowrap;
  }
}
</style>
