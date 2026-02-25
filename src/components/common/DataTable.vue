<template>
  <div class="data-table-wrapper">
    <div class="table-header" v-if="showHeader">
      <div class="header-left">
        <slot name="header-left">
          <h3 class="table-title">{{ title }}</h3>
          <span v-if="subtitle" class="table-subtitle">{{ subtitle }}</span>
        </slot>
      </div>
      <div class="header-right">
        <slot name="header-right" />
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="data"
      :stripe="stripe"
      :border="border"
      :height="height"
      :max-height="maxHeight"
      :row-key="rowKey"
      :virtualized="virtualized"
      v-bind="defaultSort ? { 'default-sort': defaultSort } : {}"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      class="data-table"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="50"
        align="center"
        fixed="left"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        :index="indexMethod"
        width="60"
        align="center"
        label="序号"
        fixed="left"
      />

      <!-- 动态列 -->
      <slot />

      <!-- 操作列 -->
      <el-table-column
        v-if="showOperation"
        :width="operationWidth"
        :fixed="operationFixed"
        align="center"
        class-name="operation-column"
      >
        <template #header>
          <slot name="operation-header">操作</slot>
        </template>
        <template #default="{ row, $index }">
          <slot name="operation" :row="row" :index="$index" />
        </template>
      </el-table-column>

      <!-- 空数据 -->
      <template #empty>
        <slot name="empty">
          <div class="empty-state">
            <el-icon class="empty-icon"><DocumentDelete /></el-icon>
            <p>{{ emptyText }}</p>
          </div>
        </slot>
      </template>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination && total > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :background="paginationBackground"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DocumentDelete } from '@element-plus/icons-vue'

const props = defineProps({
  // 数据
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },

  // 表格配置
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: false
  },
  height: {
    type: [String, Number],
    default: null
  },
  maxHeight: {
    type: [String, Number],
    default: null
  },
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  virtualized: {
    type: Boolean,
    default: true
  },
  defaultSort: {
    type: Object,
    default: null
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },

  // 列配置
  showSelection: {
    type: Boolean,
    default: false
  },
  showIndex: {
    type: Boolean,
    default: false
  },
  indexOffset: {
    type: Number,
    default: 0
  },
  showOperation: {
    type: Boolean,
    default: false
  },
  operationWidth: {
    type: [String, Number],
    default: 150
  },
  operationFixed: {
    type: [String, Boolean],
    default: 'right'
  },

  // 分页配置
  showPagination: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  paginationBackground: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'selection-change',
  'sort-change',
  'row-click',
  'size-change',
  'current-change'
])

// 分页双向绑定
const currentPage = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val)
})

const pageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

// 序号计算方法
const indexMethod = (index) => {
  return index + 1 + props.indexOffset
}

// 事件处理
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', { column, prop, order })
}

const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  emit('size-change', size)
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  emit('current-change', page)
}
</script>

<style scoped>
.data-table-wrapper {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.table-subtitle {
  font-size: 13px;
  color: #86868b;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-table :deep(.el-table__header-wrapper th.el-table__cell) {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-weight: 600;
  color: #1d1d1f;
  font-size: 13px;
  padding: 12px 16px;
}

.data-table :deep(.el-table__body-wrapper td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 14px 16px;
  font-size: 13px;
  color: #1d1d1f;
}

.data-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: rgba(59, 130, 246, 0.02);
}

.data-table :deep(.el-table__row.is-hovering > td.el-table__cell) {
  background: rgba(59, 130, 246, 0.04);
}

.operation-column :deep(.cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #86868b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #d1d5db;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* 滚动条样式 */
.data-table :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.data-table :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}

.data-table :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.data-table :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 0, 0, 0.2);
}

@media screen and (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .pagination-wrapper {
    justify-content: center;
  }
}
</style>
