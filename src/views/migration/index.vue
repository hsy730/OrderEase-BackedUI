<template>
  <div class="migration-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">数据迁移</h1>
          <p class="page-description">安全地导出和导入您的系统数据</p>
        </div>
      </div>

      <div class="migration-cards">
        <div class="migration-card export-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="card-body">
            <h2 class="card-title">导出数据</h2>
            <p class="card-description">
              将所有系统数据导出为 ZIP 格式文件，包含用户、商品、订单等数据的 CSV 文件
            </p>
            <div class="card-features">
              <div class="feature-item">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>用户数据</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>商品数据</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>订单数据</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>店铺数据</span>
              </div>
            </div>
            <button 
              class="action-btn export-btn" 
              :class="{ loading: exporting }"
              :disabled="exporting"
              @click="handleExport"
            >
              <svg v-if="!exporting" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span class="loading-spinner" v-else></span>
              <span>{{ exporting ? '正在导出...' : '导出数据' }}</span>
            </button>
          </div>
        </div>

        <div class="migration-card import-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div class="card-body">
            <h2 class="card-title">导入数据</h2>
            <p class="card-description">
              从 ZIP 文件导入数据到系统，支持增量导入和完全覆盖两种模式
            </p>
            <div class="upload-area" 
              :class="{ 'drag-over': isDragOver }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
              @click="triggerUpload"
            >
              <input 
                type="file" 
                ref="fileInput" 
                accept=".zip" 
                hidden 
                @change="handleFileSelect"
              />
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p class="upload-text">
                <span class="upload-link">点击上传</span> 或拖拽文件到此处
              </p>
              <p class="upload-hint">仅支持 ZIP 格式文件</p>
            </div>
            <div class="file-requirements">
              <h4>文件要求</h4>
              <ul>
                <li>users.csv - 用户数据</li>
                <li>products.csv - 商品数据</li>
                <li>orders.csv - 订单数据</li>
                <li>order_items.csv - 订单项数据</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="info-content">
            <h4>注意事项</h4>
            <ul>
              <li>导出的数据文件包含敏感信息，请妥善保管</li>
              <li>导入数据前建议先导出当前数据作为备份</li>
              <li>导入操作可能会覆盖现有数据，请谨慎操作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { exportData, importData } from '@/api/migration'

const exporting = ref(false)
const importing = ref(false)
const isDragOver = ref(false)
const fileInput = ref(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file) => {
  const isZIP = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')
  if (!isZIP) {
    ElMessage.error('只能上传 ZIP 文件!')
    return
  }

  try {
    importing.value = true
    ElMessage.info('正在导入数据，请稍候...')
    
    const formData = new FormData()
    formData.append('file', file)
    
    await importData(formData)
    ElMessage.success('数据导入成功')
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error(error.response?.data?.error || '数据导入失败')
  } finally {
    importing.value = false
  }
}

const handleExport = async () => {
  try {
    exporting.value = true
    const response = await exportData()
    
    const blob = new Blob([response], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
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
</script>

<style scoped>
.migration-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-description {
  font-size: 16px;
  color: #86868b;
  margin: 0;
}

.migration-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.migration-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.migration-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.export-card .card-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  color: #3b82f6;
}

.import-card .card-icon {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #34c759;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.card-description {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #1d1d1f;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px 12px;
  border-radius: 20px;
}

.feature-item svg {
  color: #34c759;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.export-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.02);
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.upload-area svg {
  color: #86868b;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.upload-link {
  color: #3b82f6;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #86868b;
  margin: 0;
}

.file-requirements {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  padding: 16px;
}

.file-requirements h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 10px 0;
}

.file-requirements ul {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: 12px;
  color: #86868b;
}

.file-requirements li {
  margin-bottom: 4px;
}

.info-section {
  margin-top: 24px;
}

.info-card {
  display: flex;
  gap: 16px;
  background: rgba(255, 149, 0, 0.05);
  border: 1px solid rgba(255, 149, 0, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.info-icon {
  flex-shrink: 0;
  color: #ff9500;
}

.info-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.info-content ul {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: 13px;
  color: #6e6e73;
}

.info-content li {
  margin-bottom: 4px;
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .migration-cards {
    grid-template-columns: 1fr;
  }
  
  .migration-card {
    padding: 24px;
  }
}
</style>
