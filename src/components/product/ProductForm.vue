<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="商品名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入商品名称" />
    </el-form-item>
    <el-form-item label="商品价格" prop="price">
      <el-input-number
        v-model="form.price"
        :precision="2"
        :step="0.1"
        :min="0"
      />
    </el-form-item>
    <el-form-item label="商品库存" prop="stock">
      <el-input-number
        v-model="form.stock"
        :min="0"
        :precision="0"
      />
    </el-form-item>
    <el-form-item label="商品描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        rows="4"
        placeholder="请输入商品描述"
      />
    </el-form-item>
    <el-form-item label="商品图片">
      <el-upload
        v-if="form.id"
        class="product-image-upload"
        :action="null"
        :http-request="handleUpload"
        :show-file-list="false"
        accept="image/*"
      >
        <img v-if="form.image_url" :src="getImageUrl(form.image_url)" class="preview-image">
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
      <div v-else class="upload-tip">请先保存商品信息后再上传图片</div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, uploadProductImage, getProductDetail } from '@/api/product'
import { API_BASE_URL, API_PREFIX } from '@/config'

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
  image_url: ''
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
    form.value = {
      id: data.id,
      name: data.name,
      price: data.price,
      stock: data.stock,
      description: data.description,
      image_url: data.image_url
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
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
    if (form.value.id) {
      await updateProduct(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createProduct(form.value)
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
    image_url: ''
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

<style scoped>
.product-image-upload {
  width: 200px;
  height: 200px;
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
</style> 