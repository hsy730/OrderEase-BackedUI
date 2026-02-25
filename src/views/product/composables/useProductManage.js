import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList, deleteProduct, updateProductStatus, getProductImageUrl } from '@/api/product'
import { formatTime } from '@/utils/date'

export function useProductManage() {
  const router = useRouter()
  
  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const currentProductId = ref(null)
  const productList = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const searchText = ref('')
  let searchTimeout = null

  // 获取商品列表
  const fetchProductList = async () => {
    loading.value = true
    try {
      const response = await getProductList({
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchText.value
      })
      productList.value = response.data || []
      total.value = response.total || 0
      currentPage.value = response.page || 1
      pageSize.value = response.pageSize || 10
    } catch (error) {
      console.error('获取商品列表失败:', error)
      ElMessage.error('获取商品列表失败')
      productList.value = []
    } finally {
      loading.value = false
    }
  }

  // 搜索输入处理
  const handleSearchInput = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
      fetchProductList()
    }, 500)
  }

  // 获取图片URL
  const getImageUrl = (path) => {
    return getProductImageUrl(path)
  }

  // 新增商品
  const handleAdd = () => {
    dialogTitle.value = '新增商品'
    currentProductId.value = null
    dialogVisible.value = true
  }

  // 编辑商品
  const handleEdit = (row) => {
    dialogTitle.value = '编辑商品'
    currentProductId.value = row.id
    dialogVisible.value = true
  }

  // 查看商品
  const handleView = (row) => {
    router.push(`/product/${row.id}`)
  }

  // 删除商品
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm('确认删除该商品？删除后不可恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteProduct(row.id)
      ElMessage.success('删除成功')
      fetchProductList()
    } catch (error) {
      if (error === 'cancel') return
      console.error('删除商品失败:', error)
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }

  // 状态变更
  const handleStatusChange = async (row, newStatus) => {
    const confirmMessage = newStatus === 'online'
      ? '商品上架后，才能购买，确认上架？'
      : '商品下架后，不能购买，确认下架？'

    try {
      await ElMessageBox.confirm(confirmMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await updateProductStatus(row.id, newStatus)
      row.status = newStatus
      ElMessage.success(newStatus === 'online' ? '商品已上架' : '商品已下架')
    } catch (error) {
      if (error === 'cancel') return
      console.error('状态更新失败:', error)
      ElMessage.error('状态更新失败')
      fetchProductList()
    }
  }

  // 分页大小变化
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1
    fetchProductList()
  }

  // 页码变化
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
    fetchProductList()
  }

  // 刷新
  const handleRefresh = () => {
    loading.value = true
    fetchProductList()
    ElMessage.success('数据已刷新')
  }

  // 提交成功
  const handleSubmitSuccess = () => {
    dialogVisible.value = false
    fetchProductList()
  }

  onMounted(() => {
    fetchProductList()
  })

  return {
    loading,
    dialogVisible,
    dialogTitle,
    currentProductId,
    productList,
    currentPage,
    pageSize,
    total,
    searchText,
    fetchProductList,
    handleSearchInput,
    getImageUrl,
    formatTime,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleStatusChange,
    handleSizeChange,
    handleCurrentChange,
    handleRefresh,
    handleSubmitSuccess
  }
}
