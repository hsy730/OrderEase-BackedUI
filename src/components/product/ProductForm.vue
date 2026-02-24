<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="product-form">
    <!-- 基本信息 -->
    <div class="form-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon><InfoFilled /></el-icon>
          <span>基本信息</span>
        </div>
      </div>
      <div class="section-content">
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" size="default" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="商品状态">
              <el-tag v-if="form.status" :type="form.status === 'online' ? 'success' : 'info'" size="default">
                {{ form.status === 'online' ? '已上架' : '已下架' }}
              </el-tag>
              <el-tag v-else type="info" size="default">未上架</el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商品价格" prop="price">
              <div class="price-input-wrapper">
                <span class="price-prefix">¥</span>
                <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" :controls="true" class="price-input" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :precision="0" :controls="true" class="stock-input" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库存预警">
              <el-input-number v-model="form.low_stock_threshold" :min="0" :precision="0" placeholder="预警值" :controls="true" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述，支持换行" maxlength="500" show-word-limit />
        </el-form-item>
      </div>
    </div>

    <!-- 商品图片 -->
    <div class="form-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon><Picture /></el-icon>
          <span>商品图片</span>
        </div>
        <div class="section-tip">支持 JPG、PNG 格式，建议尺寸 800x800</div>
      </div>
      <div class="section-content">
        <el-form-item label="商品主图" label-width="90px">
          <div class="image-upload-wrapper">
            <el-upload v-if="form.id" class="product-image-upload" :action="null" :http-request="handleUpload" :show-file-list="false" accept="image/*">
              <div v-if="form.image_url" class="image-preview">
                <SmartImage :src="getImageUrl(form.image_url)" class="preview-image" />
                <div class="image-mask">
                  <el-icon class="mask-icon"><Edit /></el-icon>
                  <span>更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span>上传图片</span>
              </div>
            </el-upload>
            <div v-else class="upload-disabled">
              <el-icon><Lock /></el-icon>
              <span>请先保存商品信息后再上传图片</span>
            </div>
          </div>
        </el-form-item>
      </div>
    </div>

    <!-- 选项参数 -->
    <div class="form-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon><Operation /></el-icon>
          <span>选项参数</span>
        </div>
        <div class="section-tip">设置商品的可选规格，如大小、口味等</div>
      </div>
      <div class="section-content">
        <el-form-item label="参数配置" label-width="90px">
          <OptionCategories ref="optionCategoriesRef" :categories="form.option_categories" @add-category="addCategory" @remove-category="removeCategory" @add-option="addOption" @remove-option="removeOption" @default-change="handleDefaultChange" @multiple-change="handleMultipleChange" />
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Plus, InfoFilled, Picture, Edit, Lock, Operation } from '@element-plus/icons-vue'
import SmartImage from '@/components/SmartImage.vue'
import OptionCategories from './OptionCategories.vue'
import { useProductForm } from './composables/useProductForm'

const props = defineProps({
  productId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['submit'])

const optionCategoriesRef = ref(null)

const {
  formRef,
  form,
  addCategory,
  removeCategory,
  addOption,
  removeOption,
  handleDefaultChange,
  handleMultipleChange,
  handleUpload,
  getImageUrl,
  submit,
  reset
} = useProductForm(props, emit)

// 初始化拖拽排序
const initSortable = () => {
  nextTick(() => {
    form.value.option_categories.forEach((_, index) => {
      const el = optionCategoriesRef.value?.getItemRef(index)
      if (el) {
        // 这里需要在 useProductForm 中处理 Sortable 初始化
        // 为简化，保持原有逻辑在 composable 中
      }
    })
  })
}

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }]
}

onMounted(() => {
  if (props.productId) {
    // 数据加载后初始化拖拽
    setTimeout(initSortable, 500)
  }
})

defineExpose({
  submit,
  reset
})
</script>

<style scoped>
.product-form {
  padding: 0;
}

.form-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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

.section-tip {
  font-size: 11px;
  color: #86868b;
}

.section-content {
  padding: 16px 20px;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-prefix {
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
}

.price-input,
.stock-input {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

.image-upload-wrapper {
  display: flex;
}

.product-image-upload {
  width: 100px;
  height: 100px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.02);
}

.product-image-upload:hover {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.04);
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.product-image-upload:hover .image-mask {
  opacity: 1;
}

.mask-icon {
  font-size: 18px;
  color: white;
}

.image-mask span {
  font-size: 11px;
  color: white;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #86868b;
}

.upload-icon {
  font-size: 22px;
}

.upload-placeholder span {
  font-size: 11px;
}

.upload-disabled {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  color: #86868b;
  font-size: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1d1d1f;
  font-size: 13px;
  padding-bottom: 6px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  background: #ffffff;
}

:deep(.el-textarea__inner) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  background: #ffffff;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-input__inner) {
  height: 36px;
  line-height: 36px;
}

:deep(.el-input__inner::placeholder) {
  color: #86868b;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
