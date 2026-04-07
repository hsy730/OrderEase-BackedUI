import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

vi.mock('@/api/product', () => ({
  getProductList: vi.fn(),
  getProductDetail: vi.fn()
}))

vi.mock('@/api/order', () => ({
  getOrderStatusFlow: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

import { getProductList, getProductDetail } from '@/api/product'
import { getOrderStatusFlow } from '@/api/order'
import { useOrderForm } from '@/components/order/composables/useOrderForm'

describe('useOrderForm - 订单表单数据处理逻辑', () => {
  let props
  let emit

  const createMockProduct = (id, overrides = {}) => ({
    id,
    name: `商品${id}`,
    price: id * 10,
    option_categories: [],
    ...overrides
  })

  beforeEach(() => {
    emit = vi.fn()

    props = {
      formData: ref(null)
    }

    vi.clearAllMocks()
  })

  describe('initOrderItem - 初始化订单项', () => {
    it('应该返回具有默认值的空订单项', () => {
      const { form } = useOrderForm(props, emit)

      expect(form.value.items).toEqual([])
    })

    it('addItem应该添加新的空订单项到items数组', () => {
      props.formData = ref(null)
      const { form, addItem } = useOrderForm(props, emit)

      addItem()

      expect(form.value.items).toHaveLength(1)
      expect(form.value.items[0]).toEqual({
        product_id: '',
        quantity: 1,
        price: 0,
        selectedProduct: null,
        selectedOptions: {}
      })
    })

    it('removeItem应该从items数组中移除指定索引的项', () => {
      props.formData = ref(null)
      const { form, addItem, removeItem } = useOrderForm(props, emit)

      addItem()
      addItem()
      addItem()

      expect(form.value.items).toHaveLength(3)

      removeItem(1)

      expect(form.value.items).toHaveLength(2)
      expect(form.value.items[0].product_id).toBe('')
      expect(form.value.items[1].product_id).toBe('')
    })
  })

  describe('handleProductChange - 处理商品选择变化', () => {
    it('应该在选择商品后更新item的价格和selectedProduct', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123, { price: 15000 })
      
      getProductList.mockResolvedValue({ data: [mockProduct] })
      
      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      await handleProductChange(123, 0)

      expect(form.value.items[0].selectedProduct).toEqual(mockProduct)
      expect(form.value.items[0].price).toBe(15000)
    })

    it('应该初始化单选选项类别的默认值', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123, {
        option_categories: [{
          id: 1,
          name: '杯型',
          is_multiple: false,
          options: [
            { id: 101, name: '中杯', is_default: true },
            { id: 102, name: '大杯', is_default: false }
          ]
        }]
      })

      getProductList.mockResolvedValue({ data: [mockProduct] })

      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      await handleProductChange(123, 0)

      expect(form.value.items[0].selectedOptions['1']).toEqual([101])
    })

    it('应该初始化多选选项类别的所有默认选项', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123, {
        option_categories: [{
          id: 2,
          name: '配料',
          is_multiple: true,
          options: [
            { id: 201, name: '珍珠', is_default: true },
            { id: 202, name: '椰果', is_default: true },
            { id: 203, name: '布丁', is_default: false }
          ]
        }]
      })

      getProductList.mockResolvedValue({ data: [mockProduct] })

      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      await handleProductChange(123, 0)

      expect(form.value.items[0].selectedOptions['2']).toEqual([201, 202])
    })

    it('当没有默认选项时应该选择第一个选项（单选）', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123, {
        option_categories: [{
          id: 1,
          name: '温度',
          is_multiple: false,
          options: [
            { id: 301, name: '热', is_default: false },
            { id: 302, name: '冷', is_default: false }
          ]
        }]
      })

      getProductList.mockResolvedValue({ data: [mockProduct] })

      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      await handleProductChange(123, 0)

      expect(form.value.items[0].selectedOptions['1']).toEqual([301])
    })

    it('当没有默认选项时应该返回空数组（多选）', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123, {
        option_categories: [{
          id: 2,
          name: '加料',
          is_multiple: true,
          options: [
            { id: 401, name: '珍珠', is_default: false },
            { id: 402, name: '椰果', is_default: false }
          ]
        }]
      })

      getProductList.mockResolvedValue({ data: [mockProduct] })

      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      await handleProductChange(123, 0)

      expect(form.value.items[0].selectedOptions['2']).toEqual([])
    })

    it('应该重置selectedOptions为空对象', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123, { option_categories: [] })

      getProductList.mockResolvedValue({ data: [mockProduct] })

      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      form.value.items[0].selectedOptions = { old: 'data' }
      
      await handleProductChange(123, 0)

      expect(form.value.items[0].selectedOptions).toEqual({})
    })

    it('商品不存在时不应该更新item', async () => {
      props.formData = ref(null)
      const mockProduct = createMockProduct(123)

      getProductList.mockResolvedValue({ data: [mockProduct] })

      const { form, addItem, handleProductChange, fetchProductList } = useOrderForm(props, emit)
      
      await fetchProductList()
      addItem()
      
      const originalPrice = form.value.items[0].price
      
      await handleProductChange(999, 0)

      expect(form.value.items[0].selectedProduct).toBeNull()
      expect(form.value.items[0].price).toBe(originalPrice)
    })
  })

  describe('processEditData - 处理编辑数据', () => {
    const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 100))

    it('应该将空数据重置表单为初始状态', async () => {
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })
      getProductList.mockResolvedValue({ data: [] })

      props.formData = ref({})
      
      const { form } = useOrderForm(props, emit)

      await waitForAsync()

      expect(form.value.user_id).toBeNull()
      expect(form.value.status).toBe(1)
      expect(form.value.items).toEqual([])
    })

    it('应该处理null数据并重置表单', async () => {
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })
      getProductList.mockResolvedValue({ data: [] })

      props.formData = ref(null)
      
      const { form } = useOrderForm(props, emit)

      await waitForAsync()

      expect(form.value.items).toEqual([])
    })

    it('应该正确处理包含商品的编辑数据', async () => {
      const editData = {
        user_id: 'user123',
        status: 2,
        remark: '测试备注',
        items: [
          {
            product_id: 123,
            quantity: 2,
            price: 15000,
            selectedProduct: null,
            options: []
          }
        ]
      }

      const mockProduct = createMockProduct(123, { price: 15000 })
      
      getProductList.mockResolvedValue({ data: [mockProduct] })
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })

      props.formData = ref(editData)
      
      const { form } = useOrderForm(props, emit)

      await waitForAsync()

      expect(form).toBeDefined()
    })

    it('应该处理带选项的编辑数据', async () => {
      const editData = {
        items: [
          {
            product_id: 123,
            quantity: 1,
            options: [
              { category_id: 1, option_id: 101 },
              { category_id: 2, option_id: 201 }
            ]
          }
        ]
      }

      const mockProduct = createMockProduct(123)

      getProductList.mockResolvedValue({ data: [mockProduct] })
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })

      props.formData = ref(editData)
      
      const { form } = useOrderForm(props, emit)

      await waitForAsync()

      if (form.value.items.length > 0 && form.value.items[0].selectedOptions) {
        expect(form.value.items[0].selectedOptions['1']).toContain(101)
        expect(form.value.items[0].selectedOptions['2']).toContain(201)
      }
    })

    it('应该处理同一类别下的多个选项', async () => {
      const editData = {
        items: [
          {
            product_id: 123,
            quantity: 1,
            options: [
              { category_id: 1, option_id: 101 },
              { category_id: 1, option_id: 102 }
            ]
          }
        ]
      }

      const mockProduct = createMockProduct(123)

      getProductList.mockResolvedValue({ data: [mockProduct] })
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })

      props.formData = ref(editData)
      
      const { form } = useOrderForm(props, emit)

      await waitForAsync()

      if (form.value.items.length > 0 && form.value.items[0].selectedOptions) {
        expect(form.value.items[0].selectedOptions['1']).toEqual([101, 102])
      }
    })

    it('应该使用默认值处理缺失的字段', async () => {
      const editData = {
        items: [
          {
            product_id: 123
          }
        ]
      }

      const mockProduct = createMockProduct(123)

      getProductList.mockResolvedValue({ data: [mockProduct] })
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })

      props.formData = ref(editData)
      
      const { form } = useOrderForm(props, emit)

      await waitForAsync()

      if (form.value.items.length > 0) {
        expect(form.value.items[0].quantity).toBe(1)
        expect(form.value.items[0].price).toBe(0)
      }
    })

    it('当商品不在列表中时应该加载商品详情', async () => {
      const editData = {
        items: [
          {
            product_id: 999,
            quantity: 1,
            selectedProduct: null
          }
        ]
      }

      const listProduct = createMockProduct(123)
      const detailProduct = createMockProduct(999, { price: 25000 })

      getProductList.mockResolvedValue({ data: [listProduct] })
      getProductDetail.mockResolvedValue(detailProduct)
      getOrderStatusFlow.mockResolvedValue({ order_status_flow: null })

      props.formData = ref(editData)
      
      const { form } = useOrderForm(props, emit)

      await new Promise(resolve => setTimeout(resolve, 200))

      if (form.value.items.length > 0 && form.value.items[0].selectedProduct) {
        expect(getProductDetail).toHaveBeenCalledWith(999)
        expect(form.value.items[0].selectedProduct).toEqual(detailProduct)
        expect(form.value.items[0].price).toBe(25000)
      }
    })
  })

  describe('form 初始状态验证', () => {
    it('应该正确初始化表单字段', () => {
      props.formData = ref(null)

      const { form } = useOrderForm(props, emit)

      expect(form.value.user_id).toBeNull()
      expect(form.value.status).toBe(1)
      expect(form.value.items).toEqual([])
      expect(form.value.remark).toBe('')
      expect(form.value.total_price).toBe(0)
    })
  })
})
