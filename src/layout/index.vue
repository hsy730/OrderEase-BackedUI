<template>
  <div class="app-layout">
    <Sidebar
      :is-collapse="isCollapse"
      :is-admin="isAdmin"
      :current-shop="currentShop"
      @toggle="toggleSidebar"
    />

    <div class="main-content">
      <Navbar
        :is-admin="isAdmin"
        :user-info="userInfo"
        :shop-list="shopList"
        :current-shop="currentShop"
        :shop-id="shopId"
        :search-loading="searchLoading"
        :unread-count="unreadCount"
        @shop-search="handleShopSearch"
        @shop-change="handleShopChange"
        @show-notifications="showNotificationPanel"
        @change-password="showPasswordDialog = true"
        @logout="handleLogout"
      />

      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive :include="['Migration']">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>

    <PasswordDialog v-model="showPasswordDialog" @success="handlePasswordChanged" />

    <NotificationDrawer v-model="notificationDrawer" :notifications="notifications" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '@/api/auth'
import { getShopList, getCurrentShopId, getShopDetail } from '@/api/shop'
import { debounce } from 'lodash-es'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import PasswordDialog from './components/PasswordDialog.vue'
import NotificationDrawer from './components/NotificationDrawer.vue'

const router = useRouter()

// 状态
const isCollapse = ref(false)
const isAdmin = ref(JSON.parse(localStorage.getItem('admin') || '{}').role === 'admin')
const userInfo = ref(JSON.parse(localStorage.getItem('admin') || '{}'))
const shopList = ref([])
const shopId = ref(null)
const searchLoading = ref(false)
const currentShop = ref({})
const unreadCount = ref(0)
const notificationDrawer = ref(false)
const notifications = ref([])
const showPasswordDialog = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 店铺搜索
const handleShopSearch = debounce(async (query) => {
  try {
    searchLoading.value = true
    const { data } = await getShopList({
      page: 1,
      page_size: 50,
      search: query
    })
    shopList.value = data
  } catch (error) {
    console.error('搜索店铺失败:', error)
  } finally {
    searchLoading.value = false
  }
}, 500)

// 店铺切换
const handleShopChange = async (shopId) => {
  let refresh = false
  if (localStorage.getItem('currentShopId')) {
    refresh = true
  }
  localStorage.setItem('currentShopId', shopId)
  ElMessage.success('店铺切换成功')
  if (refresh) {
    router.go(0)
  }
}

// 显示通知面板
const showNotificationPanel = () => {
  notificationDrawer.value = true
}

// 登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await logout()
    localStorage.removeItem('admin')
    router.push('/login')
    ElMessage.success('退出成功')
  } catch (error) {
    if (error === 'cancel') return
    console.error('退出失败:', error)
  }
}

// 密码修改成功
const handlePasswordChanged = () => {
  localStorage.removeItem('admin')
  router.push('/login')
}

// 初始化
onMounted(async () => {
  if (isAdmin.value) {
    try {
      const { data } = await getShopList({ page: 1, page_size: 50 })
      shopList.value = data
      const curShopId = getCurrentShopId()
      if (curShopId) {
        shopId.value = curShopId
      } else {
        shopId.value = data[0]?.id || null
        localStorage.setItem('currentShopId', shopId.value)
      }
    } catch (error) {
      console.error('获取店铺列表失败:', error)
    }
  } else {
    const curShopId = getCurrentShopId()
    if (curShopId) {
      try {
        const result = await getShopDetail(curShopId)
        currentShop.value = result || {}
      } catch (error) {
        console.error('获取当前店铺信息失败:', error)
      }
    }
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-secondary);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-base);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
