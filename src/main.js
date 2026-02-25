import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 只导入实际使用的图标
import {
  // App.vue
  ShoppingCart,

  // SmartImage.vue
  WarningFilled,

  // Sidebar.vue
  Document,
  Goods,
  Fold,
  Upload,
  Collection,
  User,
  Shop,
  DataBoard,

  // Navbar.vue
  Bell,
  ArrowDown,
  UserFilled,
  Lock,
  SwitchButton,

  // ShopDetail.vue
  CopyDocument,

  // login/index.vue
  Picture,
  DataAnalysis,
  InfoFilled,
  Refresh,

  // dashboard/index.vue
  Money,
  TrendCharts,
  Timer,
  Odometer,
  CircleCheck,

  // DataTable.vue
  DocumentDelete,

  // OrderForm.vue
  EditPen,

  // OptionCategories.vue
  Plus,
  Close,
  DocumentAdd,
  Menu,
  Delete,
  Rank,

  // ProductForm.vue
  Edit,
  Operation
} from '@element-plus/icons-vue'

import './styles/theme.css'
import './assets/main.css'

const app = createApp(App)

// 注册实际使用的 Element Plus 图标
const icons = [
  ShoppingCart,
  WarningFilled,
  Document,
  Goods,
  Fold,
  Upload,
  Collection,
  User,
  Shop,
  DataBoard,
  Bell,
  ArrowDown,
  UserFilled,
  Lock,
  SwitchButton,
  CopyDocument,
  Picture,
  DataAnalysis,
  TrendCharts,
  InfoFilled,
  Refresh,
  Money,
  Timer,
  Odometer,
  CircleCheck,
  DocumentDelete,
  EditPen,
  Plus,
  Close,
  DocumentAdd,
  Menu,
  Delete,
  Rank,
  Edit,
  Operation
]

icons.forEach(icon => {
  if (icon) {
    app.component(icon.name, icon)
  }
})

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
