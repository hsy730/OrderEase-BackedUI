import { describe, it, expect } from 'vitest'
import { usePriceCalc } from '@/components/order/composables/usePriceCalc'
import { ref } from 'vue'

describe('usePriceCalc - 价格计算逻辑', () => {
  const createForm = (items = []) => ref({
    items,
    total_price: 0
  })

  describe('calculateItemPrice - 计算单项商品价格（含选项价格调整）', () => {
    it('应该正确计算无选项商品的基础价格', () => {
      const form = createForm([{ price: 100, quantity: 2 }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(100)
    })

    it('应该正确处理价格为0的商品', () => {
      const form = createForm([{ price: 0, quantity: 1 }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(0)
    })

    it('应该正确计算带选项加价的商品价格', () => {
      const form = createForm([{
        price: 100,
        quantity: 1,
        selectedProduct: {
          option_categories: [{
            id: 1,
            options: [
              { id: 101, name: '大杯', price_adjustment: 10 },
              { id: 102, name: '加冰', price_adjustment: 5 }
            ]
          }]
        },
        selectedOptions: {
          '1': [101, 102]
        }
      }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(115) // 100 + 10 + 5
    })

    it('应该正确计算带选项折扣的商品价格', () => {
      const form = createForm([{
        price: 100,
        quantity: 1,
        selectedProduct: {
          option_categories: [{
            id: 1,
            options: [
              { id: 101, name: '优惠', price_adjustment: -20 }
            ]
          }]
        },
        selectedOptions: {
          '1': [101]
        }
      }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(80) // 100 - 20
    })

    it('应该正确计算多个选项类别的商品价格', () => {
      const form = createForm([{
        price: 50,
        quantity: 1,
        selectedProduct: {
          option_categories: [
            {
              id: 1,
              options: [{ id: 101, name: '大杯', price_adjustment: 10 }]
            },
            {
              id: 2,
              options: [
                { id: 201, name: '全糖', price_adjustment: 0 },
                { id: 202, name: '半糖', price_adjustment: 0 }
              ]
            }
          ]
        },
        selectedOptions: {
          '1': [101],
          '2': [202]
        }
      }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(60) // 50 + 10 + 0
    })

    it('应该处理selectedProduct为空的情况', () => {
      const form = createForm([{
        price: 100,
        quantity: 1,
        selectedProduct: null,
        selectedOptions: {}
      }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(100)
    })

    it('应该处理option_categories为空数组的情况', () => {
      const form = createForm([{
        price: 100,
        quantity: 1,
        selectedProduct: { option_categories: [] },
        selectedOptions: {}
      }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(100)
    })

    it('应该处理selectedOptions为空对象的情况', () => {
      const form = createForm([{
        price: 100,
        quantity: 1,
        selectedProduct: {
          option_categories: [{
            id: 1,
            options: [{ id: 101, name: '大杯', price_adjustment: 10 }]
          }]
        },
        selectedOptions: {}
      }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(100)
    })

    it('应该处理price属性缺失时使用默认值0', () => {
      const form = createForm([{ quantity: 1 }])
      const { calculateItemPrice } = usePriceCalc(form)

      const itemPrice = calculateItemPrice(form.value.items[0])

      expect(itemPrice).toBe(0)
    })
  })

  describe('totalAmount - 计算订单总金额', () => {
    it('应该正确计算空订单的总金额为0', () => {
      const form = createForm([])
      const { totalAmount } = usePriceCalc(form)

      expect(totalAmount.value).toBe('0.00')
    })

    it('应该正确计算单个商品的总金额', () => {
      const form = createForm([{ price: 100, quantity: 2 }])
      const { totalAmount } = usePriceCalc(form)

      expect(totalAmount.value).toBe('200.00') // 100 * 2
    })

    it('应该正确计算多个商品的总金额', () => {
      const form = createForm([
        { price: 100, quantity: 2 },
        { price: 50, quantity: 3 }
      ])
      const { totalAmount } = usePriceCalc(form)

      expect(totalAmount.value).toBe('350.00') // 100*2 + 50*3
    })

    it('应该包含选项价格调整在总金额中', () => {
      const form = createForm([
        {
          price: 100,
          quantity: 2,
          selectedProduct: {
            option_categories: [{
              id: 1,
              options: [{ id: 101, name: '大杯', price_adjustment: 10 }]
            }]
          },
          selectedOptions: { '1': [101] }
        }
      ])
      const { totalAmount } = usePriceCalc(form)

      expect(totalAmount.value).toBe('220.00') // (100+10) * 2
    })

    it('应该处理数量为0的商品', () => {
      const form = createForm([
        { price: 100, quantity: 0 }
      ])
      const { totalAmount } = usePriceCalc(form)

      expect(totalAmount.value).toBe('0.00')
    })
  })

  describe('getItemSubtotal - 获取单项小计金额', () => {
    it('应该正确计算单项小计（单价 × 数量）', () => {
      const form = createForm([{ price: 100, quantity: 3 }])
      const { getItemSubtotal } = usePriceCalc(form)

      const subtotal = getItemSubtotal(form.value.items[0])

      expect(subtotal).toBe('300.00')
    })

    it('应该包含选项价格在小计中', () => {
      const form = createForm([{
        price: 50,
        quantity: 2,
        selectedProduct: {
          option_categories: [{
            id: 1,
            options: [
              { id: 101, name: 'A', price_adjustment: 10 },
              { id: 102, name: 'B', price_adjustment: 5 }
            ]
          }]
        },
        selectedOptions: { '1': [101, 102] }
      }])
      const { getItemSubtotal } = usePriceCalc(form)

      const subtotal = getItemSubtotal(form.value.items[0])

      expect(subtotal).toBe('130.00') // (50+10+5) * 2
    })
  })

  describe('getItemUnitPrice - 获取单项单价（含选项）', () => {
    it('应该返回不含选项的基础单价', () => {
      const form = createForm([{ price: 100, quantity: 1 }])
      const { getItemUnitPrice } = usePriceCalc(form)

      const unitPrice = getItemUnitPrice(form.value.items[0])

      expect(unitPrice).toBe('100.00')
    })

    it('应该返回包含选项调整后的单价', () => {
      const form = createForm([{
        price: 80,
        quantity: 1,
        selectedProduct: {
          option_categories: [{
            id: 1,
            options: [{ id: 101, name: '升级', price_adjustment: 20 }]
          }]
        },
        selectedOptions: { '1': [101] }
      }])
      const { getItemUnitPrice } = usePriceCalc(form)

      const unitPrice = getItemUnitPrice(form.value.items[0])

      expect(unitPrice).toBe('100.00') // 80 + 20
    })
  })

  describe('calculateTotal - 计算并更新表单总价', () => {
    it('应该更新form的total_price字段', () => {
      const form = createForm([
        { price: 100, quantity: 1 },
        { price: 50, quantity: 1 }
      ])
      const { calculateTotal } = usePriceCalc(form)

      calculateTotal()

      expect(form.value.total_price).toBe(150)
    })

    it('应该将字符串转换为数字类型', () => {
      const form = createForm([{ price: 99.9, quantity: 1 }])
      const { calculateTotal } = usePriceCalc(form)

      calculateTotal()

      expect(typeof form.value.total_price).toBe('number')
      expect(form.value.total_price).toBeCloseTo(99.9, 1)
    })
  })
})
