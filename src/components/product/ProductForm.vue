<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
  >
    <!-- 原有字段保持不变 -->
    <el-form-item label="商品名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入商品名称" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="商品价格" prop="price">
      <el-input-number
        v-model="form.price"
        :precision="2"
        :step="0.1"
        :min="0"
        style="width: 150px;"
      />
    </el-form-item>
    <el-form-item label="商品库存" prop="stock">
      <el-input-number
        v-model="form.stock"
        :min="0"
        :precision="0"
        style="width: 150px;"
      />
    </el-form-item>
    <el-form-item label="商品描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="4"
        placeholder="请输入商品描述"
        style="width: 500px;"
      />
    </el-form-item>
    
    <!-- 添加选项参数功能 -->
    <el-form-item label="选项参数" prop="option_categories" style="width: 100%; font-size: small;">
      <div class="option-categories">
        <div v-for="(category, categoryIndex) in form.option_categories" :key="categoryIndex" class="category-wrapper">
          <div class="category-item">
            <div class="category-header">
              <span class="field-label">参数名</span>
              <el-input
                v-model="category.name"
                placeholder="参数类别名称（如：大小、口味等）"
                style="width: 230px; margin-right: 0;"
                size="small"
              />
              <span class="field-label" style="margin-left: 0;">排序</span>
              <el-input-number
                v-model="category.display_order"
                :min="0"
                placeholder="显示顺序"
                size="small"
                style="width: 100px; margin-left: 0;"
              />
              <el-checkbox v-model="category.is_required" style="margin-left: 10px; margin-right: 0;">必填</el-checkbox>
              <el-checkbox v-model="category.is_multiple" style="margin-left: 10px;">多选</el-checkbox>
            </div>
          
            <div class="options-container">
              <div v-for="(option, optionIndex) in category.options" :key="optionIndex" class="option-wrapper">
                <div class="option-item">
                  <span class="field-label">选项名</span>
                  <el-input
                    v-model="option.name"
                    placeholder="选项名称（如：小杯、中杯等）"
                    size="small"
                    style="width: 205px; margin-right: 0;"
                  />
                  <span class="field-label">调价</span>
                  <el-input-number
                    v-model="option.price_adjustment"
                    :precision="2"
                    :step="0.1"
                    placeholder="价格调整"
                    size="small"
                    style="width: 205px; margin-right: 0;"
                  />
                  <span class="field-label">排序</span>
                  <el-input-number
                    v-model="option.display_order"
                    :min="0"
                    placeholder="显示顺序"
                    size="small"
                    style="width: 100px; margin-right: 10px;"
                  />
                  <el-checkbox v-model="option.is_default" style="margin-left: 10px;">默认值</el-checkbox>
                </div>
              
                <div class="delete-icon-wrapper" @click="removeOption(categoryIndex, optionIndex)">
                  <el-icon class="delete-icon"><Close /></el-icon>
                </div>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="addOption(categoryIndex)"
                class="add-option-btn"
              >
                添加选项
              </el-button>
            </div>
          </div>
 
          <el-button
            type="danger"
            size="small"
            @click="removeCategory(categoryIndex)"
            v-if="form.option_categories.length > 0"
            class="delete-category-btn"
          >
            删除选项类别
          </el-button>
        </div>
        <el-button
          type="primary"
          size="small"
          @click="addCategory"
          class="add-category-btn"
        >
          添加选项类别
        </el-button>
      </div>
    </el-form-item>
    
    <!-- 商品图片保持不变 -->
    <el-form-item label="商品图片">
      <el-upload
        v-if="form.id"
        class="product-image-upload"
        :action="null"
        :http-request="handleUpload"
        :show-file-list="false"
        accept="image/*"
      >
        <smart-image v-if="form.image_url" :src="getImageUrl(form.image_url)" :class-name="'preview-image'"></smart-image>
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
      <div v-else class="upload-tip">请先保存商品信息后再上传图片</div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Plus, Close } from '@element-plus/icons-vue'
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
  description: '',
  image_url: '',
  option_categories: [] // 新增选项类别字段
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }]
}

// 获取商品详情
const fetchProductDetail = async () => {
  if (!props.productId) return
  
  try {
    const data = await getProductDetail(props.productId)
    console.log('获取到的商品数据:', data)
    
    // 确保 option_categories 存在且是数组
    const optionCategories = data.option_categories || []
    
    // 对每个选项类别进行处理，确保数据结构完整
    const processedCategories = optionCategories.map(category => {
      // 确保类别基本字段存在
      const processedCategory = {
        name: category.name || '',
        is_required: !!category.is_required,
        is_multiple: !!category.is_multiple,
        display_order: category.display_order || 0,
        options: []
      }
      
      // 处理选项列表
      if (Array.isArray(category.options)) {
        processedCategory.options = category.options.map(option => ({
          name: option.name || '',
          price_adjustment: option.price_adjustment || 0,
          display_order: option.display_order || 0,
          is_default: !!option.is_default
        }))
      }
      
      // 确保每个类别至少有一个选项
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
      description: data.description || '',
      image_url: data.image_url || '',
      option_categories: processedCategories
    }
    
    console.log('处理后的表单数据:', form.value)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败，请重试')
  }
}

// 添加选项类别
const addCategory = () => {
  form.value.option_categories.push({
    name: '',
    is_required: false,
    is_multiple: false,
    display_order: 0,
    options: [{ name: '', price_adjustment: 0, display_order: 0, is_default: false }]
  })
}

// 删除选项类别
const removeCategory = (index) => {
  form.value.option_categories.splice(index, 1)
}

// 添加选项
const addOption = (categoryIndex) => {
  form.value.option_categories[categoryIndex].options.push({
    name: '',
    price_adjustment: 0,
    display_order: 0,
    is_default: false
  })
}

// 删除选项
const removeOption = (categoryIndex, optionIndex) => {
  const category = form.value.option_categories[categoryIndex]
  if (category.options.length > 1) {
    category.options.splice(optionIndex, 1)
  } else {
    ElMessage.warning('每个选项类别至少需要保留一个选项')
  }
}

// 处理图片上传
const handleUpload = async ({ file }) => {
  if (form.value.id) {
    try {
      const res = await uploadProductImage(form.value.id, file)
      form.value.image_url = res.url
      ElMessage.success('图片上传成功')
    } catch (error) {
      console.error('图片上传失败:', error)
    }
  } else {
    ElMessage.warning('请先保存商品信息')
  }
}

// 获取图片完整URL
const getImageUrl = (path) => {
  return path ? `${API_BASE_URL}${API_PREFIX}/admin/product/image?path=${path}` : ''
}

// 提交表单
const submit = async () => {
  await formRef.value?.validate()
  try {
    // 准备提交数据，确保空的选项类别不会被提交
    const submitData = { ...form.value }
    // 过滤掉没有名称的选项类别
    if (submitData.option_categories) {
      submitData.option_categories = submitData.option_categories
        .filter(category => category.name.trim())
        .map(category => ({
          ...category,
          // 过滤掉没有名称的选项
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
  }
}

// 重置表单
const reset = () => {
  formRef.value?.resetFields()
  form.value = {
    name: '',
    price: 0,
    stock: 0,
    description: '',
    image_url: '',
    option_categories: []
  }
}

// 监听 productId 变化
watch(() => props.productId, (newVal) => {
  if (newVal) {
    fetchProductDetail()
  } else {
    reset()
  }
})

// 组件挂载时获取商品详情
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

// 在 style 标签中添加以下样式
<style scoped>
.product-image-upload {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-tip {
  color: #909399;
  font-size: 14px;
}

/* 选项参数样式 */
.option-categories {
  width: 100%;
  box-sizing: border-box;
}

.category-wrapper {
  position: relative;
  margin-bottom: 50px;
}

.category-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 4px;
}

.delete-category-btn {
  position: absolute;
  right: 0;
  bottom: -30px;
  z-index: 10;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 0;
}

.option-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  background-color: #ffffff;
  margin-bottom: 8px;
}

.delete-option-btn {
  position: absolute;
  right: 0;
  bottom: -15px;
  z-index: 10;
}

/* 删除图标容器样式 */
.delete-icon-wrapper {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-icon-wrapper:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

/* 删除图标样式 */
.delete-icon {
  font-size: 12px;
  color: #909399;
  transition: color 0.3s ease;
}

.delete-icon-wrapper:hover .delete-icon {
  color: #f56c6c;
}

.add-option-btn,
.add-category-btn {
  margin-top: 0;
  align-self:  flex-start;
}

/* 字段标签样式 */
.field-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  display: inline-block;
  margin-right: 5px;
  width: 40px;
  text-align: right;
}

/* 调整布局以适应新添加的标签 */
.category-header,
.option-item {
  align-items: center;
}
</style>