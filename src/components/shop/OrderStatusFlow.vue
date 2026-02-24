<template>
  <div class="order-status-flow">
    <!-- 状态列表 -->
    <div class="status-list">
      <!-- 使用template包裹，将v-for放在外层 -->
      <template v-for="status in sortedStatuses" :key="status.value">
        <!-- 终态状态简化显示 -->
        <div 
          v-if="status.isFinal"
          class="status-simple-card"
          :class="`status-type-${status.type}`"
        >
          <div class="status-simple-content">
            <div class="status-simple-info">
              <el-tag :type="status.type" size="small">{{ status.label }}</el-tag>
              <span class="status-value">值: {{ status.value }}</span>
              <el-tag type="success" size="small">终态</el-tag>
            </div>
            <div class="status-actions">
              <el-button 
                v-if="status.value !== 0" 
                type="primary" 
                link
                size="small" 
                @click="handleEditStatus(status.value)"
              >
                编辑
              </el-button>
              <el-button 
                v-if="status.value !== 0" 
                type="danger" 
                link
                size="small" 
                @click="handleDeleteStatus(status.value)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 其他状态正常显示 -->
        <el-card 
          v-else
          class="status-card"
          :class="`status-type-${status.type}`"
        >
        <template #header>
          <div class="status-header">
            <div class="status-info">
              <el-tag :type="status.type" size="small">{{ status.label }}</el-tag>
              <span class="status-value">值: {{ status.value }}</span>
            </div>
            <div class="status-actions">
              <el-button 
                v-if="status.value !== 0" 
                type="primary" 
                link
                size="small" 
                @click="handleEditStatus(status.value)"
              >
                编辑
              </el-button>
              <el-button 
                v-if="status.value !== 0" 
                type="danger" 
                link
                size="small" 
                @click="handleDeleteStatus(status.value)"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>

        <!-- 转换动作 -->
        <div class="actions-section">
          <div class="actions-header">
            <el-button 
              type="primary" 
              link
              size="small" 
              @click="handleAddAction(index)"
            >
              + 添加动作
            </el-button>
          </div>
          <div class="action-list">
            <div 
              v-for="(action, actionIndex) in status.actions" 
              :key="actionIndex"
              class="action-item"
            >
              <div class="action-content">
                <span class="action-name">{{ action.name }}</span>
                <span class="action-arrow">→</span>
                <el-tag :type="getStatusType(action.nextStatus)" size="small">{{ action.nextStatusLabel }}</el-tag>
              </div>
              <div class="action-actions">
                <el-button 
                  type="primary" 
                  link
                  size="small" 
                  @click="handleEditAction(index, actionIndex)"
                >
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  link
                  size="small" 
                  @click="handleDeleteAction(index, actionIndex)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div v-if="status.actions.length === 0" class="empty-actions">
              <span class="empty-text">暂无转换动作</span>
            </div>
          </div>
        </div>
      </el-card>
      </template>
    </div>

    <!-- 添加状态按钮 -->
    <div class="add-status-section">
      <el-button type="primary" link size="small" @click="handleAddStatus">
        + 添加状态
      </el-button>
    </div>
  </div>

  <!-- 状态编辑对话框 -->
  <el-dialog
    v-model="statusDialogVisible"
    :title="statusDialogTitle"
    width="500px"
    class="apple-dialog"
    :close-on-click-modal="false"
  >
    <el-form
      ref="statusFormRef"
      :model="statusForm"
      :rules="statusFormRules"
      label-position="top"
      class="apple-form"
    >
      <el-form-item label="状态值" prop="value" required>
        <el-input-number v-model="statusForm.value" :min="0" :max="10" />
      </el-form-item>
      <el-form-item label="状态名称" prop="label" required>
        <el-input v-model="statusForm.label" placeholder="请输入状态名称" />
      </el-form-item>
      <el-form-item label="状态类型" prop="type" required>
        <el-select v-model="statusForm.type" placeholder="请选择状态类型">
          <el-option label="警告" value="warning" />
          <el-option label="主要" value="primary" />
          <el-option label="危险" value="danger" />
          <el-option label="信息" value="info" />
          <el-option label="成功" value="success" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否终态">
        <el-switch v-model="statusForm.isFinal" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="statusDialogVisible = false" class="btn-cancel">取消</el-button>
        <el-button type="primary" @click="handleSaveStatus" class="btn-confirm">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 动作编辑对话框 -->
  <el-dialog
    v-model="actionDialogVisible"
    :title="actionDialogTitle"
    width="500px"
    class="apple-dialog"
    :close-on-click-modal="false"
  >
    <el-form
      ref="actionFormRef"
      :model="actionForm"
      :rules="actionFormRules"
      label-position="top"
      class="apple-form"
    >
      <el-form-item label="动作名称" prop="name" required>
        <el-input v-model="actionForm.name" placeholder="请输入动作名称" />
      </el-form-item>
      <el-form-item label="下一状态" prop="nextStatus" required>
        <el-select 
          v-model="actionForm.nextStatus" 
          placeholder="请选择下一状态"
          @change="handleNextStatusChange"
        >
          <el-option 
            v-for="status in sortedStatuses.filter(s => {
              // Get current status from original array using the editing index with null checks
              const currentStatus = statusFlow.value?.statuses?.[editingStatusIndexForAction]
              // Only allow statuses with higher value than current status
              return currentStatus ? s.value > currentStatus.value : true
            })" 
            :key="status.value" 
            :label="status.label" 
            :value="status.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态标签" prop="nextStatusLabel" required>
        <el-input v-model="actionForm.nextStatusLabel" placeholder="自动生成，可修改" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="actionDialogVisible = false" class="btn-cancel">取消</el-button>
        <el-button type="primary" @click="handleSaveAction" class="btn-confirm">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getDefaultOrderStatusFlow } from '@/utils/orderStatus'

// Props
const props = defineProps({
  initialStatusFlow: {
    type: Object,
    default: () => getDefaultOrderStatusFlow()
  }
})

// Emits
const emit = defineEmits(['update:statusFlow'])

// 订单状态流转数据
const statusFlow = ref({
  statuses: [],
  ...JSON.parse(JSON.stringify(props.initialStatusFlow || getDefaultOrderStatusFlow()))
})

// 监听初始状态变化
watch(() => props.initialStatusFlow, (newVal) => {
  if (newVal) {
    statusFlow.value = JSON.parse(JSON.stringify(newVal))
  } else {
    statusFlow.value = { statuses: [], ...getDefaultOrderStatusFlow() }
  }
}, { deep: true })

// 计算属性：按照status.value从小到大排列状态
const sortedStatuses = computed(() => {
  const statuses = statusFlow.value?.statuses || []
  return [...statuses].sort((a, b) => a.value - b.value)
})

// 订单状态编辑相关状态
const statusDialogVisible = ref(false)
const statusDialogTitle = ref('')
const statusFormRef = ref(null)
const statusForm = ref({
  value: 0,
  label: '',
  type: 'info',
  isFinal: false
})
const editingStatusIndex = ref(-1)

// 状态表单验证规则
const statusFormRules = {
  value: [
    { required: true, message: '请输入状态值', trigger: ['blur', 'change'] },
    { type: 'number', min: 0, message: '状态值不能小于0', trigger: ['blur', 'change'] },
    { type: 'number', max: 11, message: '状态值不能大于11', trigger: ['blur', 'change'] },
    {
      validator: (rule, value, callback) => {
        // 检查状态值是否唯一
        const statuses = statusFlow.value?.statuses || []
        const isDuplicate = statuses.some((status, index) => {
          return status.value === value && index !== editingStatusIndex.value
        })
        if (isDuplicate) {
          callback(new Error('状态值已存在，请使用其他值'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  label: [
    { required: true, message: '请输入状态名称', trigger: ['blur', 'change'] }
  ],
  type: [
    { required: true, message: '请选择状态类型', trigger: 'change' }
  ]
}

// 动作编辑相关状态
const actionDialogVisible = ref(false)
const actionDialogTitle = ref('')
const actionFormRef = ref(null)
const actionForm = ref({
  name: '',
  nextStatus: null,
  nextStatusLabel: ''
})
const editingStatusIndexForAction = ref(-1)
const editingActionIndex = ref(-1)

// 动作表单验证规则
const actionFormRules = {
  name: [
    { required: true, message: '请输入动作名称', trigger: ['blur', 'change'] }
  ],
  nextStatus: [
    { required: true, message: '请选择下一状态', trigger: ['blur', 'change'] },
    { validator: (rule, value, callback) => {
        // 检查下一状态值是否大于当前状态值
        const currentStatus = statusFlow.value?.statuses?.[editingStatusIndexForAction.value]
        if (currentStatus && value <= currentStatus.value) {
          callback(new Error('下一状态值必须大于当前状态值'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  nextStatusLabel: [
    { required: true, message: '请输入状态标签', trigger: ['blur', 'change'] }
  ]
}

// 获取状态类型
const getStatusType = (statusValue) => {
  const status = (statusFlow.value?.statuses || []).find(s => s.value === statusValue)
  return status?.type || 'info'
}

// 获取状态标签
const getStatusLabel = (statusValue) => {
  const status = (statusFlow.value?.statuses || []).find(s => s.value === statusValue)
  return status?.label || '未知状态'
}

// 添加状态
const handleAddStatus = () => {
  statusDialogTitle.value = '添加状态'
  statusForm.value = {
    value: 0,
    label: '',
    type: 'info',
    isFinal: false
  }
  editingStatusIndex.value = -1
  statusDialogVisible.value = true
}

// 编辑状态
const handleEditStatus = (statusValue) => {
  statusDialogTitle.value = '编辑状态'
  const statuses = statusFlow.value?.statuses || []
  const statusIndex = statuses.findIndex(status => status.value === statusValue)
  if (statusIndex !== -1) {
    statusForm.value = { ...(statuses[statusIndex] || {}) }
    editingStatusIndex.value = statusIndex
    statusDialogVisible.value = true
  }
}

// 删除状态
const handleDeleteStatus = (statusValue) => {
  // 检查是否有其他状态的动作指向该状态
  const statuses = statusFlow.value?.statuses || []
  const statusIndex = statuses.findIndex(status => status.value === statusValue)
  const statusToDelete = statuses[statusIndex]
  if (!statusToDelete) return
  
  let isUsed = false
  
  for (const status of statuses) {
    for (const action of status.actions || []) {
      if (action.nextStatus === statusValue) {
        isUsed = true
        break
      }
    }
    if (isUsed) break
  }
  
  if (isUsed) {
    ElMessage.error('该状态被其他转换动作引用，无法删除')
    return
  }
  
  statuses.splice(statusIndex, 1)
  ElMessage.success('状态删除成功')
  // 触发更新事件
  emit('update:statusFlow', statusFlow.value)
}

// 保存状态
const handleSaveStatus = () => {
  // 触发表单验证
  statusFormRef.value.validate((valid) => {
    if (valid) {
      // 确保statuses数组存在
      if (!statusFlow.value.statuses) {
        statusFlow.value.statuses = []
      }
      
      if (editingStatusIndex.value === -1) {
        // 添加新状态
        statusFlow.value.statuses.push({
          ...statusForm.value,
          actions: []
        })
        ElMessage.success('状态添加成功')
      } else {
        // 更新现有状态
        const existingActions = statusFlow.value.statuses[editingStatusIndex.value]?.actions || []
        statusFlow.value.statuses[editingStatusIndex.value] = {
          ...statusForm.value,
          actions: existingActions
        }
        ElMessage.success('状态更新成功')
      }
      
      statusDialogVisible.value = false
      // 触发更新事件
      emit('update:statusFlow', statusFlow.value)
    }
  })
}

// 添加动作
const handleAddAction = (statusIndex) => {
  actionDialogTitle.value = '添加动作'
  actionForm.value = {
    name: '',
    nextStatus: null,
    nextStatusLabel: ''
  }
  editingStatusIndexForAction.value = statusIndex
  editingActionIndex.value = -1
  actionDialogVisible.value = true
}

// 编辑动作
const handleEditAction = (statusIndex, actionIndex) => {
  actionDialogTitle.value = '编辑动作'
  const statuses = statusFlow.value?.statuses || []
  const status = statuses[statusIndex]
  const action = status?.actions?.[actionIndex]
  
  actionForm.value = { ...(action || {}) }
  editingStatusIndexForAction.value = statusIndex
  editingActionIndex.value = actionIndex
  actionDialogVisible.value = true
}

// 删除动作
const handleDeleteAction = (statusIndex, actionIndex) => {
  const statuses = statusFlow.value?.statuses || []
  const status = statuses[statusIndex]
  if (!status || !status.actions) return
  
  status.actions.splice(actionIndex, 1)
  ElMessage.success('动作删除成功')
  // 触发更新事件
  emit('update:statusFlow', statusFlow.value)
}

// 保存动作
const handleSaveAction = () => {
  // 触发表单验证
  actionFormRef.value.validate((valid) => {
    if (valid) {
      // 自动填充下一状态标签
      if (!actionForm.value.nextStatusLabel) {
        actionForm.value.nextStatusLabel = getStatusLabel(actionForm.value.nextStatus)
      }
      
      // 确保statuses数组存在
      if (!statusFlow.value.statuses) {
        statusFlow.value.statuses = []
      }
      
      const status = statusFlow.value.statuses[editingStatusIndexForAction.value]
      if (!status) {
        ElMessage.error('状态不可被选择')
        return
      }
      
      // 确保actions数组存在
      if (!status.actions) {
        status.actions = []
      }
      
      if (editingActionIndex.value === -1) {
        // 添加新动作
        status.actions.push({
          ...actionForm.value
        })
        ElMessage.success('动作添加成功')
      } else {
        // 更新现有动作
        status.actions[editingActionIndex.value] = {
          ...actionForm.value
        }
        ElMessage.success('动作更新成功')
      }
      
      actionDialogVisible.value = false
      // 触发更新事件
      emit('update:statusFlow', statusFlow.value)
    }
  })
}

// 处理下一状态变化
const handleNextStatusChange = () => {
  actionForm.value.nextStatusLabel = getStatusLabel(actionForm.value.nextStatus)
}

// 导出方法，供父组件调用
const getStatusFlow = () => {
  return statusFlow.value
}

defineExpose({
  getStatusFlow
})
</script>

<style scoped>
.order-status-flow {
  padding: 20px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.status-simple-card {
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.status-simple-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--indicator-color, #d9d9d9) 0%, var(--indicator-color-light, #e5e5e5) 100%);
  border-radius: 4px 0 0 4px;
}

.status-simple-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.status-simple-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.status-simple-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-card {
  margin-bottom: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.status-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--indicator-color, #d9d9d9) 0%, var(--indicator-color-light, #e5e5e5) 100%);
  border-radius: 4px 0 0 4px;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.status-type-warning {
  --indicator-color: #f59e0b;
  --indicator-color-light: #fbbf24;
}

.status-type-primary {
  --indicator-color: var(--color-primary);
  --indicator-color-light: #60a5fa;
}

.status-type-danger {
  --indicator-color: var(--color-danger);
  --indicator-color-light: #f87171;
}

.status-type-info {
  --indicator-color: #6b7280;
  --indicator-color-light: #9ca3af;
}

.status-type-success {
  --indicator-color: #10b981;
  --indicator-color-light: #34d399;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-value {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.status-tip {
  font-size: 12px;
  color: #86868b;
}

.status-actions {
  display: flex;
  gap: 8px;
}

.actions-section {
  margin-top: 4px;
}

.actions-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
}

.action-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f5f5f7 0%, #fafafa 100%);
  border-radius: 10px;
  flex: 0 0 calc(50% - 5px);
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.action-item:hover {
  background: linear-gradient(135deg, #ebebed 0%, #f5f5f7 100%);
  border-color: rgba(0, 0, 0, 0.08);
  transform: scale(1.01);
}

.action-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.action-name {
  font-weight: 500;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.action-arrow {
  color: #86868b;
  font-size: 12px;
  font-weight: 500;
}

.action-actions {
  display: flex;
  gap: 4px;
}

.final-status-tip {
  margin-top: 16px;
}

.empty-actions {
  padding: 16px 0;
  text-align: center;
  color: #86868b;
  width: 100%;
  background: linear-gradient(135deg, #f5f5f7 0%, #fafafa 100%);
  border-radius: 10px;
}

.empty-text {
  font-size: 13px;
  color: #86868b;
  letter-spacing: 0.01em;
}

.add-status-section {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.el-button.is-link) {
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  height: auto;
  letter-spacing: -0.01em;
}

:deep(.el-button--primary.is-link) {
  color: var(--color-primary);
}

:deep(.el-button--primary.is-link:hover) {
  color: var(--color-primary-dark);
}

:deep(.el-button--danger.is-link) {
  color: var(--color-danger);
}

:deep(.el-button--danger.is-link:hover) {
  color: var(--color-danger-light);
}

:deep(.el-button--small) {
  padding: 8px 16px;
  font-size: 12px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  letter-spacing: -0.01em;
}

:deep(.el-card__header) {
  padding: 0;
  border-bottom: none;
  margin-bottom: 12px;
}

:deep(.el-alert) {
  margin: 0;
  padding: 10px 16px;
  border-radius: 10px;
}

:deep(.el-tag) {
  margin: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  height: 24px;
  padding: 0 10px;
  letter-spacing: -0.01em;
  border: none;
}

:deep(.el-tag--warning) {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%);
  color: #b45309;
}

:deep(.el-tag--primary) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%);
  color: #1d4ed8;
}

:deep(.el-tag--danger) {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.1) 100%);
  color: #b91c1c;
}

:deep(.el-tag--info) {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(156, 163, 175, 0.1) 100%);
  color: #374151;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.1) 100%);
  color: #047857;
}

:deep(.el-card__body) {
  padding: 16px 20px;
}

:deep(.el-card__body),
:deep(.el-card__header) {
  padding-left: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .btn-cancel {
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border: none;
  color: #1d1d1f;
  border-radius: 12px;
  height: 44px;
  min-width: 88px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.dialog-footer .btn-cancel:hover {
  background: linear-gradient(135deg, #e8e8ed 0%, #d2d2d7 100%);
}

.dialog-footer .btn-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  height: 44px;
  min-width: 88px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  box-shadow: 
    0 2px 8px rgba(59, 130, 246, 0.25),
    0 4px 16px rgba(59, 130, 246, 0.15);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.dialog-footer .btn-confirm:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.3),
    0 8px 24px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.apple-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  padding-bottom: 8px;
  letter-spacing: -0.01em;
}

.apple-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.apple-form :deep(.el-input__wrapper),
.apple-form :deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fafafa;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.apple-form :deep(.el-input__wrapper:hover),
.apple-form :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

.apple-form :deep(.el-input__wrapper.is-focus),
.apple-form :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.apple-form :deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.apple-form :deep(.el-input__inner::placeholder) {
  color: #86868b;
}

.apple-form :deep(.el-input-number) {
  width: 100%;
}

.apple-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 12px;
}

.apple-form :deep(.el-select) {
  width: 100%;
}

.apple-form :deep(.el-switch) {
  --el-switch-on-color: var(--color-primary);
}

.apple-form :deep(.el-switch__core) {
  border-radius: 20px;
  height: 26px;
  min-width: 46px;
}

.apple-form :deep(.el-switch__action) {
  width: 22px;
  height: 22px;
}
</style>
