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
  padding: 16px 0;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.status-simple-card {
  padding: 10px 16px;
  border-radius: 8px;
  border-left: 3px solid #d9d9d9;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.status-simple-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
  gap: 8px;
  flex-wrap: wrap;
}

.status-card {
  margin-bottom: 0;
  border-left: 3px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.status-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.status-type-warning {
  border-left-color: #f59e0b;
}

.status-type-primary {
  border-left-color: var(--color-primary);
}

.status-type-danger {
  border-left-color: var(--color-danger);
}

.status-type-info {
  border-left-color: #6b7280;
}

.status-type-success {
  border-left-color: #10b981;
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
  gap: 8px;
}

.status-value {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.status-tip {
  font-size: 12px;
  color: #6b7280;
}

.status-actions {
  display: flex;
  gap: 8px;
}

.actions-section {
  margin-top: 0;
}

.actions-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 8px;
}

.action-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background-color: #f9fafb;
  border-radius: 6px;
  flex: 0 0 calc(50% - 4px);
  box-sizing: border-box;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.action-item:hover {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.action-name {
  font-weight: 500;
  color: #374151;
}

.action-arrow {
  color: #9ca3af;
  font-size: 11px;
}

.action-actions {
  display: flex;
  gap: 4px;
}

.final-status-tip {
  margin-top: 12px;
}

.empty-actions {
  padding: 6px 0;
  text-align: center;
  color: #9ca3af;
  width: 100%;
}

.empty-text {
  font-size: 12px;
  color: #9ca3af;
}

.add-status-section {
  display: flex;
  justify-content: flex-start;
  margin-top: 16px;
}

:deep(.el-button.is-link) {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  height: auto;
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
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-card__header) {
  padding: 0;
  border-bottom: none;
  margin-bottom: 8px;
}

:deep(.el-alert) {
  margin: 0;
  padding: 6px 12px;
  border-radius: 6px;
}

:deep(.el-tag) {
  margin: 0;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  height: 22px;
  padding: 0 6px;
}

:deep(.el-card__body) {
  padding: 12px 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .btn-cancel {
  background: rgba(0, 0, 0, 0.04);
  border: none;
  color: #1d1d1f;
  border-radius: 10px;
  height: 40px;
  min-width: 80px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dialog-footer .btn-cancel:hover {
  background: rgba(0, 0, 0, 0.08);
}

.dialog-footer .btn-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 10px;
  height: 40px;
  min-width: 80px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.dialog-footer .btn-confirm:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.apple-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  padding-bottom: 6px;
}

.apple-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.apple-form :deep(.el-input__wrapper),
.apple-form :deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.apple-form :deep(.el-input__wrapper:hover),
.apple-form :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.apple-form :deep(.el-input__wrapper.is-focus),
.apple-form :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.apple-form :deep(.el-input__inner) {
  height: 36px;
  line-height: 36px;
}

.apple-form :deep(.el-input__inner::placeholder) {
  color: #86868b;
}

.apple-form :deep(.el-input-number) {
  width: 100%;
}

.apple-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 10px;
}

.apple-form :deep(.el-select) {
  width: 100%;
}

.apple-form :deep(.el-switch) {
  --el-switch-on-color: var(--color-primary);
}
</style>
