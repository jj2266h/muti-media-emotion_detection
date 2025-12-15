# FaceSense AI 🎭✨

**FaceSense AI** 是一個結合 **電腦視覺 (Computer Vision)** 與 **生成式 AI (Generative AI)** 的智慧分析平台。透過上傳圖片或影片，系統能即時偵測使用者的情緒、年齡、性別與人種，並利用大型語言模型 (LLM) 提供具備情境感知的個人化商品推薦。

![螢幕擷取畫面 2025-12-14 174522.png](https://github.com/jj2266h/muti-media-emotion_detection/blob/main/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2%202025-12-14%20174522.png)

## 🌟 核心功能 (Features)

* **多重人臉偵測 (Multi-Face Detection)**: 同時分析畫面中多位使用者的特徵。
* **深度屬性分析 (Deep Attribute Analysis)**:
    * 🙂 **情緒 (Emotion)**: 快樂、悲傷、憤怒、恐懼、驚訝、厭惡、中性。
    * 🎂 **年齡 (Age)**: 自動歸類年齡區間 (如 18-25, 26-40)。
    * 🚻 **性別與人種 (Demographics)**: 性別 (Gender) 與人種 (Race) 辨識。
* **AI 智慧推薦 (GenAI Recommendations)**:
    * 整合 **Google Gemini 2.0 Flash Lite**。
    * 根據視覺分析數據，生成個人化的商品推薦與創意文案。
    * * **互動式儀表板 (Interactive Dashboard)**:
    * 可視化圖表展示情緒分佈與時間序列變化。
    * 支援圖片與短影片 (MP4) 上傳分析。

## 🛠️ 技術架構 (Tech Stack)

本專案採用 **前後端分離 (Decoupled Architecture)** 設計：

### Frontend (前端)
* **React 19** + **Vite**: 高效能網頁框架。
* **TypeScript**: 確保型別安全。
* **Tailwind CSS**: 現代化響應式 UI 設計。
* **Recharts**: 資料視覺化圖表。
* **Lucide React**: 精美圖示庫。

### Backend (後端)
* **Python Flask**: 輕量級 RESTful API 伺服器。
* **DeepFace**: 臉部屬性分析函式庫。
* **OpenCV**: 影像與影片處理。

### AI Services (AI 服務)
* **Google Gemini API**: 生成式推薦引擎 (Model: `gemini-2.5-flash`)。

---

## 🚀 安裝與執行指南 (Getting Started)

請依照以下步驟分別啟動後端與前端伺服器。

### 1. 環境準備 (Prerequisites)
* Node.js (v18+)
* Python (v3.9+)
* Google Gemini API Key

### 2. 啟動後端 (Backend Setup)

後端負責影像處理，必須先啟動。

```bash
# 1. 進入專案根目錄 (假設 app.py 在此)
# 建議建立虛擬環境 (Optional)
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# 2. 安裝 Python 套件
pip install flask flask-cors opencv-python deepface numpy

# 3. 啟動 Flask 伺服器
python app.py

```

*成功啟動後，你應該會看到： `Running on http://127.0.0.1:5000*`

### 3. 啟動前端 (Frontend Setup)

```bash
# 1. 安裝 npm 套件
npm install

# 2. 設定環境變數
# 複製 .env.example 為 .env，並填入你的 Gemini API Key
echo "GEMINI_API_KEY=你的_API_KEY_貼在這裡" > .env

# 3. 啟動開發伺服器
npm run dev

```

*開啟瀏覽器訪問顯示的 Local URL (通常是 `http://localhost:5173`) 即可使用。*

---

## 📂 專案結構 (Project Structure)

```text
facesense-ai/
├── app.py                  # Python Flask 後端核心
├── src/
│   ├── components/         # React UI 元件
│   │   ├── Dashboard.tsx   # 數據圖表
│   │   ├── FaceList.tsx    # 人臉卡片列表
│   │   ├── FileUpload.tsx  # 檔案上傳區
│   │   └── ...
│   ├── services/
│   │   ├── geminiService.ts        # 前端 API 串接 (DeepFace)
│   │   └── recommendationService.ts # Gemini AI 推薦邏輯
│   ├── types.ts            # TypeScript 型別定義
│   └── App.tsx             # 主程式入口
├── public/                 # 靜態檔案
└── package.json            # 前端依賴設定
```
## ✨ Acknowledgements
Code assistance and documentation provided by Google Gemini.

Powered by the open-source DeepFace library.
