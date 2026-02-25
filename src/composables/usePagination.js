import { ref, computed, onUnmounted } from 'vue'

/**
 * 分页组合式函数
 * 统一管理分页逻辑
 * @param {Object} options - 配置选项
 * @param {Function} options.fetchData - 获取数据的函数
 * @param {number} options.defaultPageSize - 默认每页条数，默认10
 * @param {number} options.defaultPage - 默认页码，默认1
 * @returns {Object} 分页相关状态和方法
 */
export function usePagination(options = {}) {
  const {
    fetchData,
    defaultPageSize = 10,
    defaultPage = 1
  } = options

  // 分页状态
  const currentPage = ref(defaultPage)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const loading = ref(false)

  // 分页参数（用于传递给API）
  const paginationParams = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value
  }))

  // 是否有数据
  const hasData = computed(() => total.value > 0)

  // 总页数
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  /**
   * 处理每页条数变化
   * @param {number} newSize - 新的每页条数
   */
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1 // 重置到第一页
    if (fetchData) {
      fetchData()
    }
  }

  /**
   * 处理页码变化
   * @param {number} newPage - 新的页码
   */
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
    if (fetchData) {
      fetchData()
    }
  }

  /**
   * 重置分页
   */
  const resetPagination = () => {
    currentPage.value = defaultPage
    pageSize.value = defaultPageSize
    total.value = 0
  }

  /**
   * 设置总条数
   * @param {number} newTotal - 新的总条数
   */
  const setTotal = (newTotal) => {
    total.value = newTotal
  }

  /**
   * 刷新数据（保持在当前页）
   */
  const refresh = () => {
    if (fetchData) {
      fetchData()
    }
  }

  /**
   * 跳转到第一页并刷新
   */
  const refreshToFirst = () => {
    currentPage.value = 1
    if (fetchData) {
      fetchData()
    }
  }

  return {
    // 状态
    currentPage,
    pageSize,
    total,
    loading,
    paginationParams,
    hasData,
    totalPages,

    // 方法
    handleSizeChange,
    handleCurrentChange,
    resetPagination,
    setTotal,
    refresh,
    refreshToFirst
  }
}

/**
 * 带搜索的分页组合式函数
 * 在基础分页上增加搜索功能
 * @param {Object} options - 配置选项
 * @param {Function} options.fetchData - 获取数据的函数
 * @param {number} options.defaultPageSize - 默认每页条数
 * @param {number} options.debounceMs - 搜索防抖毫秒数，默认500
 * @returns {Object} 分页和搜索相关状态和方法
 */
export function usePaginationWithSearch(options = {}) {
  const {
    fetchData,
    defaultPageSize = 10,
    debounceMs = 500
  } = options

  // 使用基础分页
  const pagination = usePagination({
    fetchData,
    defaultPageSize
  })

  // 搜索状态
  const searchKeyword = ref('')
  let searchTimeout = null

  /**
   * 处理搜索输入（带防抖）
   */
  const handleSearchInput = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      pagination.refreshToFirst()
    }, debounceMs)
  }

  /**
   * 立即搜索（无防抖）
   */
  const searchImmediately = () => {
    clearTimeout(searchTimeout)
    pagination.refreshToFirst()
  }

  /**
   * 清空搜索
   */
  const clearSearch = () => {
    searchKeyword.value = ''
    searchImmediately()
  }

  /**
   * 重置所有状态（搜索+分页）
   */
  const resetAll = () => {
    searchKeyword.value = ''
    pagination.resetPagination()
  }

  /**
   * 清理定时器
   */
  const cleanup = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
  }

  // 搜索参数（用于传递给API）
  const searchParams = computed(() => ({
    keyword: searchKeyword.value,
    page: pagination.currentPage.value,
    pageSize: pagination.pageSize.value
  }))

  return {
    // 基础分页
    ...pagination,

    // 搜索状态
    searchKeyword,
    searchParams,

    // 搜索方法
    handleSearchInput,
    searchImmediately,
    clearSearch,
    resetAll,
    cleanup
  }
}
