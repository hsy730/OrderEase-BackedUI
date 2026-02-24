<template>
  <el-drawer v-model="visible" title="通知中心" size="380px">
    <div class="notification-list">
      <div class="notification-item" v-for="item in notifications" :key="item.id">
        <div class="notification-icon" :class="`notification-${item.type}`">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ item.title }}</div>
          <div class="notification-desc">{{ item.desc }}</div>
          <div class="notification-time">{{ item.time }}</div>
        </div>
      </div>
      <el-empty v-if="notifications.length === 0" description="暂无通知" />
    </div>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  notifications: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-item:hover {
  background: var(--color-bg-tertiary);
  transform: translateX(4px);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon .el-icon {
  font-size: 20px;
}

.notification-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.notification-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.notification-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.notification-info {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>
