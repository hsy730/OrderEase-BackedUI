import { computed } from 'vue'

export function usePriceCalc(form) {
  // 计算单项商品价格（包含选项价格调整）
  const calculateItemPrice = (item) => {
    let price = item.price || 0

    if (item.selectedProduct?.option_categories && item.selectedOptions) {
      item.selectedProduct.option_categories.forEach(category => {
        const selectedOptionIds = item.selectedOptions[category.id]

        if (Array.isArray(selectedOptionIds)) {
          selectedOptionIds.forEach(optionId => {
            const option = category.options.find(opt => opt.id === optionId)
            if (option) {
              price += option.price_adjustment || 0
            }
          })
        }
      })
    }

    return price
  }

  // 计算订单总金额
  const totalAmount = computed(() => {
    return form.value.items.reduce((total, item) => {
      return total + (calculateItemPrice(item) * (item.quantity || 0))
    }, 0).toFixed(2)
  })

  // 计算并更新表单总价
  const calculateTotal = () => {
    form.value.total_price = parseFloat(totalAmount.value)
  }

  // 获取单项小计金额
  const getItemSubtotal = (item) => {
    return (calculateItemPrice(item) * (item.quantity || 0)).toFixed(2)
  }

  // 获取单项单价（含选项）
  const getItemUnitPrice = (item) => {
    return calculateItemPrice(item).toFixed(2)
  }

  return {
    totalAmount,
    calculateTotal,
    calculateItemPrice,
    getItemSubtotal,
    getItemUnitPrice
  }
}
