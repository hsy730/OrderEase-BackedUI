<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="90px"
    class="product-form"
  >
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
              <el-input
                v-model="form.name"
                placeholder="请输入商品名称"
                size="default"
                clearable
              />
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
                <el-input-number
                  v-model="form.price"
                  :precision="2"
                  :step="0.1"
                  :min="0"
                  :controls="true"
                  class="price-input"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品库存" prop="stock">
              <el-input-number
                v-model="form.stock"
                :min="0"
                :precision="0"
                :controls="true"
                class="stock-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库存预警">
              <el-input-number
                v-model="form.low_stock_threshold"
                :min="0"
                :precision="0"
                placeholder="预警值"
                :controls="true"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述，支持换行"
            maxlength="500"
            show-word-limit
          />
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
            <el-upload
              v-if="form.id"
              class="product-image-upload"
              :action="null"
              :http-request="handleUpload"
              :show-file-list="false"
              accept="image/*"
            >
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
          <div class="option-categories">
            <div v-if="form.option_categories.length === 0" class="empty-state">
              <el-icon class="empty-icon"><DocumentAdd /></el-icon>
              <p>暂无选项参数</p>
              <el-button type="primary" plain @click="addCategory">
                <el-icon><Plus /></el-icon>
                添加选项类别
              </el-button>
            </div>

            <div v-else>
              <div v-for="(category, categoryIndex) in form.option_categories" :key="categoryIndex" class="category-card">
                <div class="category-header">
                  <div class="category-title">
                    <el-icon class="category-icon"><Menu /></el-icon>
                    <span class="category-index">选项组 {{ categoryIndex + 1 }}</span>
                  </div>
                  <el-button
                    type="danger"
                    text
                    :icon="Delete"
                    size="small"
                    @click="removeCategory(categoryIndex)"
                  >
                    删除
                  </el-button>
                </div>

                <div class="category-config">
                  <el-form label-width="70px" class="category-form">
                    <el-row :gutter="12">
                      <el-col :span="10">
                        <el-form-item label="参数名" label-width="70px">
                          <el-input
                            v-model="category.name"
                            placeholder="如：大小、口味"
                            size="default"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="排序" label-width="50px">
                          <el-input-number
                            v-model="category.display_order"
                            :min="0"
                            size="default"
                            controls-position="right"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <div class="checkbox-group">
                          <el-checkbox v-model="category.is_required" size="default">
                            <span class="checkbox-label">必选</span>
                          </el-checkbox>
                          <el-checkbox v-model="category.is_multiple" size="default">
                            <span class="checkbox-label">允许多选</span>
                          </el-checkbox>
                        </div>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>

                <div class="options-list">
                  <div class="options-header">
                    <span class="options-title">选项列表</span>
                    <el-button type="primary" text :icon="Plus" size="small" @click="addOption(categoryIndex)">
                      添加选项
                    </el-button>
                  </div>

                  <div class="options-items">
                    <div
                      v-for="(option, optionIndex) in category.options"
                      :key="optionIndex"
                      class="option-item"
                    >
                      <div class="option-index">{{ optionIndex + 1 }}</div>
                      <div class="option-fields">
                        <el-input
                          v-model="option.name"
                          placeholder="选项名称"
                          class="option-name-input"
                          size="default"
                        />
                        <div class="option-field-group">
                          <span class="field-label">调价</span>
                          <el-input-number
                            v-model="option.price_adjustment"
                            :precision="2"
                            :step="0.1"
                            placeholder="0.00"
                            size="default"
                            controls-position="right"
                            class="price-adjust-input"
                          />
                        </div>
                        <div class="option-field-group">
                          <span class="field-label">排序</span>
                          <el-input-number
                            v-model="option.display_order"
                            :min="0"
                            placeholder="0"
                            size="default"
                            controls-position="right"
                            class="price-adjust-input"
                          />
                        </div>
                        <el-checkbox v-model="option.is_default" size="default">
                          <span class="checkbox-label">默认</span>
                        </el-checkbox>
                      </div>
                      <el-button
                        type="danger"
                        text
                        :icon="Close"
                        size="small"
                        @click="removeOption(categoryIndex, optionIndex)"
                        class="remove-option-btn"
                        :disabled="category.options.length <= 1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="add-category-section">
                <el-button type="primary" text :icon="Plus" @click="addCategory">
                  添加选项类别
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
  Plus, Close, InfoFilled, Picture, Edit, Lock, Operation,
  DocumentAdd, Menu, Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, uploadProductImage, getProductDetail } from '@/api/product'
import { API_BASE_URL, API_PREFIX } from '@/config'
import SmartImage from '@/components/SmartImage.vue'

const props = defineProps({
  productId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const form = ref({
  name: '',
  price: 0,
  stock: 0,
  low_stock_threshold: 10,
  description: '',
  image_url: '',
  status: 'offline',
  option_categories: []
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }]
}

const fetchProductDetail = async () => {
  if (!props.productId) return

  try {
    const data = await getProductDetail(props.productId)

    const optionCategories = data.option_categories || []

    const processedCategories = optionCategories.map(category => {
      const processedCategory = {
        name: category.name || '',
        is_required: !!category.is_required,
        is_multiple: !!category.is_multiple,
        display_order: category.display_order || 0,
        options: []
      }

      if (Array.isArray(category.options)) {
        processedCategory.options = category.options.map(option => ({
          name: option.name || '',
          price_adjustment: option.price_adjustment || 0,
          display_order: option.display_order || 0,
          is_default: !!option.is_default
        }))
      }

      if (processedCategory.options.length === 0) {
        processedCategory.options = [{ name: '', price_adjustment: 0, display_order: 0, is_default: false }]
      }

      return processedCategory
    })

    form.value = {
      id: data.id,
      name: data.name || '',
      price: data.price || 0,
      stock: data.stock || 0,
      low_stock_threshold: data.low_stock_threshold || 10,
      description: data.description || '',
      image_url: data.image_url || '',
      status: data.status || 'offline',
      option_categories: processedCategories
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败，请重试')
  }
}

const addCategory = () => {
  form.value.option_categories.push({
    name: '',
    is_required: false,
    is_multiple: false,
    display_order: form.value.option_categories.length,
    options: [{ name: '', price_adjustment: 0, display_order: 0, is_default: false }]
  })
}

const removeCategory = (index) => {
  form.value.option_categories.splice(index, 1)
}

const addOption = (categoryIndex) => {
  form.value.option_categories[categoryIndex].options.push({
    name: '',
    price_adjustment: 0,
    display_order: form.value.option_categories[categoryIndex].options.length,
    is_default: false
  })
}

const removeOption = (categoryIndex, optionIndex) => {
  const category = form.value.option_categories[categoryIndex]
  if (category.options.length > 1) {
    category.options.splice(optionIndex, 1)
  } else {
    ElMessage.warning('每个选项类别至少需要保留一个选项')
  }
}

const handleUpload = async ({ file }) => {
  if (form.value.id) {
    try {
      const res = await uploadProductImage(form.value.id, file)
      form.value.image_url = res.url
      ElMessage.success('图片上传成功')
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
    }
  } else {
    ElMessage.warning('请先保存商品信息')
  }
}

const getImageUrl = (path) => {
  return path ? `/admin/product/image?path=${path}` : "" // 返回相对路径，因为 SmartImage 组件使用 axios request 加载图片
}

const submit = async () => {
  await formRef.value?.validate()
  try {
    const submitData = { ...form.value }
    if (submitData.option_categories) {
      submitData.option_categories = submitData.option_categories
        .filter(category => category.name.trim())
        .map(category => ({
          ...category,
          options: category.options.filter(option => option.name.trim())
        }))
    }

    if (form.value.id) {
      await updateProduct(form.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createProduct(submitData)
      ElMessage.success('创建成功')
    }
    emit('submit')
  } catch (error) {
    console.error('保存商品失败:', error)
    throw error
  }
}

const reset = () => {
  formRef.value?.resetFields()
  form.value = {
    name: '',
    price: 0,
    stock: 0,
    low_stock_threshold: 10,
    description: '',
    image_url: '',
    status: 'offline',
    option_categories: []
  }
}

watch(() => props.productId, (newVal) => {
  if (newVal) {
    fetchProductDetail()
  } else {
    reset()
  }
})

onMounted(() => {
  if (props.productId) {
    fetchProductDetail()
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

/* 表单区块 */
.form-section {
  margin-bottom: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-title .el-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.section-tip {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.section-content {
  padding: var(--spacing-md) var(--spacing-lg);
}

/* 价格输入 */
.price-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-prefix {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.price-input,
.stock-input {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

/* 图片上传 */
.image-upload-wrapper {
  display: flex;
}

.product-image-upload {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
  background: var(--color-bg-secondary);
}

.product-image-upload:hover {
  border-color: var(--color-primary);
  background: var(--color-info-bg);
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
  transition: opacity var(--transition-base);
}

.product-image-upload:hover .image-mask {
  opacity: 1;
}

.mask-icon {
  font-size: 18px;
  color: white;
}

.image-mask span {
  font-size: 12px;
  color: white;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--color-text-tertiary);
}

.upload-icon {
  font-size: 24px;
}

.upload-placeholder span {
  font-size: 12px;
}

.upload-disabled {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  font-size: 12px;
}

/* 选项参数 */
.option-categories {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.empty-icon {
  font-size: 40px;
  color: var(--color-border);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

/* 选项类别卡片 */
.category-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.category-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border-light);
}

.category-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: var(--color-text-primary);
}

.category-icon {
  font-size: 14px;
  color: var(--color-primary);
}

.category-index {
  font-size: 13px;
}

.category-config {
  margin-bottom: var(--spacing-sm);
}

.category-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.checkbox-group {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: 4px;
}

.checkbox-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 选项列表 */
.options-list {
  background: white;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  border: 1px solid var(--color-border-light);
}

.options-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
  padding: 0 var(--spacing-xs);
}

.options-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.options-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.option-item:hover {
  border-color: var(--color-primary-light);
}

.option-index {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-info-bg);
  color: var(--color-info);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.option-fields {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.option-name-input {
  width: 180px;
}

.option-field-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.field-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.price-adjust-input {
  width: 100px;
}

.remove-option-btn {
  flex-shrink: 0;
}

.remove-option-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-category-section {
  display: flex;
  justify-content: center;
  padding: var(--spacing-sm) 0;
}

/* 表单项样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--color-text-secondary);
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-sm);
}

:deep(.el-textarea__inner) {
  border-radius: var(--radius-sm);
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: var(--radius-sm);
}

/* 响应式 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .option-fields {
    flex-wrap: wrap;
  }

  .option-name-input {
    width: 100%;
  }
}
</style>
