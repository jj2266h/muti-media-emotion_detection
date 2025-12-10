import { AnalysisResult, EmotionType, AgeRange, FaceData } from "../types";

// ============================================================================
// 設定區域 (CONFIGURATION)
// ============================================================================

// 1. 請將這裡改成您組員的 API 網址 (後端接口)
// 例如: 'http://localhost:5000/api/detect_faces' 或 'http://127.0.0.1:8000/predict'
const API_ENDPOINT = 'http://localhost:5000/api/analyze'; 

// 2. 如果您目前還沒有後端，想先測試 UI，請將此變數設為 true
const USE_MOCK_DATA = true; 

// ============================================================================
// 主程式邏輯
// ============================================================================

export const analyzeImage = async (
  file: File, 
  fileId: string
): Promise<AnalysisResult> => {
  const startTime = performance.now();

  // 如果開啟模擬模式，直接回傳假資料 (方便您開發 UI)
  if (USE_MOCK_DATA) {
    console.log("目前使用模擬數據 (Mock Mode)");
    await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬延遲
    return generateMockData(file, fileId, startTime);
  }

  // --- 真實串接區域 (Real Integration) ---
  try {
    const formData = new FormData();
    // 'file' 是後端接收檔案時的參數名稱，請確認組員是用 'file', 'image' 還是其他名稱
    formData.append('file', file); 

    console.log(`正在發送請求至: ${API_ENDPOINT}`);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      // 注意: 當使用 FormData 時，瀏覽器會自動設定 Content-Type，不需要手動設定 header
    });

    if (!response.ok) {
      throw new Error(`後端錯誤! Status: ${response.status}`);
    }

    // 取得組員後端回傳的原始 JSON
    const backendData = await response.json();
    console.log("收到後端資料:", backendData);

    const endTime = performance.now();

    // 關鍵步驟: 將組員的資料格式轉換成前端需要的格式
    const processedFaces = mapBackendResponseToFrontend(backendData, fileId);

    return {
      fileId,
      fileName: file.name,
      timestamp: Date.now(),
      faces: processedFaces,
      processingTimeMs: Math.round(endTime - startTime)
    };

  } catch (error) {
    console.error("API 串接失敗:", error);
    throw error;
  }
};

// ============================================================================
// 資料轉換層 (ADAPTER) - 最重要的部分
// ============================================================================

/**
 * 這個函數負責將您組員回傳的 JSON 格式，轉換成前端 UI 看得懂的 TypeScript 格式。
 * 您需要根據組員實際回傳的欄位名稱來修改這裡。
 */
const mapBackendResponseToFrontend = (backendData: any, fileId: string): FaceData[] => {
  // 假設組員回傳的格式是: { "results": [ { "bbox": [], "emotion": "happy", "age": "20-30" } ] }
  // 您需要依據實際情況修改下方的程式碼
  
  // 如果後端回傳的是空或是錯誤格式，回傳空陣列
  if (!backendData || !Array.isArray(backendData.results)) {
    console.warn("後端回傳格式不符預期，或是沒有偵測到人臉");
    return [];
  }

  return backendData.results.map((item: any, index: number) => {
    // 1. 處理情緒 (Emotions)
    // 假設後端直接回傳最強烈的情緒字串，我們需要自己建構 distribution 用於圖表顯示
    // 如果後端有回傳詳細分數 (例如 {'happy': 0.9, 'sad': 0.1}) 會更好，直接填入即可
    const emotionStr = (item.emotion || 'Neutral').charAt(0).toUpperCase() + (item.emotion || 'Neutral').slice(1);
    
    // 這裡做一個簡單的轉換，確保字串符合 EmotionType
    const dominantEmotion = Object.values(EmotionType).includes(emotionStr as EmotionType)
      ? (emotionStr as EmotionType)
      : EmotionType.Neutral;

    // 2. 處理年齡 (Age)
    // 假設後端回傳 "25"，我們需要將其分類到 AgeRange
    let ageRange = AgeRange.Adult;
    const detectedAge = parseInt(item.age, 10);
    
    if (detectedAge <= 12) ageRange = AgeRange.Child;
    else if (detectedAge <= 17) ageRange = AgeRange.Teen;
    else if (detectedAge <= 25) ageRange = AgeRange.YoungAdult;
    else if (detectedAge <= 40) ageRange = AgeRange.Adult;
    else if (detectedAge <= 60) ageRange = AgeRange.MiddleAge;
    else ageRange = AgeRange.Senior;

    return {
      id: `${fileId}-face-${index}`,
      box_2d: item.bbox || [0, 0, 0, 0], // [ymin, xmin, ymax, xmax]
      dominantEmotion: dominantEmotion,
      // 如果後端沒有回傳詳細分數，我們人工製造一個 100% 的分數給圖表用
      emotions: [
        { emotion: dominantEmotion, score: 0.9 },
        { emotion: EmotionType.Neutral, score: 0.1 }
      ], 
      ageRange: ageRange, // 或者直接使用 item.age_group 如果後端有做分類
      ageConfidence: item.confidence || 0.85
    };
  });
};


// ============================================================================
// 模擬數據產生器 (Mock Generator) - 用於測試 UI
// ============================================================================
const generateMockData = (file: File, fileId: string, startTime: number): AnalysisResult => {
  const endTime = performance.now();
  
  // 隨機產生 1~3 張臉
  const faceCount = Math.floor(Math.random() * 3) + 1;
  const faces: FaceData[] = [];

  for (let i = 0; i < faceCount; i++) {
    // 隨機情緒
    const emotions = Object.values(EmotionType);
    const primaryEmotion = emotions[Math.floor(Math.random() * (emotions.length - 1))]; // Exclude Neutral mostly
    
    // 隨機產生分數分佈
    const emotionScores = emotions.map(e => ({
      emotion: e,
      score: e === primaryEmotion ? Math.random() * 0.4 + 0.4 : Math.random() * 0.1
    })).sort((a, b) => b.score - a.score);

    // 隨機年齡
    const ageRanges = Object.values(AgeRange);
    const randomAge = ageRanges[Math.floor(Math.random() * ageRanges.length)];

    faces.push({
      id: `${fileId}-face-${i}`,
      box_2d: [100, 100, 200, 200],
      emotions: emotionScores,
      dominantEmotion: primaryEmotion,
      ageRange: randomAge,
      ageConfidence: Math.random() * 0.2 + 0.8
    });
  }

  return {
    fileId,
    fileName: file.name,
    timestamp: Date.now(),
    faces,
    processingTimeMs: Math.round(endTime - startTime)
  };
};
