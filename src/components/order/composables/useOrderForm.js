import { ref, watch } from 'vue'
import { getProductList, getProductDetail } from '@/api/product'
import { getOrderStatusFlow } from '@/api/order'
import { ElMessage } from 'element-plus'

export function useOrderForm(props, emit) {
  const formRef = ref(null)
  const productList = ref([])
  const searchProductList = ref([])
  const orderStatusFlow = ref(null)
  const productLoading = ref({})

  const form = ref({
    user_id: null,
    status: 1,
    items: [],
    remark: '',
    total_price: 0
  })

  // 初始化商品项
  const initOrderItem = () => ({
    product_id: '',
    quantity: 1,
    price: 0,
    selectedProduct: null,
    selectedOptions: {}
  })

  // 添加商品项
  const addItem = () => {
    form.value.items.push(initOrderItem())
  }

  // 移除商品项
  const removeItem = (index) => {
    form.value.items.splice(index, 1)
  }

  // 获取商品列表
  const fetchProductList = async () => {
    try {
      const response = await getProductList({ page: 1, pageSize: 100 })
      productList.value = response.data || []
      searchProductList.value = [...productList.value]
    } catch (error) {
      console.error('获取商品列表失败:', error)
      ElMessage.error('获取商品列表失败')
      productList.value = []
    }
  }

  // 获取订单状态流转配置
  const fetchOrderStatusFlow = async () => {
    try {
      const data = await getOrderStatusFlow(null)
      orderStatusFlow.value = data.order_status_flow
    } catch (error) {
      console.error('获取订单状态流转配置失败:', error)
    }
  }

  // 远程搜索商品
  const remoteSearchProduct = async (query, index) => {
    productLoading.value[index] = true
    try {
      if (query.trim() === '') {
        productList.value = [...searchProductList.value]
      } else {
        const response = await getProductList({ page: 1, pageSize: 20, search: query })
        productList.value = response.data || []
      }
    } catch (error) {
      console.error('搜索商品失败:', error)
      ElMessage.error('搜索商品失败')
    } finally {
      productLoading.value[index] = false
    }
  }

  // 处理商品选择变化
  const handleProductChange = async (productId, index) => {
    const product = productList.value.find(p => p.id === productId)
    if (!product) return

    const item = form.value.items[index]
    item.selectedProduct = product
    item.price = product.price
    item.selectedOptions = {}

    // 初始化选项默认值
    if (product.option_categories?.length > 0) {
      product.option_categories.forEach(category => {
        const defaultOptions = category.options.filter(option => option.is_default)

        if (category.is_multiple) {
          item.selectedOptions[category.id] = defaultOptions.map(option => option.id)
        } else {
          const firstOption = defaultOptions[0] || category.options[0]
          item.selectedOptions[category.id] = firstOption ? [firstOption.id] : []
        }
      })
    }
  }

  // 处理编辑数据
  const processEditData = async (newVal) => {
    if (!newVal || Object.keys(newVal).length === 0) {
      form.value = { user_id: null, status: 1, items: [], remark: '', total_price: 0 }
      return
    }

    if (productList.value.length === 0) await fetchProductList()
    if (!orderStatusFlow.value) await fetchOrderStatusFlow()

    const processedItems = await Promise.all(
      (newVal.items || []).map(async (item) => {
        const orderItem = initOrderItem()
        orderItem.product_id = item.product_id
        orderItem.quantity = item.quantity || 1
        orderItem.price = item.price || 0
        orderItem.selectedProduct = item.selectedProduct || null

        // 加载商品详情
        if (item.product_id && !item.selectedProduct) {
          let product = productList.value.find(p => p.id === item.product_id)
          if (!product) {
            try {
              product = await getProductDetail(item.product_id)
              if (product && !productList.value.find(p => p.id === product.id)) {
                productList.value.push(product)
              }
            } catch (error) {
              console.error(`获取商品 ${item.product_id} 详情失败:`, error)
            }
          }
          if (product) {
            orderItem.selectedProduct = product
            orderItem.price = product.price
          }
        }

        // 处理选项
        if (item.options?.length > 0) {
          item.options.forEach(option => {
            if (!orderItem.selectedOptions[option.category_id]) {
              orderItem.selectedOptions[option.category_id] = []
            }
            orderItem.selectedOptions[option.category_id].push(option.option_id)
          })
        }

        return orderItem
      })
    )

    form.value = {
      ...newVal,
      user_id: newVal.user_id || null,
      status: newVal.status || 1,
      items: processedItems
    }
  }

  // 监听编辑数据
  watch(() => props.formData, processEditData, { deep: true, immediate: true })

  return {
    formRef,
    form,
    productList,
    orderStatusFlow,
    productLoading,
    addItem,
    removeItem,
    fetchProductList,
    fetchOrderStatusFlow,
    remoteSearchProduct,
    handleProductChange
  }
}
