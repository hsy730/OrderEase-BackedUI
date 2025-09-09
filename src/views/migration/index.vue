<template>
  <div class="migration-container">
    <!-- <div class="header">
      <h2>数据迁移</h2>
    </div> -->

    <el-card class="export-card">
      <template #header>
        <div class="card-header">
          <span>导出数据</span>
        </div>
      </template>
      <div class="card-content">
        <p class="description">导出所有数据为ZIP格式，包含用户、商品、订单等CSV文件</p>
        <el-button 
          type="primary" 
          :loading="exporting" 
          @click="handleExport"
        >
          导出数据
        </el-button>
      </div>
    </el-card>

    <el-card class="import-card">
      <template #header>
        <div class="card-header">
          <span>导入数据</span>
        </div>
      </template>
      <div class="card-content">
        <p class="description">从ZIP文件导入数据</p>
        <el-upload
          class="upload-demo"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          accept=".zip"
          :show-file-list="false"
        >
          <el-button type="primary" :loading="importing">导入数据</el-button>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 ZIP 文件，且必须包含正确的 CSV 文件
              <ul class="file-list">
                <li>users.csv - 用户数据</li>
                <li>products.csv - 商品数据</li>
                <li>orders.csv - 订单数据</li>
                <li>order_items.csv - 订单项数据</li>
              </ul>
            </div>
          </template>
        </el-upload>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { exportData } from '@/api/migration'
import { API_BASE_URL, API_PREFIX } from '@/config'

const exporting = ref(false)
const importing = ref(false)

// 获取上传 URL
const uploadUrl = `${API_BASE_URL}${API_PREFIX}/admin/data/import`

// 设置上传请求头
const uploadHeaders = computed(() => {
  const adminInfo = JSON.parse(localStorage.getItem('admin') || '{}')
  return {
    Authorization: `Bearer ${adminInfo.token}`
  }
})

// 导出数据
const handleExport = async () => {
  try {
    exporting.value = true
    const response = await exportData()
    
    // 处理二进制响应
    const blob = new Blob([response], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 生成文件名
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '')
    link.download = `export_${date}_${time}.zip`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(error.response?.data?.error || '导出失败')
  } finally {
    exporting.value = false
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isZIP = file.type === 'application/zip' || file.type === 'application/x-zip-compressed'
  if (!isZIP) {
    ElMessage.error('只能上传 ZIP 文件!')
    return false
  }
  importing.value = true
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  importing.value = false
  ElMessage.success(response.message || '数据导入成功')
}

// 上传失败
const handleUploadError = (error) => {
  importing.value = false
  console.error('导入失败:', error)
  const errorMsg = error.response?.data?.error || '数据导入失败'
  ElMessage.error(errorMsg)
}
</script>

<style scoped>
.migration-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.export-card,
.import-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.card-content {
  padding: 20px 0;
}

.description {
  margin-bottom: 15px;
  color: #606266;
}

.upload-demo {
  text-align: left;
}

.el-upload__tip {
  margin-top: 8px;
  color: #909399;
}

.file-list {
  margin: 8px 0 0 20px;
  padding: 0;
  font-size: 12px;
  color: #909399;
}

.file-list li {
  margin-bottom: 4px;
}
</style> 