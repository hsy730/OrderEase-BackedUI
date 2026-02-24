<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="920px"
    :close-on-click-modal="false"
    class="apple-dialog product-dialog"
    destroy-on-close
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
        <button class="close-btn" @click="visible = false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </template>

    <ProductForm ref="productFormRef" :product-id="productId" @submit="handleSubmit" />

    <template #footer>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="visible = false">取消</button>
        <button class="btn-confirm" @click="handleConfirm">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>确定</span>
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ProductForm from '@/components/product/ProductForm.vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: ''
  },
  productId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const productFormRef = ref(null)

const handleConfirm = async () => {
  if (!productFormRef.value) return
  try {
    await productFormRef.value.submit()
    visible.value = false
    ElMessage.success(props.productId ? '更新成功' : '添加成功')
    emit('submit')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.error || '保存失败')
  }
}

const handleSubmit = () => {
  visible.value = false
  emit('submit')
}
</script>

<style scoped>
.product-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.product-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.product-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.product-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1d1d1f;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.01);
}

.btn-cancel {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.08);
}

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
</style>
