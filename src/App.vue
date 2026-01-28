<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Delete, FolderOpened, DocumentAdd, Promotion, Box, Refresh, EditPen, Brush, Star, MagicStick, Moon, Sunrise } from '@element-plus/icons-vue'

// UI 主題風格
type UITheme = 'default' | 'cyberpunk' | 'minimal' | 'cute'
const currentUITheme = ref<UITheme>('default')
const showThemePicker = ref(false)

const uiThemes = [
  { id: 'default' as UITheme, name: '經典風格', color: '#fbbf24' },
  { id: 'cyberpunk' as UITheme, name: '賽博龐克', color: '#06b6d4' },
  { id: 'minimal' as UITheme, name: '簡約風格', color: '#94a3b8' },
  { id: 'cute' as UITheme, name: '可愛風格', color: '#f472b6' },
]

// 主題圖標映射
const themeIcons = {
  default: Star,
  cyberpunk: MagicStick,
  minimal: Moon,
  cute: Sunrise,
}

// 頁面狀態
type PageState = 'input' | 'machine' | 'result'
const currentPage = ref<PageState>('input')

// 輸入的選項
const inputText = ref('')
const options = computed(() => {
  return inputText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
})
const optionCount = computed(() => options.value.length)

// ===== 存檔功能 =====
interface SavedPreset {
  id: string
  name: string
  options: string
  createdAt: number
}

const STORAGE_KEY = 'gacha-presets'
const savedPresets = ref<SavedPreset[]>([])
const showSaveDialog = ref(false)
const showLoadDialog = ref(false)
const newPresetName = ref('')
const presetToDelete = ref<string | null>(null)

// 載入已儲存的存檔
function loadPresetsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      savedPresets.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load presets:', e)
    savedPresets.value = []
  }
}

// 儲存存檔到 localStorage
function savePresetsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPresets.value))
  } catch (e) {
    console.error('Failed to save presets:', e)
  }
}

// 新增存檔
function savePreset() {
  if (!newPresetName.value.trim() || optionCount.value < 1) return

  const preset: SavedPreset = {
    id: Date.now().toString(),
    name: newPresetName.value.trim(),
    options: inputText.value,
    createdAt: Date.now()
  }

  savedPresets.value.unshift(preset)
  savePresetsToStorage()
  newPresetName.value = ''
  showSaveDialog.value = false
}

// 載入存檔
function loadPreset(preset: SavedPreset) {
  inputText.value = preset.options
  showLoadDialog.value = false
}

// 刪除存檔
function deletePreset(id: string) {
  savedPresets.value = savedPresets.value.filter(p => p.id !== id)
  savePresetsToStorage()
  presetToDelete.value = null
}

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化時載入存檔
onMounted(() => {
  loadPresetsFromStorage()
})

// 動畫狀態
const isPulling = ref(false)  // 拉桿動畫
const isShaking = ref(false)  // 機身震動
const isDropping = ref(false)
const showResult = ref(false)

// 抽選結果
const selectedResult = ref('')
const selectedColor = ref('capsule-gradient')

// 扭蛋機樣式
type MachineStyle = 'classic' | 'neon' | 'candy' | 'retro'
const machineStyle = ref<MachineStyle>('classic')
const showStylePicker = ref(false)

const machineStyles = [
  { id: 'classic' as MachineStyle, name: '經典紅', icon: '🔴', desc: '傳統扭蛋機風格' },
  { id: 'neon' as MachineStyle, name: '霓虹藍', icon: '💙', desc: '未來科技感' },
  { id: 'candy' as MachineStyle, name: '糖果粉', icon: '🩷', desc: '甜美夢幻風' },
  { id: 'retro' as MachineStyle, name: '復古綠', icon: '💚', desc: '懷舊復古風' },
]

// 使用加密隨機數確保真正隨機（無規律）
function getSecureRandomIndex(max: number): number {
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return (array[0] ?? 0) % max
  }
  return Math.floor(Math.random() * max)
}

// 開始製作扭蛋機
function startMachine() {
  if (optionCount.value > 1) {
    currentPage.value = 'machine'
    resetAnimation()
  }
}

// 重置動畫狀態
function resetAnimation() {
  isPulling.value = false
  isShaking.value = false
  isDropping.value = false
  showResult.value = false
  selectedResult.value = ''
}

// 執行抽獎
function spin() {
  if (isPulling.value || isShaking.value || isDropping.value) return

  // 先設定顏色和結果，確保動畫開始時已就緒
  selectedColor.value = capsuleColors[getSecureRandomIndex(capsuleColors.length)] ?? 'capsule-gradient'
  const randomIndex = getSecureRandomIndex(options.value.length)
  selectedResult.value = options.value[randomIndex] ?? ''

  // Step 1: 開始拉桿動畫
  isPulling.value = true

  // Step 2: 拉桿拉到最底時（約 270ms = 45% of 600ms），機身開始震動
  setTimeout(() => {
    isShaking.value = true
  }, 270)

  // Step 3: 拉桿動畫結束（600ms），停止拉桿狀態
  setTimeout(() => {
    isPulling.value = false
  }, 600)

  // Step 4: 震動結束，開始掉落動畫
  setTimeout(() => {
    isShaking.value = false
    isDropping.value = true

    // Step 5: 顯示結果
    setTimeout(() => {
      showResult.value = true
      currentPage.value = 'result'
    }, 1200)
  }, 1000)
}

// 再抽一次
function spinAgain() {
  currentPage.value = 'machine'
  resetAnimation()
}

// 修改選項
function editOptions() {
  currentPage.value = 'input'
  resetAnimation()
}

// 選擇扭蛋機樣式
function selectStyle(style: MachineStyle) {
  machineStyle.value = style
  showStylePicker.value = false
}

// 扭蛋球顏色
const capsuleColors = [
  'capsule-gradient',
  'capsule-gradient-blue',
  'capsule-gradient-purple',
  'capsule-gradient-yellow',
  'capsule-gradient-green',
  'capsule-gradient-pink',
]

function getRandomColor(index: number) {
  return capsuleColors[index % capsuleColors.length]
}
</script>

<template>
  <div class="app-container min-h-screen text-white overflow-hidden dark">
    <!-- 深暖色背景 -->
    <div class="fixed inset-0 bg-[#0d0b0a]">
      <!-- 微妙的暖色光暈 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-900/15 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-orange-950/20 rounded-full blur-[100px]"></div>
      <!-- 噪點紋理 -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"></div>
    </div>

    <!-- 階段一：輸入介面 -->
    <div
      v-if="currentPage === 'input'"
      class="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 pt-12 pb-24"
      :class="`theme-${currentUITheme}`"
    >
      <!-- 主題切換按鈕 -->
      <el-popover
        :visible="showThemePicker"
        placement="top-start"
        :width="220"
        trigger="click"
        popper-class="theme-popover"
      >
        <template #reference>
          <el-button
            class="theme-toggle-btn fixed bottom-6 left-4 z-20"
            circle
            size="large"
            @click="showThemePicker = !showThemePicker"
          >
            <el-icon :size="20"><Brush /></el-icon>
          </el-button>
        </template>
        <div class="theme-picker-content">
          <p class="text-sm text-gray-400 mb-3 font-medium">選擇風格</p>
          <div class="space-y-2">
            <el-button
              v-for="theme in uiThemes"
              :key="theme.id"
              class="w-full theme-option-btn"
              :type="currentUITheme === theme.id ? 'primary' : 'default'"
              @click="currentUITheme = theme.id; showThemePicker = false"
            >
              <el-icon class="mr-2" :size="16"><component :is="themeIcons[theme.id]" /></el-icon>
              {{ theme.name }}
            </el-button>
          </div>
        </div>
      </el-popover>

      <!-- 主要內容區 - 置中 -->
      <div class="w-full max-w-md mx-auto">
        <!-- 標題區域 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-5 shadow-xl shadow-amber-600/20 overflow-hidden">
            <!-- 將你的圖片放在 public/icon.png，或修改下方路徑 -->
            <img src="/icon.png" class="w-12 h-12 object-contain" alt="扭蛋機" @error="(e: Event) => (e.target as HTMLImageElement).style.display='none'" />
          </div>
          <h1 class="text-4xl font-bold mb-3 title-text tracking-tight">幸運扭蛋機</h1>
          <p class="text-neutral-500 text-lg">輸入選項，讓命運決定</p>
        </div>

        <!-- 卡片內容區 -->
        <el-card class="main-card mb-6" shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-base font-medium text-neutral-300">選項列表</span>
              <el-tag
                size="large"
                :type="optionCount >= 2 ? 'success' : 'warning'"
                effect="dark"
                round
                class="option-count-tag"
              >
                {{ optionCount }} 個選項
              </el-tag>
            </div>
          </template>

          <!-- 輸入區域 -->
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="8"
            placeholder="每行輸入一個選項，例如：
今天吃什麼
看電影
打遊戲
睡覺
出門走走"
            class="custom-textarea-large"
            resize="none"
          />

          <!-- 提示訊息 -->
          <el-alert
            v-if="optionCount < 2"
            title="請至少輸入 2 個選項"
            type="warning"
            :closable="false"
            show-icon
            class="mt-4"
          />
        </el-card>

        <!-- 底部操作區 - 置中 -->
        <div class="space-y-4">
          <!-- 存檔操作列 -->
          <div class="flex justify-center gap-3">
            <el-button
              size="large"
              class="action-btn flex-1 max-w-[160px]"
              @click="showLoadDialog = true"
            >
              <el-icon class="mr-2" :size="18"><FolderOpened /></el-icon>
              載入
              <el-badge v-if="savedPresets.length > 0" :value="savedPresets.length" class="ml-1" type="warning" />
            </el-button>
            <el-button
              size="large"
              class="action-btn flex-1 max-w-[160px]"
              :disabled="optionCount < 1"
              @click="showSaveDialog = true"
            >
              <el-icon class="mr-2" :size="18"><DocumentAdd /></el-icon>
              儲存
            </el-button>
          </div>

          <!-- 開始按鈕 -->
          <el-button
            type="primary"
            size="large"
            class="w-full start-btn-large"
            :disabled="optionCount < 2"
            @click="startMachine"
          >
            <el-icon class="mr-2" :size="22"><Promotion /></el-icon>
            <span class="text-lg font-bold">開始抽獎</span>
          </el-button>
        </div>
      </div>

      <!-- 儲存對話框 -->
      <el-dialog
        v-model="showSaveDialog"
        title="儲存存檔"
        width="90%"
        :style="{ maxWidth: '400px' }"
        class="custom-dialog"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <el-icon><DocumentAdd /></el-icon>
            <span>儲存存檔</span>
          </div>
        </template>

        <el-form label-position="top">
          <el-form-item label="存檔名稱">
            <el-input
              v-model="newPresetName"
              placeholder="例如：午餐選擇、週末活動..."
              @keyup.enter="savePreset"
            />
          </el-form-item>

          <el-card shadow="never" class="preview-card">
            <template #header>
              <span class="text-sm">將儲存 {{ optionCount }} 個選項</span>
            </template>
            <p class="text-sm text-gray-400 truncate-3">
              {{ options.slice(0, 5).join('、') }}{{ options.length > 5 ? '...' : '' }}
            </p>
          </el-card>
        </el-form>

        <template #footer>
          <el-button @click="showSaveDialog = false">取消</el-button>
          <el-button type="primary" :disabled="!newPresetName.trim()" @click="savePreset">
            儲存
          </el-button>
        </template>
      </el-dialog>

      <!-- 載入對話框 -->
      <el-dialog
        v-model="showLoadDialog"
        title="載入存檔"
        width="90%"
        :style="{ maxWidth: '400px' }"
        class="custom-dialog"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <el-icon><FolderOpened /></el-icon>
            <span>載入存檔</span>
          </div>
        </template>

        <el-empty v-if="savedPresets.length === 0" description="尚無存檔，先儲存一些選項吧！">
          <template #image>
            <el-icon :size="60" color="#909399"><Box /></el-icon>
          </template>
        </el-empty>

        <div v-else class="preset-list">
          <el-card
            v-for="preset in savedPresets"
            :key="preset.id"
            shadow="hover"
            class="preset-card mb-3 cursor-pointer"
            @click="loadPreset(preset)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0 mr-2">
                <div class="font-medium truncate">{{ preset.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(preset.createdAt) }}</div>
              </div>
              <div class="flex items-center gap-2">
                <el-tag size="small" type="warning">
                  {{ preset.options.split('\n').filter(l => l.trim()).length }} 項
                </el-tag>
                <el-popconfirm
                  title="確定要刪除這個存檔嗎？"
                  confirm-button-text="刪除"
                  cancel-button-text="取消"
                  @confirm="deletePreset(preset.id)"
                >
                  <template #reference>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      size="small"
                      circle
                      @click.stop
                    />
                  </template>
                </el-popconfirm>
              </div>
            </div>
            <p class="text-sm text-gray-400 mt-2 truncate-2">
              {{ preset.options.split('\n').filter(l => l.trim()).slice(0, 4).join('、') }}
            </p>
          </el-card>
        </div>

        <template #footer>
          <el-button @click="showLoadDialog = false">關閉</el-button>
        </template>
      </el-dialog>
    </div>

    <!-- 階段二：扭蛋機介面 -->
    <div v-if="currentPage === 'machine'" class="h-screen flex flex-col items-center justify-center p-6 relative z-10">
      <!-- 可替換背景圖片 -->
      <div class="machine-bg absolute inset-0" :class="`machine-bg-${machineStyle}`"></div>

      <!-- 聚光燈效果 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
           :class="{
             'bg-yellow-400/20': machineStyle === 'classic',
             'bg-cyan-400/30': machineStyle === 'neon',
             'bg-pink-400/25': machineStyle === 'candy',
             'bg-emerald-400/20': machineStyle === 'retro'
           }"></div>

      <!-- 樣式選擇按鈕 -->
      <button
        @click="showStylePicker = !showStylePicker"
        class="absolute top-4 right-4 z-20 px-3 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-sm hover:bg-white/20 transition-colors"
      >
        🎨 換造型
      </button>

      <!-- 樣式選擇器 -->
      <div
        v-if="showStylePicker"
        class="absolute top-16 right-4 z-30 p-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
      >
        <p class="text-xs text-gray-400 mb-2 px-1">選擇扭蛋機樣式</p>
        <div class="flex flex-col gap-2">
          <button
            v-for="style in machineStyles"
            :key="style.id"
            @click="selectStyle(style.id)"
            class="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left"
            :class="machineStyle === style.id
              ? 'bg-white/20 border border-white/30'
              : 'hover:bg-white/10'"
          >
            <span class="text-xl">{{ style.icon }}</span>
            <div>
              <p class="text-sm font-medium">{{ style.name }}</p>
              <p class="text-xs text-gray-400">{{ style.desc }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- 扭蛋機主體 -->
      <div
        class="relative z-10"
        :class="{ 'animate-shake-intense': isShaking }"
      >
        <!-- 機器頂蓋 -->
        <div class="machine-top" :class="`machine-top-${machineStyle}`">
          <div class="absolute inset-x-4 top-2 h-2 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
        </div>

        <!-- 玻璃球體容器 -->
        <div class="glass-dome" :class="`glass-dome-${machineStyle}`">
          <!-- 內部漸層陰影 -->
          <div class="absolute inset-0 rounded-[12px_12px_0_0] shadow-inner-glass"></div>

          <!-- 扭蛋球們 -->
          <div class="absolute inset-4 flex flex-wrap justify-center items-center gap-2 content-center overflow-hidden">
            <div
              v-for="i in Math.min(optionCount, 20)"
              :key="i"
              class="capsule-ball animate-float-random"
              :class="getRandomColor(i)"
              :style="{
                animationDelay: `${i * 0.12}s`,
                transform: `rotate(${i * 18}deg)`
              }"
            ></div>
          </div>

          <!-- 玻璃高光 -->
          <div class="glass-highlight"></div>
          <div class="glass-highlight-2"></div>
        </div>

        <!-- 機器中段（金屬環） -->
        <div class="machine-ring" :class="`machine-ring-${machineStyle}`"></div>

        <!-- 機器身體 -->
        <div class="machine-body" :class="`machine-body-${machineStyle}`">
          <!-- 金屬質感裝飾 -->
          <div class="absolute top-3 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>

          <!-- 投幣口 -->
          <div class="coin-slot">
            <div class="coin-slot-inner"></div>
          </div>

          <!-- 品牌標籤 -->
          <div class="brand-label" :class="`brand-label-${machineStyle}`">
            <span class="text-[10px] font-bold tracking-wider">GACHA</span>
          </div>

          <!-- 出口 -->
          <div class="machine-outlet">
            <div class="outlet-inner"></div>
          </div>
        </div>

        <!-- 機器底座 -->
        <div class="machine-base" :class="`machine-base-${machineStyle}`">
          <div class="absolute inset-x-2 bottom-2 h-1 bg-black/30 rounded-full"></div>
        </div>

        <!-- 拉霸式拉桿（位於機身右側） -->
        <button
          @click="spin"
          :disabled="isPulling || isShaking || isDropping"
          class="slot-lever"
          :class="{ 'cursor-not-allowed': isPulling || isShaking || isDropping }"
        >
          <!-- 底座（固定不動） -->
          <div class="lever-base"></div>

          <!-- 連接桿（會縮短） -->
          <div
            class="lever-stick"
            :class="{ 'animate-stick-pull': isPulling }"
          ></div>

          <!-- 球頭（會下移並放大） -->
          <div
            class="lever-ball"
            :class="{ 'animate-ball-pull': isPulling }"
          >
            <div class="lever-ball-shine"></div>
          </div>
        </button>

        <!-- 底座陰影 -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-72 h-6 bg-black/40 rounded-[50%] blur-md"></div>

        <!-- 掉落的扭蛋（從出口誕生，直接飛向螢幕中央） -->
        <div
          v-if="isDropping"
          class="capsule-dropping"
          :class="selectedColor"
        >
          <div class="capsule-shine"></div>
        </div>
      </div>

      <!-- 提示文字 -->
      <p class="mt-12 text-lg animate-pulse flex items-center gap-2 relative z-10"
         :class="{
           'text-yellow-400/90': machineStyle === 'classic',
           'text-cyan-400/90': machineStyle === 'neon',
           'text-pink-400/90': machineStyle === 'candy',
           'text-emerald-400/90': machineStyle === 'retro'
         }">
        <span class="text-2xl">👇</span> 拉下拉桿開始抽獎！
      </p>

      <!-- 返回按鈕 -->
      <button
        @click="editOptions"
        class="mt-6 px-6 py-2 text-gray-500 hover:text-white transition-colors text-sm relative z-10"
      >
        ← 修改選項
      </button>
    </div>

    <!-- 階段三：結果介面 -->
    <div
      v-if="currentPage === 'result'"
      class="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 pt-12 pb-24"
      :class="`theme-${currentUITheme}`"
    >
      <!-- 背景裝飾 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="sparkle sparkle-1"></div>
        <div class="sparkle sparkle-2"></div>
        <div class="sparkle sparkle-3"></div>
        <div class="sparkle sparkle-4"></div>
        <div class="sparkle sparkle-5"></div>
        <div class="sparkle sparkle-6"></div>
      </div>

      <!-- 主要內容 - 完全置中 -->
      <div class="w-full max-w-md mx-auto text-center">
        <!-- 成功圖標 -->
        <div class="mb-8 animate-fade-in">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-xl shadow-orange-600/25 animate-pulse-slow">
            <svg class="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold result-title">恭喜你抽到了！</h2>
        </div>

        <!-- 結果卡片 -->
        <el-card class="result-card-large animate-result-pop mb-6" shadow="always">
          <div class="py-10 px-8">
            <p class="text-3xl md:text-4xl font-bold text-white break-words leading-relaxed">
              {{ selectedResult }}
            </p>
          </div>
        </el-card>

        <!-- 機率提示 -->
        <div class="mb-10">
          <el-tag size="large" type="info" effect="plain" class="probability-tag">
            每個選項機率：{{ (100 / optionCount).toFixed(1) }}%
          </el-tag>
        </div>

        <!-- 操作按鈕 - 置中對齊 -->
        <div class="flex justify-center gap-4">
          <el-button
            type="primary"
            size="large"
            class="result-action-btn flex-1 max-w-[180px]"
            @click="spinAgain"
          >
            <el-icon class="mr-2" :size="20"><Refresh /></el-icon>
            <span class="font-semibold">再抽一次</span>
          </el-button>
          <el-button
            size="large"
            class="result-action-btn flex-1 max-w-[180px]"
            @click="editOptions"
          >
            <el-icon class="mr-2" :size="20"><EditPen /></el-icon>
            <span class="font-semibold">修改選項</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 背景樣式 ===== */
.machine-bg {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.machine-bg-classic {
  background: radial-gradient(ellipse at center, rgba(139, 69, 19, 0.3) 0%, transparent 70%),
              linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%);
}

.machine-bg-neon {
  background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.2) 0%, transparent 60%),
              radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 50%);
}

.machine-bg-candy {
  background: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 60%),
              radial-gradient(ellipse at bottom, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
              linear-gradient(180deg, rgba(255,192,203,0.1) 0%, transparent 50%);
}

.machine-bg-retro {
  background: radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15) 0%, transparent 60%),
              radial-gradient(ellipse at top left, rgba(251, 191, 36, 0.1) 0%, transparent 40%),
              linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%);
}

/* ===== 扭蛋機零件樣式 ===== */

/* 機器頂蓋 - 經典紅 (預設) */
.machine-top {
  width: 300px;
  height: 24px;
  margin: 0 auto;
  background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
  border-radius: 10px 10px 4px 4px;
  position: relative;
  z-index: 2;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4);
}

/* 機器頂蓋 - 霓虹藍 */
.machine-top-neon {
  background: linear-gradient(180deg, #0891b2 0%, #155e75 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 20px rgba(6, 182, 212, 0.5);
}

/* 機器頂蓋 - 糖果粉 */
.machine-top-candy {
  background: linear-gradient(180deg, #ec4899 0%, #be185d 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(236, 72, 153, 0.4);
}

/* 機器頂蓋 - 復古綠 */
.machine-top-retro {
  background: linear-gradient(180deg, #059669 0%, #065f46 100%);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4);
}

/* 玻璃遮罩 */
.glass-dome {
  width: 290px;
  height: 280px;
  margin: 0 auto;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.25) 0%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.12) 100%
  );
  border-radius: 16px 16px 0 0;
  position: relative;
  backdrop-filter: blur(1px);
  border: 3px solid rgba(255,255,255,0.2);
  border-bottom: none;
  box-shadow:
    inset 0 0 40px rgba(0,0,0,0.3),
    0 5px 20px rgba(0,0,0,0.3);
}

.glass-dome-neon {
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow:
    inset 0 0 30px rgba(6, 182, 212, 0.2),
    0 0 30px rgba(6, 182, 212, 0.3);
}

.glass-dome-candy {
  border-color: rgba(236, 72, 153, 0.3);
  box-shadow:
    inset 0 0 30px rgba(236, 72, 153, 0.15),
    0 0 20px rgba(236, 72, 153, 0.2);
}

.glass-dome-retro {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow:
    inset 0 0 30px rgba(34, 197, 94, 0.1),
    0 5px 15px rgba(0,0,0,0.3);
}

.shadow-inner-glass {
  box-shadow: inset 0 20px 60px rgba(0,0,0,0.3);
}

.glass-highlight {
  position: absolute;
  top: 0;
  left: 20px;
  width: 25px;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.15) 50%, transparent 100%);
  pointer-events: none;
  border-radius: 16px 0 0 0;
}

.glass-highlight-2 {
  position: absolute;
  top: 40px;
  right: 50px;
  width: 40px;
  height: 25px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  filter: blur(4px);
}

/* 金屬環 */
.machine-ring {
  width: 310px;
  height: 18px;
  margin: 0 auto;
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 30%, #d97706 60%, #b45309 100%);
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.5),
    inset 0 -2px 4px rgba(0,0,0,0.4),
    0 2px 8px rgba(0,0,0,0.3);
}

.machine-ring-neon {
  background: linear-gradient(180deg, #67e8f9 0%, #22d3ee 30%, #06b6d4 60%, #0891b2 100%);
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.6),
    inset 0 -2px 4px rgba(0,0,0,0.3),
    0 0 20px rgba(6, 182, 212, 0.5);
}

.machine-ring-candy {
  background: linear-gradient(180deg, #fbcfe8 0%, #f9a8d4 30%, #f472b6 60%, #ec4899 100%);
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.6),
    inset 0 -2px 4px rgba(0,0,0,0.2),
    0 0 15px rgba(236, 72, 153, 0.4);
}

.machine-ring-retro {
  background: linear-gradient(180deg, #fcd34d 0%, #facc15 30%, #eab308 60%, #ca8a04 100%);
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.5),
    inset 0 -2px 4px rgba(0,0,0,0.4),
    0 2px 8px rgba(0,0,0,0.3);
}

/* 機器身體 */
.machine-body {
  width: 290px;
  height: 100px;
  margin: 0 auto;
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 40%, #991b1b 70%, #7f1d1d 100%);
  position: relative;
  box-shadow:
    inset 4px 0 8px rgba(255,255,255,0.1),
    inset -4px 0 8px rgba(0,0,0,0.2),
    inset 0 4px 8px rgba(255,255,255,0.1),
    inset 0 -4px 8px rgba(0,0,0,0.3);
}

.machine-body-neon {
  background: linear-gradient(180deg, #0891b2 0%, #0e7490 40%, #155e75 70%, #164e63 100%);
  box-shadow:
    inset 4px 0 8px rgba(103, 232, 249, 0.2),
    inset -4px 0 8px rgba(0,0,0,0.2),
    inset 0 4px 8px rgba(103, 232, 249, 0.1),
    inset 0 -4px 8px rgba(0,0,0,0.3),
    0 0 30px rgba(6, 182, 212, 0.3);
}

.machine-body-candy {
  background: linear-gradient(180deg, #ec4899 0%, #db2777 40%, #be185d 70%, #9d174d 100%);
  box-shadow:
    inset 4px 0 8px rgba(255,255,255,0.15),
    inset -4px 0 8px rgba(0,0,0,0.15),
    inset 0 4px 8px rgba(255,255,255,0.1),
    inset 0 -4px 8px rgba(0,0,0,0.2);
}

.machine-body-retro {
  background: linear-gradient(180deg, #059669 0%, #047857 40%, #065f46 70%, #064e3b 100%);
  box-shadow:
    inset 4px 0 8px rgba(255,255,255,0.1),
    inset -4px 0 8px rgba(0,0,0,0.2),
    inset 0 4px 8px rgba(255,255,255,0.1),
    inset 0 -4px 8px rgba(0,0,0,0.3);
}

/* 投幣口 */
.coin-slot {
  position: absolute;
  top: 15px;
  left: 20px;
  width: 28px;
  height: 6px;
  background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
  border-radius: 3px;
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,0.8),
    0 1px 0 rgba(255,255,255,0.1);
}

.coin-slot-inner {
  position: absolute;
  inset: 1px;
  background: #000;
  border-radius: 2px;
}

/* 品牌標籤 */
.brand-label {
  position: absolute;
  top: 12px;
  right: 15px;
  padding: 2px 8px;
  background: linear-gradient(180deg, #fef3c7 0%, #fcd34d 100%);
  border-radius: 4px;
  color: #92400e;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.brand-label-neon {
  background: linear-gradient(180deg, #ecfeff 0%, #67e8f9 100%);
  color: #155e75;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(6, 182, 212, 0.5);
}

.brand-label-candy {
  background: linear-gradient(180deg, #fdf2f8 0%, #fbcfe8 100%);
  color: #9d174d;
}

.brand-label-retro {
  background: linear-gradient(180deg, #fef3c7 0%, #fde047 100%);
  color: #854d0e;
}

/* 出口 - 放大版 */
.machine-outlet {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 65px;
  background: linear-gradient(180deg, #1f2937 0%, #111827 50%, #000 100%);
  border-radius: 20px 20px 0 0;
  box-shadow:
    inset 0 6px 16px rgba(0,0,0,0.8),
    -4px 0 8px rgba(0,0,0,0.4),
    4px 0 8px rgba(0,0,0,0.4);
}

.outlet-inner {
  position: absolute;
  inset: 8px;
  inset-bottom: 0;
  background: linear-gradient(180deg, #0a0a0a 0%, #000 100%);
  border-radius: 14px 14px 0 0;
}

/* 機器底座 */
.machine-base {
  width: 330px;
  height: 24px;
  margin: 0 auto;
  background: linear-gradient(180deg, #7f1d1d 0%, #6b1a1a 50%, #5c1616 100%);
  border-radius: 0 0 14px 14px;
  position: relative;
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.1),
    0 4px 12px rgba(0,0,0,0.5);
}

.machine-base-neon {
  background: linear-gradient(180deg, #164e63 0%, #134e4a 50%, #0f172a 100%);
  box-shadow:
    inset 0 2px 4px rgba(103, 232, 249, 0.1),
    0 4px 12px rgba(0,0,0,0.5),
    0 0 20px rgba(6, 182, 212, 0.2);
}

.machine-base-candy {
  background: linear-gradient(180deg, #9d174d 0%, #831843 50%, #500724 100%);
}

.machine-base-retro {
  background: linear-gradient(180deg, #064e3b 0%, #022c22 50%, #0a0a0a 100%);
}

/* ===== 拉霸式拉桿（透視縮短法） ===== */
.slot-lever {
  position: absolute;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 140px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 15;
}

.slot-lever:hover:not(:disabled) .lever-ball {
  filter: brightness(1.1);
}

/* 底座（固定不動） */
.lever-base {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    #d4d4d8 0%,
    #a1a1aa 25%,
    #71717a 50%,
    #52525b 75%,
    #3f3f46 100%
  );
  box-shadow:
    inset 3px 3px 8px rgba(255,255,255,0.5),
    inset -3px -3px 8px rgba(0,0,0,0.4),
    -3px 0 10px rgba(0,0,0,0.3),
    0 4px 12px rgba(0,0,0,0.4);
  border: 2px solid #27272a;
}

/* 連接桿（圓柱體） */
.lever-stick {
  position: absolute;
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 70px;
  /* 圓柱體高光效果 */
  background: linear-gradient(
    90deg,
    #6b7280 0%,
    #9ca3af 15%,
    #d1d5db 30%,
    #e5e7eb 45%,
    #f3f4f6 50%,
    #e5e7eb 55%,
    #d1d5db 70%,
    #9ca3af 85%,
    #6b7280 100%
  );
  border-radius: 7px;
  box-shadow:
    2px 0 6px rgba(0,0,0,0.25),
    -1px 0 4px rgba(0,0,0,0.15);
  /* 關鍵：從底部縮放 */
  transform-origin: bottom center;
}

/* 球頭（紅色球體） */
.lever-ball {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* 球體漸層 */
  background: radial-gradient(
    circle at 35% 30%,
    #fca5a5 0%,
    #f87171 15%,
    #ef4444 30%,
    #dc2626 50%,
    #b91c1c 70%,
    #991b1b 85%,
    #7f1d1d 100%
  );
  box-shadow:
    inset 5px 5px 12px rgba(255,255,255,0.5),
    inset -3px -3px 10px rgba(0,0,0,0.35),
    0 6px 20px rgba(0,0,0,0.4),
    0 0 25px rgba(239, 68, 68, 0.25);
  transition: filter 0.2s;
}

/* 球頭高光 */
.lever-ball-shine {
  position: absolute;
  top: 12%;
  left: 18%;
  width: 45%;
  height: 35%;
  background: radial-gradient(
    ellipse,
    rgba(255,255,255,0.9) 0%,
    rgba(255,255,255,0.5) 40%,
    transparent 70%
  );
  border-radius: 50%;
}

/* ===== 透視縮短動畫（Squash & Stretch） ===== */

/* 連接桿動畫：縮短模擬指向前方 */
@keyframes stick-pull {
  0% {
    transform: translateX(-50%) scaleY(1);
  }
  45% {
    transform: translateX(-50%) scaleY(0.25);
  }
  55% {
    transform: translateX(-50%) scaleY(0.2);
  }
  75% {
    transform: translateX(-50%) scaleY(0.6);
  }
  88% {
    transform: translateX(-50%) scaleY(1.08);
  }
  100% {
    transform: translateX(-50%) scaleY(1);
  }
}

/* 球頭動畫：下移並放大模擬靠近 */
@keyframes ball-pull {
  0% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  45% {
    transform: translateX(-50%) translateY(55px) scale(1.15);
  }
  55% {
    transform: translateX(-50%) translateY(60px) scale(1.2);
  }
  75% {
    transform: translateX(-50%) translateY(25px) scale(1.05);
  }
  88% {
    transform: translateX(-50%) translateY(-6px) scale(0.95);
  }
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.animate-stick-pull {
  animation: stick-pull 0.6s ease-in-out;
}

.animate-ball-pull {
  animation: ball-pull 0.6s ease-in-out;
}

/* ===== 扭蛋球（上半透明、下半有色） ===== */
.capsule-ball {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  /* 透明背景 */
  background: transparent;
  /* 外框陰影 */
  box-shadow:
    0 2px 6px rgba(0,0,0,0.3);
  overflow: hidden;
}

/* 上半部 - 透明塑膠 */
.capsule-ball::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.5) 0%,
    rgba(255,255,255,0.25) 60%,
    rgba(255,255,255,0.15) 100%
  );
  border-radius: 50% 50% 0 0;
  box-shadow:
    inset 2px 2px 6px rgba(255,255,255,0.7),
    inset -1px 0 4px rgba(0,0,0,0.1);
}

/* 高光效果 */
.capsule-ball::after {
  content: '';
  position: absolute;
  top: 8%;
  left: 18%;
  width: 35%;
  height: 22%;
  background: radial-gradient(ellipse, rgba(255,255,255,0.95) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 10;
}

/* 下半部顏色（透過額外的內層元素，但我們用漸層背景模擬） */
/* 各顏色扭蛋的下半部 */
.capsule-ball.capsule-gradient {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(200,200,200,0.3) 49%,
    #ff6b6b 50%,
    #ff8e8e 65%,
    #ff6b6b 100%
  );
  border: 2px solid rgba(255,107,107,0.4);
}

.capsule-ball.capsule-gradient-blue {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(200,200,200,0.3) 49%,
    #4ecdc4 50%,
    #7ee8e2 65%,
    #4ecdc4 100%
  );
  border: 2px solid rgba(78,205,196,0.4);
}

.capsule-ball.capsule-gradient-purple {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(200,200,200,0.3) 49%,
    #a855f7 50%,
    #c084fc 65%,
    #a855f7 100%
  );
  border: 2px solid rgba(168,85,247,0.4);
}

.capsule-ball.capsule-gradient-yellow {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(200,200,200,0.3) 49%,
    #fbbf24 50%,
    #fcd34d 65%,
    #fbbf24 100%
  );
  border: 2px solid rgba(251,191,36,0.4);
}

.capsule-ball.capsule-gradient-green {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(200,200,200,0.3) 49%,
    #22c55e 50%,
    #4ade80 65%,
    #22c55e 100%
  );
  border: 2px solid rgba(34,197,94,0.4);
}

.capsule-ball.capsule-gradient-pink {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(200,200,200,0.3) 49%,
    #ec4899 50%,
    #f472b6 65%,
    #ec4899 100%
  );
  border: 2px solid rgba(236,72,153,0.4);
}

/* ===== 按鈕樣式 ===== */
.btn-golden {
  background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%);
  color: #78350f;
  font-weight: bold;
  box-shadow:
    0 4px 15px rgba(251, 191, 36, 0.4),
    inset 0 2px 4px rgba(255,255,255,0.4);
}

/* ===== 結果卡片 ===== */
.result-card {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #ec4899 75%, #a855f7 100%);
  padding: 3px;
  border-radius: 24px;
  box-shadow:
    0 0 40px rgba(251, 191, 36, 0.4),
    0 0 80px rgba(236, 72, 153, 0.2);
}

.result-card-inner {
  background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
  border-radius: 22px;
  padding: 40px 32px;
  min-width: 280px;
}

/* ===== 掉落的扭蛋（上半透明、下半有色） ===== */
.capsule-dropping {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  /* 初始位置：出口正中心 */
  bottom: 45px;
  left: 50%;
  z-index: 100;
  animation: capsule-drop 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  box-shadow:
    0 8px 24px rgba(0,0,0,0.4);
  overflow: hidden;
  background: transparent;
}

/* 上半透明部分 */
.capsule-dropping::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.55) 0%,
    rgba(255,255,255,0.3) 60%,
    rgba(255,255,255,0.2) 100%
  );
  border-radius: 50% 50% 0 0;
  box-shadow:
    inset 3px 3px 10px rgba(255,255,255,0.8),
    inset -2px 0 6px rgba(0,0,0,0.1);
  z-index: 2;
}

/* 各顏色的下半部 */
.capsule-dropping.capsule-gradient {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(220,220,220,0.4) 49%,
    #ff6b6b 50%,
    #ff8e8e 70%,
    #ff6b6b 100%
  );
  border: 3px solid rgba(255,107,107,0.5);
}

.capsule-dropping.capsule-gradient-blue {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(220,220,220,0.4) 49%,
    #4ecdc4 50%,
    #7ee8e2 70%,
    #4ecdc4 100%
  );
  border: 3px solid rgba(78,205,196,0.5);
}

.capsule-dropping.capsule-gradient-purple {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(220,220,220,0.4) 49%,
    #a855f7 50%,
    #c084fc 70%,
    #a855f7 100%
  );
  border: 3px solid rgba(168,85,247,0.5);
}

.capsule-dropping.capsule-gradient-yellow {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(220,220,220,0.4) 49%,
    #fbbf24 50%,
    #fcd34d 70%,
    #fbbf24 100%
  );
  border: 3px solid rgba(251,191,36,0.5);
}

.capsule-dropping.capsule-gradient-green {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(220,220,220,0.4) 49%,
    #22c55e 50%,
    #4ade80 70%,
    #22c55e 100%
  );
  border: 3px solid rgba(34,197,94,0.5);
}

.capsule-dropping.capsule-gradient-pink {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 48%,
    rgba(220,220,220,0.4) 49%,
    #ec4899 50%,
    #f472b6 70%,
    #ec4899 100%
  );
  border: 3px solid rgba(236,72,153,0.5);
}

@keyframes capsule-drop {
  0% {
    /* 從出口誕生，從無到有 */
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }
  10% {
    /* 快速出現在出口 */
    transform: translateX(-50%) scale(0.8);
    opacity: 1;
  }
  25% {
    /* 稍微放大，準備彈出 */
    transform: translateX(-50%) scale(1.1);
  }
  40% {
    /* 輕微下沉蓄力 */
    transform: translateX(-50%) translateY(5px) scale(1);
  }
  100% {
    /* 飛向螢幕中央，放大 */
    transform: translateX(-50%) translateY(-280px) scale(3);
    opacity: 1;
  }
}

.capsule-shine {
  position: absolute;
  top: 8%;
  left: 15%;
  width: 40%;
  height: 25%;
  background: radial-gradient(ellipse, rgba(255,255,255,0.95) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 10;
}

/* ===== 內陰影 ===== */
.shadow-inner-dark {
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
}

/* ===== Element Plus 自定義樣式 ===== */

/* 自定義 textarea */
.custom-textarea :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  color: white !important;
  font-size: 1rem;
  padding: 16px;
  min-height: 200px !important;
}

.custom-textarea :deep(.el-textarea__inner::placeholder) {
  color: rgba(156, 163, 175, 0.7);
}

.custom-textarea :deep(.el-textarea__inner:focus) {
  border-color: rgba(250, 204, 21, 0.5) !important;
  box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2) !important;
}

/* 開始按鈕樣式 */
.start-btn {
  height: 56px !important;
  font-size: 1.125rem !important;
  font-weight: bold !important;
  border-radius: 16px !important;
}

/* 對話框自定義 */
.custom-dialog :deep(.el-dialog) {
  background: rgba(15, 23, 42, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
}

.custom-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.custom-dialog :deep(.el-dialog__title) {
  color: white !important;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

/* 預覽卡片 */
.preview-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.preview-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
}

.preview-card :deep(.el-card__body) {
  padding: 12px 16px;
}

/* 存檔列表 */
.preset-list {
  max-height: 50vh;
  overflow-y: auto;
}

.preset-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s;
}

.preset-card:hover {
  border-color: rgba(250, 204, 21, 0.3) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

/* 截斷文字 */
.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 結果頁面樣式 */
.result-container :deep(.el-result__icon) {
  margin-bottom: 0 !important;
}

.result-display-card {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%) !important;
  border: 2px solid rgba(251, 191, 36, 0.4) !important;
  border-radius: 16px !important;
  min-width: 250px;
}

.result-display-card :deep(.el-card__body) {
  padding: 8px 24px;
}

/* 深色模式下的 Element Plus 調整 */
:deep(.el-button) {
  border-radius: 12px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
}

:deep(.el-alert) {
  border-radius: 12px;
}

:deep(.el-tag) {
  border-radius: 9999px;
}

:deep(.el-empty__description) {
  margin-top: 12px;
}

:deep(.el-card) {
  border-radius: 12px;
}

/* ===== 專業 UI 樣式 (UI/UX Pro Max) ===== */

/* 安全區域適配 */
.safe-area-top {
  padding-top: max(env(safe-area-inset-top), 12px);
}

.safe-area-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 24px);
}

.safe-area {
  padding-top: max(env(safe-area-inset-top), 16px);
  padding-bottom: max(env(safe-area-inset-bottom), 16px);
}

/* 主題切換按鈕 - 最小 44x44 觸控目標 */
.theme-toggle-btn {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 14px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  transition: all 0.2s ease-out !important;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  transform: scale(1.05);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

.theme-picker-content {
  padding: 4px;
}

.theme-option-btn {
  height: 44px !important;
  border-radius: 10px !important;
  font-size: 14px !important;
}

/* 標題樣式 - 暖色金橘漸層 */
.title-text {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 主卡片 - 暖色調 */
.main-card {
  background: rgba(30, 25, 22, 0.8) !important;
  border: 1px solid rgba(251, 191, 36, 0.1) !important;
  border-radius: 20px !important;
  backdrop-filter: blur(10px);
}

.main-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(251, 191, 36, 0.08);
}

.main-card :deep(.el-card__body) {
  padding: 20px;
}

/* 操作按鈕 - 暖色調 */
.action-btn {
  height: 52px !important;
  min-height: 44px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  border-radius: 14px !important;
  background: rgba(30, 25, 22, 0.8) !important;
  border: 1px solid rgba(251, 191, 36, 0.15) !important;
  transition: all 0.2s ease-out !important;
}

.action-btn:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.1) !important;
  border-color: rgba(251, 191, 36, 0.25) !important;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* 選項數量標籤 */
.option-count-tag {
  padding: 6px 14px !important;
  height: auto !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

/* 大型 textarea */
.custom-textarea-large {
  flex: 1;
}

.custom-textarea-large :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 14px !important;
  color: white !important;
  font-size: 16px !important;
  line-height: 1.6 !important;
  padding: 16px !important;
  min-height: 200px !important;
  height: 100% !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}

.custom-textarea-large :deep(.el-textarea__inner::placeholder) {
  color: rgba(156, 163, 175, 0.5);
  font-size: 15px;
}

.custom-textarea-large :deep(.el-textarea__inner:focus) {
  border-color: rgba(251, 191, 36, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
}

/* 大型開始按鈕 - 暖色漸層 */
.start-btn-large {
  height: 60px !important;
  min-height: 44px !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(234, 88, 12, 0.3) !important;
  transition: all 0.2s ease-out !important;
}

.start-btn-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(234, 88, 12, 0.4) !important;
}

.start-btn-large:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.start-btn-large:disabled {
  background: rgba(255, 255, 255, 0.08) !important;
  box-shadow: none !important;
}

/* 結果頁面標題 - 暖色 */
.result-title {
  color: #fbbf24;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

/* 大型結果卡片 - 暖色調 */
.result-card-large {
  background: rgba(30, 25, 22, 0.9) !important;
  border: 2px solid rgba(251, 191, 36, 0.3) !important;
  border-radius: 24px !important;
  box-shadow: 0 8px 40px rgba(234, 88, 12, 0.15), 0 0 60px rgba(251, 191, 36, 0.08) !important;
  backdrop-filter: blur(10px);
}

.result-card-large :deep(.el-card__body) {
  padding: 0;
}

/* 機率標籤 */
.probability-tag {
  padding: 10px 18px !important;
  font-size: 14px !important;
  height: auto !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* 結果頁操作按鈕 - 暖色調 */
.result-action-btn {
  height: 56px !important;
  min-height: 44px !important;
  border-radius: 14px !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  transition: all 0.2s ease-out !important;
}

.result-action-btn.el-button--primary {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(234, 88, 12, 0.25) !important;
}

.result-action-btn.el-button--primary:hover {
  box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35) !important;
}

.result-action-btn:not(.el-button--primary) {
  background: rgba(30, 25, 22, 0.8) !important;
  border: 1px solid rgba(251, 191, 36, 0.2) !important;
}

.result-action-btn:not(.el-button--primary):hover {
  background: rgba(251, 191, 36, 0.1) !important;
  border-color: rgba(251, 191, 36, 0.3) !important;
}

.result-action-btn:active {
  transform: scale(0.98);
}

/* 閃爍星星裝飾 - 暖金色 */
.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  opacity: 0;
  animation: sparkle-anim 2.5s ease-in-out infinite;
}

.sparkle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 2px;
  background: #fbbf24;
  border-radius: 1px;
}

.sparkle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  width: 16px;
  height: 2px;
  background: #fbbf24;
  border-radius: 1px;
}

.sparkle-1 { top: 10%; left: 15%; animation-delay: 0s; }
.sparkle-2 { top: 20%; right: 20%; animation-delay: 0.3s; }
.sparkle-3 { top: 40%; left: 10%; animation-delay: 0.6s; }
.sparkle-4 { bottom: 30%; right: 15%; animation-delay: 0.9s; }
.sparkle-5 { bottom: 20%; left: 25%; animation-delay: 1.2s; }
.sparkle-6 { top: 35%; right: 10%; animation-delay: 1.5s; }

@keyframes sparkle-anim {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.8; transform: scale(1); }
}

/* 慢速脈動 */
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* ===== 主題風格 ===== */

/* 經典風格 (default) - 暖金色 */
.theme-default .title-text {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.theme-default .start-btn-large {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important;
  box-shadow: 0 4px 20px rgba(234, 88, 12, 0.3) !important;
}

.theme-default .result-card-large {
  border-color: rgba(251, 191, 36, 0.3) !important;
  box-shadow: 0 8px 40px rgba(234, 88, 12, 0.15) !important;
}

/* 賽博龐克風格 */
.theme-cyberpunk .title-text {
  background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.theme-cyberpunk .main-card {
  background: rgba(6, 182, 212, 0.04) !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
}

.theme-cyberpunk .custom-textarea-large :deep(.el-textarea__inner) {
  border-color: rgba(6, 182, 212, 0.2) !important;
}

.theme-cyberpunk .custom-textarea-large :deep(.el-textarea__inner:focus) {
  border-color: rgba(6, 182, 212, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15) !important;
}

.theme-cyberpunk .start-btn-large {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.35) !important;
}

.theme-cyberpunk .result-title {
  color: #22d3ee;
}

.theme-cyberpunk .result-card-large {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%) !important;
  border: 2px solid rgba(6, 182, 212, 0.4) !important;
  box-shadow: 0 8px 40px rgba(6, 182, 212, 0.25) !important;
}

.theme-cyberpunk .sparkle {
  background: #22d3ee;
}
.theme-cyberpunk .sparkle::before,
.theme-cyberpunk .sparkle::after {
  background: #22d3ee;
}

/* 簡約風格 */
.theme-minimal .title-text {
  background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.theme-minimal .main-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 16px !important;
}

.theme-minimal .custom-textarea-large :deep(.el-textarea__inner) {
  border-color: rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px !important;
}

.theme-minimal .custom-textarea-large :deep(.el-textarea__inner:focus) {
  border-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08) !important;
}

.theme-minimal .start-btn-large {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: none !important;
  border-radius: 12px !important;
}

.theme-minimal .start-btn-large:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: none;
}

.theme-minimal .result-title {
  color: #f1f5f9;
}

.theme-minimal .result-card-large {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}

.theme-minimal .sparkle {
  background: rgba(255, 255, 255, 0.6);
}
.theme-minimal .sparkle::before,
.theme-minimal .sparkle::after {
  background: rgba(255, 255, 255, 0.6);
}

/* 可愛風格 */
.theme-cute .title-text {
  background: linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #fda4af 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.theme-cute .main-card {
  background: rgba(244, 114, 182, 0.04) !important;
  border: 2px solid rgba(244, 114, 182, 0.15) !important;
  border-radius: 24px !important;
}

.theme-cute .custom-textarea-large :deep(.el-textarea__inner) {
  border-color: rgba(244, 114, 182, 0.2) !important;
  border-radius: 16px !important;
}

.theme-cute .custom-textarea-large :deep(.el-textarea__inner:focus) {
  border-color: rgba(244, 114, 182, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.12) !important;
}

.theme-cute .start-btn-large {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%) !important;
  border: none !important;
  border-radius: 20px !important;
  box-shadow: 0 4px 20px rgba(244, 114, 182, 0.35) !important;
}

.theme-cute .result-title {
  color: #f9a8d4;
}

.theme-cute .result-card-large {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.12) 0%, rgba(251, 113, 133, 0.12) 100%) !important;
  border: 2px solid rgba(244, 114, 182, 0.35) !important;
  border-radius: 24px !important;
  box-shadow: 0 8px 40px rgba(244, 114, 182, 0.2) !important;
}

.theme-cute .sparkle {
  background: #f9a8d4;
}
.theme-cute .sparkle::before,
.theme-cute .sparkle::after {
  background: #f9a8d4;
}

/* 動畫 */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}

@keyframes result-pop {
  0% { transform: scale(0.9); opacity: 0; }
  60% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-result-pop {
  animation: result-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 響應式調整 */
@media (max-width: 375px) {
  .title-text {
    font-size: 1.75rem !important;
  }

  .result-card-large :deep(.el-card__body) > div {
    padding: 1.5rem 1rem !important;
  }
}

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-result-pop,
  .animate-pulse-slow {
    animation: none !important;
  }

  .sparkle {
    animation: none !important;
    opacity: 0.5;
  }

  .start-btn-large:hover:not(:disabled),
  .theme-toggle-btn:hover {
    transform: none !important;
  }
}
</style>
