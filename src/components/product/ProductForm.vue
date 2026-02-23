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
                          <el-checkbox
                            v-model="category.is_multiple"
                            size="default"
                            @change="(val) => handleMultipleChange(categoryIndex, val)"
                          >
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

                  <div class="options-items" :ref="el => setOptionsRef(el, categoryIndex)">
                    <div
                      v-for="(option, optionIndex) in category.options"
                      :key="option._key || optionIndex"
                      class="option-item"
                      :data-index="optionIndex"
                    >
                      <div class="drag-handle">
                        <el-icon><Rank /></el-icon>
                      </div>
                      <div class="option-content">
                        <div class="option-main-row">
                          <div class="option-index">{{ optionIndex + 1 }}</div>
                          <el-input
                            v-model="option.name"
                            placeholder="选项名称"
                            class="option-name-input"
                            size="default"
                          />
                          <div class="option-price-group">
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
                          <el-checkbox
                            v-model="option.is_default"
                            size="default"
                            class="default-checkbox"
                            @change="(val) => handleDefaultChange(categoryIndex, optionIndex, val)"
                          >
                            <span class="checkbox-label">默认</span>
                          </el-checkbox>
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
import { ref, watch, onMounted, nextTick } from 'vue'
import {
  Plus, Close, InfoFilled, Picture, Edit, Lock, Operation,
  DocumentAdd, Menu, Delete, Rank
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, uploadProductImage, getProductDetail } from '@/api/product'
import { API_BASE_URL, API_PREFIX } from '@/config'
import SmartImage from '@/components/SmartImage.vue'
import Sortable from 'sortablejs'

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
  stock: 100,
  low_stock_threshold: 10,
  description: '',
  image_url: '',
  status: 'offline',
  option_categories: []
})

// 存储每个选项类别的拖拽实例和ref
const optionsRefs = ref({})
const sortableInstances = ref({})

// 设置选项列表的ref
const setOptionsRef = (el, categoryIndex) => {
  if (el) {
    optionsRefs.value[categoryIndex] = el
  }
}

// 初始化拖拽排序
const initSortable = (categoryIndex) => {
  const el = optionsRefs.value[categoryIndex]
  if (!el) return

  // 如果已经存在实例，先销毁
  if (sortableInstances.value[categoryIndex]) {
    sortableInstances.value[categoryIndex].destroy()
  }

  sortableInstances.value[categoryIndex] = Sortable.create(el, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt
      if (oldIndex !== newIndex) {
        // 移动数组元素
        const options = form.value.option_categories[categoryIndex].options
        const item = options.splice(oldIndex, 1)[0]
        options.splice(newIndex, 0, item)
      }
    }
  })
}

// 初始化所有拖拽实例
const initAllSortable = () => {
  nextTick(() => {
    form.value.option_categories.forEach((_, index) => {
      initSortable(index)
    })
  })
}

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
        // 按 display_order 排序选项
        const sortedOptions = [...category.options].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        processedCategory.options = sortedOptions.map((option, index) => ({
          _key: Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9),
          name: option.name || '',
          price_adjustment: option.price_adjustment || 0,
          display_order: option.display_order || 0,
          is_default: !!option.is_default
        }))
      }

      if (processedCategory.options.length === 0) {
        processedCategory.options = [{ _key: Date.now() + '_0', name: '', price_adjustment: 0, display_order: 0, is_default: false }]
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

    // 初始化拖拽排序
    initAllSortable()
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
    options: [{ _key: Date.now() + '_new', name: '', price_adjustment: 0, display_order: 0, is_default: false }]
  })
  // 初始化新添加类别的拖拽排序
  const newIndex = form.value.option_categories.length - 1
  nextTick(() => {
    initSortable(newIndex)
  })
}

const removeCategory = (index) => {
  form.value.option_categories.splice(index, 1)
}

const addOption = (categoryIndex) => {
  form.value.option_categories[categoryIndex].options.push({
    _key: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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

// 处理默认选项变化（单选场景下互斥）
const handleDefaultChange = (categoryIndex, optionIndex, isDefault) => {
  const category = form.value.option_categories[categoryIndex]
  // 单选场景且设置为默认时，取消其他选项的默认状态
  if (!category.is_multiple && isDefault) {
    category.options.forEach((option, idx) => {
      if (idx !== optionIndex) {
        option.is_default = false
      }
    })
  }
}

// 处理多选切换（从多选切换到单选时，只保留第一个默认选项）
const handleMultipleChange = (categoryIndex, isMultiple) => {
  const category = form.value.option_categories[categoryIndex]
  // 切换到单选时，如果存在多个默认选项，只保留第一个
  if (!isMultiple) {
    const defaultOptions = category.options.filter(option => option.is_default)
    if (defaultOptions.length > 1) {
      // 只保留第一个默认选项
      let foundFirst = false
      category.options.forEach(option => {
        if (option.is_default) {
          if (foundFirst) {
            option.is_default = false
          } else {
            foundFirst = true
          }
        }
      })
    }
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
        .map((category, categoryIndex) => ({
          ...category,
          display_order: categoryIndex,
          options: category.options
            .filter(option => option.name.trim())
            .map((option, optionIndex) => ({
              ...option,
              display_order: optionIndex
            }))
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
    stock: 100,
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
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
  margin-top: var(--spacing-md);
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
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.option-item:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

/* 拖拽手柄样式 */
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: move;
  cursor: grab;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.drag-handle:hover {
  background: var(--color-border-light);
  color: var(--color-text-secondary);
}

.drag-handle:active {
  cursor: grabbing;
}

/* 拖拽时的样式 */
.sortable-ghost {
  opacity: 0.5;
  background: var(--color-info-bg);
  border: 2px dashed var(--color-primary);
}

.sortable-chosen {
  background: var(--color-bg-secondary);
}

.sortable-drag {
  opacity: 0.9;
  background: white;
  box-shadow: var(--shadow-lg);
}

/* 选项内容区域 */
.option-content {
  flex: 1;
  min-width: 0;
}

.option-main-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.option-index {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.option-name-input {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.option-price-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.field-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.price-adjust-input {
  width: 90px;
}

.default-checkbox {
  flex-shrink: 0;
  margin-left: var(--spacing-xs);
}

.remove-option-btn {
  flex-shrink: 0;
  margin-left: auto;
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
