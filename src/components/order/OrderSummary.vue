<template>
  <section class="form-section summary-section">
    <div class="section-header">
      <div class="section-title">
        <el-icon><Money /></el-icon>
        <span>订单汇总</span>
      </div>
    </div>

    <div class="section-content">
      <div class="summary-row">
        <span class="summary-label">订单总额</span>
        <span class="total-amount">¥{{ totalAmount }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Money } from '@element-plus/icons-vue'

defineProps({
  totalAmount: {
    type: String,
    default: '0.00'
  }
})
</script>

<style scoped>
.form-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.2px;
}

.section-title .el-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.section-content {
  padding: 16px 20px;
}

.summary-section {
  background: linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.total-amount {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-danger);
  letter-spacing: -0.5px;
}
</style>
