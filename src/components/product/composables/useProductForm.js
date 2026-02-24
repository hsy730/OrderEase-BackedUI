import { ref, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, uploadProductImage, getProductDetail } from '@/api/product'
import Sortable from 'sortablejs'

export function useProductForm(props, emit) {
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

  // 获取商品详情
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

      initAllSortable()
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
      display_order: form.value.option_categories.length,
      options: [{ _key: Date.now() + '_new', name: '', price_adjustment: 0, display_order: 0, is_default: false }]
    })
    const newIndex = form.value.option_categories.length - 1
    nextTick(() => {
      initSortable(newIndex)
    })
  }

  // 删除选项类别
  const removeCategory = (index) => {
    form.value.option_categories.splice(index, 1)
  }

  // 添加选项
  const addOption = (categoryIndex) => {
    form.value.option_categories[categoryIndex].options.push({
      _key: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: '',
      price_adjustment: 0,
      display_order: form.value.option_categories[categoryIndex].options.length,
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

  // 处理默认选项变化（单选场景下互斥）
  const handleDefaultChange = (categoryIndex, optionIndex, isDefault) => {
    const category = form.value.option_categories[categoryIndex]
    if (!category.is_multiple && isDefault) {
      category.options.forEach((option, idx) => {
        if (idx !== optionIndex) {
          option.is_default = false
        }
      })
    }
  }

  // 处理多选切换
  const handleMultipleChange = (categoryIndex, isMultiple) => {
    const category = form.value.option_categories[categoryIndex]
    if (!isMultiple) {
      const defaultOptions = category.options.filter(option => option.is_default)
      if (defaultOptions.length > 1) {
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

  // 处理图片上传
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

  // 获取图片URL
  const getImageUrl = (path) => {
    return path ? `/admin/product/image?path=${path}` : ''
  }

  // 提交表单
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
      } else {
        await createProduct(submitData)
      }
      emit('submit')
    } catch (error) {
      console.error('保存商品失败:', error)
      throw error
    }
  }

  // 重置表单
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

  // 监听 productId 变化
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

  return {
    formRef,
    form,
    setOptionsRef,
    addCategory,
    removeCategory,
    addOption,
    removeOption,
    handleDefaultChange,
    handleMultipleChange,
    handleUpload,
    getImageUrl,
    submit,
    reset
  }
}
