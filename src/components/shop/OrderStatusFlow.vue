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
                type="info" 
                size="small" 
                @click="handleEditStatus(status.value)"
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button 
                v-if="status.value !== 0" 
                type="danger" 
                size="small" 
                @click="handleDeleteStatus(status.value)"
                :icon="Delete"
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
                type="info" 
                size="small" 
                @click="handleEditStatus(status.value)"
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button 
                v-if="status.value !== 0" 
                type="danger" 
                size="small" 
                @click="handleDeleteStatus(status.value)"
                :icon="Delete"
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
              size="small" 
              @click="handleAddAction(index)"
              :icon="Plus"
            >
              添加动作
            </el-button>
          </div>
          <div class="action-list">
            <el-card 
              v-for="(action, actionIndex) in status.actions" 
              :key="actionIndex"
              class="action-card"
            >
              <div class="action-content">
                <span class="action-name">{{ action.name }}</span>
                <span class="action-arrow">→</span>
                <el-tag :type="getStatusType(action.nextStatus)">{{ action.nextStatusLabel }}</el-tag>
              </div>
              <div class="action-actions">
                <el-button 
                  type="info" 
                  size="small" 
                  @click="handleEditAction(index, actionIndex)"
                  :icon="Edit"
                >
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleDeleteAction(index, actionIndex)"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </div>
            </el-card>
            <div v-if="status.actions.length === 0" class="empty-actions">
              <el-empty description="暂无转换动作" />
            </div>
          </div>
        </div>
      </el-card>
      </template>
    </div>

    <!-- 添加状态按钮 -->
    <div class="add-status-section">
      <el-button type="primary" size="small" @click="handleAddStatus">
        <el-icon><Plus /></el-icon> 添加状态
      </el-button>
    </div>
  </div>

  <!-- 状态编辑对话框 -->
  <el-dialog
    v-model="statusDialogVisible"
    :title="statusDialogTitle"
    width="500px"
  >
    <el-form
      ref="statusFormRef"
      :model="statusForm"
      :rules="statusFormRules"
      label-width="100px"
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
      <el-button @click="statusDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSaveStatus">保存</el-button>
    </template>
  </el-dialog>

  <!-- 动作编辑对话框 -->
  <el-dialog
    v-model="actionDialogVisible"
    :title="actionDialogTitle"
    width="500px"
  >
    <el-form
      ref="actionFormRef"
      :model="actionForm"
      :rules="actionFormRules"
      label-width="100px"
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
      <el-button @click="actionDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSaveAction">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
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
  gap: 8px;
  margin-bottom: 16px;
}

.status-simple-card {
  padding: 8px 16px;
  border-radius: 4px;
  border-left: 4px solid #d9d9d9;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
  gap: 6px;
  flex-wrap: wrap;
}

.status-card {
  margin-bottom: 0;
  border-left: 4px solid #d9d9d9;
  padding: 12px 16px;
}

.status-type-warning {
  border-left-color: #e6a23c;
}

.status-type-primary {
  border-left-color: var(--color-primary);
}

.status-type-danger {
  border-left-color: var(--color-danger);
}

.status-type-info {
  border-left-color: #909399;
}

.status-type-success {
  border-left-color: #67c23a;
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
  gap: 6px;
}

.status-value {
  font-size: 12px;
  color: #909399;
}

.status-tip {
  font-size: 12px;
  color: #909399;
}

.status-actions {
  display: flex;
  gap: 6px;
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
  gap: 10px;
}

.action-card {
  margin-bottom: 0;
  padding: 6px 10px;
  background-color: #fafafa;
  flex: 0 0 calc(33.333% - 7px);
  box-sizing: border-box;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 14px;
}

.action-name {
  font-weight: 500;
}

.action-arrow {
  color: #909399;
  font-size: 12px;
}

.action-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.final-status-tip {
  margin-top: 12px;
}

.empty-actions {
  padding: 4px 0;
  text-align: center;
  color: #909399;
  height: auto;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.add-status-section {
  display: flex;
  justify-content: flex-start;
  margin-top: 16px;
}

/* 调整按钮大小和间距 */
:deep(.el-button--small) {
  padding: 4px 12px;
  font-size: 12px;
}

/* 调整卡片头部间距 */
:deep(.el-card__header) {
  padding: 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

/* 调整alert组件 */
:deep(.el-alert) {
  margin: 0;
  padding: 8px 16px;
}

/* 调整empty组件 */
:deep(.el-empty) {
  margin: 0;
  padding: 0;
}

:deep(.el-empty__description) {
  font-size: 12px;
  margin: 0;
}

:deep(.el-empty__image) {
  width: 40px;
  height: 40px;
  margin-bottom: 4px;
}

/* 调整tag组件间距 */
:deep(.el-tag) {
  margin: 0;
}
</style>
