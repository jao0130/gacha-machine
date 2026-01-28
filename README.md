# 🎰 我的幸運扭蛋機

一個可以自訂選項的行動端 PWA 扭蛋機應用。

## 功能特點

- 📝 **自訂選項** - 輸入任意數量的選項，每行一個
- 🎲 **公平隨機** - 使用加密隨機數 (crypto.getRandomValues) 確保每個選項機率相等，無循環規律
- 🎨 **精美動畫** - 震動、掉落、揭曉三階段動畫效果
- 📱 **行動優先** - 專為手機設計的 UI/UX
- 💾 **離線可用** - PWA 支援，可安裝到手機主畫面

## 技術棧

- Vue 3 (Composition API + script setup)
- Vite
- Tailwind CSS v4
- vite-plugin-pwa

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 部署到 iOS

### 方法一：本地部署 (測試用)

1. 建置專案：
   ```bash
   npm run build
   ```

2. 啟動預覽伺服器並開放網路存取：
   ```bash
   npm run preview -- --host
   ```

3. 在 iPhone 上用 Safari 開啟顯示的網址（例如 `http://192.168.x.x:4173`）

4. 點擊 Safari 分享按鈕 → 「加入主畫面」

### 方法二：部署到 Vercel/Netlify (推薦)

1. 將專案推送到 GitHub

2. 連接到 Vercel 或 Netlify

3. 自動部署完成後，用 iPhone Safari 開啟網址

4. 點擊分享 → 「加入主畫面」

### 方法三：使用 ngrok (臨時測試)

```bash
# 安裝 ngrok
npm install -g ngrok

# 建置並預覽
npm run build
npm run preview -- --host --port 4173

# 另開終端，建立公開網址
ngrok http 4173
```

## PWA 圖示替換

請將以下檔案替換為你的自訂圖示：

| 檔案 | 尺寸 | 用途 |
|------|------|------|
| `public/pwa-192x192.png` | 192x192 | Android 圖示 |
| `public/pwa-512x512.png` | 512x512 | Android 圖示 / 啟動畫面 |
| `public/apple-touch-icon.png` | 180x180 | iOS 主畫面圖示 |
| `public/favicon.svg` | SVG | 瀏覽器標籤圖示 |

## 隨機機制說明

本應用使用 `window.crypto.getRandomValues()` API 獲取加密等級的隨機數：

```javascript
function getSecureRandomIndex(max) {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0] % max
}
```

這確保了：
- ✅ 每個選項機率完全相等
- ✅ 無法預測下一個結果
- ✅ 沒有循環規律
- ✅ 每次抽選獨立運作

## 專案結構

```
gacha-machine/
├── public/
│   ├── favicon.svg           # 瀏覽器圖示
│   ├── pwa-192x192.png       # PWA 圖示 (192x192)
│   ├── pwa-512x512.png       # PWA 圖示 (512x512)
│   └── apple-touch-icon.png  # iOS 圖示
├── src/
│   ├── App.vue               # 主應用組件
│   ├── main.ts               # 入口檔案
│   └── style.css             # 全域樣式 + Tailwind
├── index.html                # HTML 模板 (含 PWA meta tags)
├── vite.config.ts            # Vite 配置 (含 PWA plugin)
├── tailwind.config.js        # Tailwind 配置
└── postcss.config.js         # PostCSS 配置
```

## PWA Manifest 配置

位於 `vite.config.ts`：

```json
{
  "name": "我的幸運扭蛋機",
  "short_name": "扭蛋機",
  "description": "自訂選項，隨機抽選！",
  "theme_color": "#FFD700",
  "background_color": "#1a1a2e",
  "display": "standalone",
  "orientation": "portrait"
}
```

## License

MIT
