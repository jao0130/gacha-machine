# 幸運扭蛋機 (Gacha Machine)

一個可自定義選項的移動端 PWA 應用，用於隨機抽選。用戶輸入任意選項後，透過扭蛋機動畫隨機抽出結果。

## 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.24 | 前端框架 (Composition API + script setup) |
| Vite | ^7.2.4 | 構建工具和開發服務器 |
| TypeScript | ~5.9.3 | 類型系統 |
| Tailwind CSS | ^4.1.18 | CSS 樣式框架 |
| vite-plugin-pwa | ^1.2.0 | PWA 離線支援與安裝功能 |

## 目錄結構

```
gacha-machine/
├── src/
│   ├── main.ts           # 應用入口
│   ├── App.vue           # 主應用組件（包含所有業務邏輯）
│   ├── style.css         # 全局樣式 + Tailwind 定義
│   ├── components/       # 組件目錄
│   └── assets/           # 靜態資源
├── public/               # PWA 圖標和靜態文件
│   ├── apple-touch-icon.png    # iOS 圖標 (180x180)
│   ├── pwa-192x192.png         # Android 圖標
│   └── pwa-512x512.png         # 啟動畫面圖標
├── index.html            # HTML 入口 (含 PWA meta tags)
├── vite.config.ts        # Vite + PWA 配置
├── tailwind.config.js    # Tailwind 自定義主題
├── postcss.config.js     # PostCSS 配置
└── tsconfig.*.json       # TypeScript 配置
```

## 常用命令

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 生產構建
npm run build

# 預覽生產版本
npm run preview
```

## 應用架構

### 頁面狀態

應用採用單組件架構，`App.vue` 包含三個主要頁面狀態：

1. **input** - 選項輸入頁面：用戶輸入多行選項
2. **machine** - 扭蛋機頁面：展示扭蛋機動畫
3. **result** - 結果展示頁面：顯示抽選結果

### 核心功能模塊

#### 選項解析
- 輸入框支持多行輸入
- 自動去除空行和前後空格
- 實時計算有效選項數量

#### 存檔系統
- 使用 `localStorage` 存儲預設
- 鍵名：`gacha-presets`
- 支持保存、載入、刪除存檔

#### 隨機數生成
```typescript
// 使用加密安全隨機數
if (window.crypto && window.crypto.getRandomValues) {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0] % max
}
// 後備方案
return Math.floor(Math.random() * max)
```

#### 動畫時序
| 動畫 | 時間範圍 | 說明 |
|------|---------|------|
| 拉桿 | 0-600ms | 透視縮短效果 |
| 震動 | 270-1000ms | 機身抖動 |
| 掉落 | 1000-2200ms | 扭蛋飛向中央 |
| 結果 | 自動觸發 | 彈性縮放動畫 |

### 主題樣式

扭蛋機支持 4 種主題：
- **Classic** - 經典紅
- **Neon** - 霓虹藍
- **Candy** - 糖果粉
- **Retro** - 復古綠

### 扭蛋球顏色

6 種預定義顏色自動循環分配：紅、藍、綠、黃、粉、紫

## 重要文件說明

### `src/App.vue`
核心組件，包含：
- 響應式狀態管理
- 頁面切換邏輯
- 動畫控制
- 存檔管理
- 隨機抽選邏輯

### `src/style.css`
全局樣式，包含：
- Tailwind CSS 導入
- 自定義動畫 keyframes
- 扭蛋球漸層效果
- 光澤和陰影效果

### `vite.config.ts`
PWA 配置：
- 應用名稱：客製扭蛋機
- 主題色：#FFD700 (金色)
- 背景色：#1a1a2e (深紫)
- 顯示模式：standalone
- 緩存策略：字體使用 CacheFirst

### `tailwind.config.js`
自定義主題：
- 顏色：gacha-gold, gacha-pink, gacha-purple
- 動畫：shake, bounce-in, pop, float

## 開發規範

### 代碼風格
- 使用 Vue 3 Composition API + `<script setup>`
- TypeScript 嚴格模式
- Tailwind CSS 原子化類名

### 組件結構
```vue
<script setup lang="ts">
// 1. 導入
// 2. 響應式狀態
// 3. 計算屬性
// 4. 方法
// 5. 生命週期
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped>
/* 組件樣式 */
</style>
```

### PWA 適配
- iOS: 需要 `apple-touch-icon` 和相關 meta tags
- 圖標尺寸：180x180 (iOS), 192x192, 512x512 (Android)
- 支持離線使用

## 部署

### Vercel/Netlify (推薦)
連接 GitHub 倉庫後自動部署

### 本地預覽
```bash
npm run build
npm run preview -- --host
# 在移動設備訪問 http://[本機IP]:4173
```

### iOS 安裝
1. 在 Safari 中打開應用
2. 點擊分享按鈕
3. 選擇「加入主畫面」

## 瀏覽器兼容

- 現代瀏覽器：Chrome, Firefox, Safari, Edge
- 移動端：iOS Safari 14+, Android Chrome
- 需要支持 Service Worker 和 Crypto API
