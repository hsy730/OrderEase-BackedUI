import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'admin'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref(null)
  const token = ref('')

  // Getters
  const isLoggedIn = computed(() => !!userInfo.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const isShopOwner = computed(() => userInfo.value?.role === 'shopOwner')
  const userRole = computed(() => userInfo.value?.role || '')
  const userName = computed(() => userInfo.value?.username || '')
  const shopId = computed(() => userInfo.value?.shop_id || null)

  // Actions
  function initUserInfo() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        userInfo.value = JSON.parse(stored)
        token.value = userInfo.value?.token || ''
      } catch (e) {
        console.error('Failed to parse user info:', e)
        userInfo.value = null
      }
    }
  }

  function setUserInfo(info) {
    userInfo.value = info
    token.value = info?.token || ''
    if (info) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function setToken(newToken) {
    token.value = newToken
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, token: newToken }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo.value))
      } catch (error) {
        console.error('Failed to save user info:', error)
      }
    }
  }

  function clearUserInfo() {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('currentShopId')
  }

  function updateUserInfo(partialInfo) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...partialInfo }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo.value))
    }
  }

  // Initialize on store creation
  initUserInfo()

  return {
    // State
    userInfo,
    token,
    // Getters
    isLoggedIn,
    isAdmin,
    isShopOwner,
    userRole,
    userName,
    shopId,
    // Actions
    setUserInfo,
    setToken,
    clearUserInfo,
    updateUserInfo,
    initUserInfo
  }
})
