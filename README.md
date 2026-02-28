<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 執行並部署您的 AI Studio 應用程式

本檔案包含在本機執行應用程式所需的一切。

在 AI Studio 檢視您的應用程式： https://ai.studio/apps/c8654ac4-afce-4411-b17b-a3fa8c0c606c

## 本機執行

**先決條件：** Node.js

1.（Windows）若您的工具鏈需要 Python，請在執行 `npm` 之前啟用正確的 Python/Conda 環境。本專案使用位於 `D:\conda_envs\nodejs` 的環境。

- 命令提示字元（Command Prompt）：
  `conda activate D:\conda_envs\nodejs`

- PowerShell：
  `conda activate D:\conda_envs\nodejs`

- 如果系統無法辨識 `conda`，請開啟 Anaconda/Miniconda Prompt，或為您的 shell 初始化 Conda。

2. 安裝相依套件：
   `npm install`



3. 在 [.env.local](.env.local) 中設定 `GEMINI_API_KEY` 為您的 Gemini API 金鑰
4. 執行應用程式：
   `npm run dev`

---

## 專案概要（快速參考）

- **名稱**: Mercuries Life Breakout
- **類型**: React + TypeScript（Vite）Canvas 遊戲，結合 Google GenAI 提供遊戲後的 AI 回饋。
- **主要技術**: React, TypeScript, Vite, Canvas API, @google/genai

## 重要檔案與職責

- `package.json`: 相依與啟動腳本（`dev` / `build` / `preview`）。
- `tsconfig.json`: TypeScript 編譯設定（`noEmit`、`jsx: react-jsx` 等）。
- `App.tsx`: 應用主組件，管理遊戲狀態（分數、生命、Auto 模式）並整合 `Overlay` 與 `GameCanvas`。
- `index.tsx`: React 掛載（entry）。
- `components/GameCanvas.tsx`: Canvas 遊戲核心，包含遊戲迴圈、碰撞邏輯、移動磚塊、掉落道具、粒子與浮動文字。
- `components/Overlay.tsx`: 菜單、結算畫面與 AI 教練顯示區。
- `services/geminiService.ts`: 對接 Google GenAI（Gemini）以產生結算短訊息。
- `constants.ts`: 主題色、遊戲配置（`CONFIG`）、產品列表與內嵌 logo。
- `types.ts`: 遊戲型別定義（Ball、Paddle、Brick、GameConfig 等）。

## 設計觀察與重點

- Canvas 實作細緻：磚塊以正弦波移動、閃爍磚（bonus）、掉落合約或生命道具。
- 自動模式（Auto）使用簡單的線性內插追蹤球位置以自動擺放球拍。
- 遊戲結束時會透過 `services/geminiService.ts` 呼叫 Gemini，取得傳回的繁體中文短訊息作為 AI 教練回饋。
- `constants.ts` 使用 data URL 內嵌 SVG logo，避免 CORS 問題。

## 建議的後續工作（可選）

- 在本機啟動並驗證：

```bash
npm install
npm run dev
```

- 強化 `geminiService.ts` 的環境變數使用與錯誤處理（目前以 `process.env.API_KEY` 建構 `GoogleGenAI`）。
- 為重度實時物件（particles、drops）加入上限或回收池以降低 GC 壓力。
- 新增單元測試：針對服務層（mock Gemini）與部分邏輯函式進行測試。

---

如果你要，我可以幫你直接：
- 在本機執行專案並回報任何錯誤；或
- 改寫 `geminiService.ts` 為使用 `GEMINI_API_KEY` 並加強錯誤處理；或
- 在 `GameCanvas.tsx` 中加入簡短註解，逐段說明更新/渲染/碰撞邏輯。

請選一項下一步或告訴我其他想要的整理格式。

---

## 使用者 Prompt：需求重點與回應方式

以下為上傳的 prompt（`migrated_prompt_history/prompt_2025-11-20T13_45_59.730Z.json`）中提出的主要需求與專案中已採取或建議的對應：

- 使用者希望「用上傳的圖片做三商美邦人壽打磚塊遊戲」，並要求確保 logo 能正確顯示：已改用內嵌 SVG Data URI（見 `constants.ts` 中的 `LOGO_URL`），避免 hotlink/CORS 問題。
- 要求「自動打磚塊功能（Auto Mode）」，遊戲已提供可切換的自動模式，使球拍平滑追蹤球位置自動遊玩（`App.tsx` / `components/GameCanvas.tsx`）。
- 要有「很炫的閃光磚塊」，已實作閃爍 / 彩虹光暈效果，並給予額外分數（flashy bricks）。
- 每打掉一塊磚就會掉下一份「保單合約（📑）」或「愛心（❤️）」，使用者要求掉落物要明顯且大張：已放大掉落物尺寸、加入白色背景圓、脈衝縮放與發光效果，並調整碰撞判斷以配合較大尺寸。
- 使用者回報「圖沒秀出來」的問題：已優先實作 Data URI / SVG fallback（`constants.ts`），並在 canvas 中提供文字或 SVG 的替代呈現。
- 要求磚塊能「會移動」：磚塊已加入水平正弦波移動，列方向交替，並以 `originalX` 保留原始位置以避免重疊。
- 將網站（https://www.mli.com.tw）之主要商品整合到遊戲：已在 `constants.ts` 中加入代表性商品（如 `祥安終身壽險`、`世紀安康醫療`、`GO福氣投保`、`平安旅行險`、`守護防癌險`），並以顏色/浮動文字在磚塊中呈現；擊破會顯示浮動商品名稱增加代入感。

### 已修改或新增的檔案（概要）

- `constants.ts` — 內嵌 SVG Data URI `LOGO_URL`、產品色彩與提示文。
- `components/GameCanvas.tsx` — 移動磚塊、放大與發光的掉落物、浮動文字、粒子特效與 Auto Mode 邏輯。
- `types.ts` — 強化 `Brick`、`FloatingText` 與相關型別（`originalX`、`productName` 等）。
- `services/geminiService.ts` — 用於生成遊戲結算的繁中短訊息（建議以 `GEMINI_API_KEY` 設定環境變數）。

### 建議後續工作

- 若需我執行：我可以在本機啟動並驗證視覺/互動（`npm install`、`npm run dev`），或把上述改動拆成多個 commit。
- 可進一步優化：為大量 particle/drops 加入回收池、加強 `geminiService.ts` 的環境變數處理，或補上單元測試。

如需我把這段改成英文版、或展開成 PR/commit patch，請告訴我要的格式與範圍。
