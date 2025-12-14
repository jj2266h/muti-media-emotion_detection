import { AnalysisResult, EmotionType, AgeRange, FaceData } from "../types";

// ============================================================================
// 設定區域
// ============================================================================

// 指向我們剛剛建立的 Python Flask Server
const API_ENDPOINT = 'http://localhost:5000/api/analyze'; 

// 關閉模擬數據，改用真實 API
const USE_MOCK_DATA = false; 

// ============================================================================
// 主程式邏輯
// ============================================================================

export const analyzeImage = async (
  file: File, 
  fileId: string
): Promise<AnalysisResult> => {
  const startTime = performance.now();

  // 模擬模式 (如果後端沒開，可以暫時切回 true)
  if (USE_MOCK_DATA) {
     // ... (你可以保留原本的模擬邏輯備用，或直接回傳空)
     return { fileId, fileName: file.name, timestamp: Date.now(), faces: [], processingTimeMs: 0 };
  }

  try {
    const formData = new FormData();
    formData.append('file', file); // 對應 Python 的 request.files['file']

    console.log(`正在發送請求至: ${API_ENDPOINT}`);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`後端錯誤! Status: ${response.status}`);
    }

    const backendData = await response.json();
    console.log("收到 DeepFace 資料:", backendData);

    const endTime = performance.now();
    
    // 轉換資料格式
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
    alert("無法連接後端伺服器。請確認 python app.py 是否正在執行。");
    throw error;
  }
};

// ============================================================================
// 資料轉換層 (Backend JSON -> Frontend Types)
// ============================================================================

// 在 services/geminiService.ts 底部找到這個函式

const mapBackendResponseToFrontend = (backendData: any, fileId: string): FaceData[] => {
  if (!backendData || !Array.isArray(backendData.results)) {
    return [];
  }

  return backendData.results.map((item: any, index: number) => {
    // ... (保留原本的情緒與年齡邏輯) ...

    // 1. 處理情緒 (這部分保持原本的程式碼)
    const rawEmotion = item.emotion || 'neutral';
    const emotionStr = rawEmotion.charAt(0).toUpperCase() + rawEmotion.slice(1);
    let dominantEmotion = EmotionType.Neutral;
    if (Object.values(EmotionType).includes(emotionStr as EmotionType)) {
      dominantEmotion = emotionStr as EmotionType;
    }

    // 2. 處理年齡 (這部分保持原本的程式碼)
    const age = item.age || 25;
    let ageRange = AgeRange.Adult;
    if (age <= 12) ageRange = AgeRange.Child;
    else if (age <= 17) ageRange = AgeRange.Teen;
    else if (age <= 25) ageRange = AgeRange.YoungAdult;
    else if (age <= 40) ageRange = AgeRange.Adult;
    else if (age <= 60) ageRange = AgeRange.MiddleAge;
    else ageRange = AgeRange.Senior;

    return {
      id: `${fileId}-face-${index}`,
      box_2d: item.bbox || [0, 0, 0, 0],
      dominantEmotion: dominantEmotion,
      emotions: [
        { emotion: dominantEmotion, score: 0.95 },
        { emotion: EmotionType.Neutral, score: 0.05 }
      ],
      ageRange: ageRange,
      ageConfidence: item.confidence || 0.8,
      
      // --- 新增這裡：填入後端回傳的資料 ---
      gender: item.gender || "Unknown",
      race: item.race || "Unknown"
    };
  });
};