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

const mapBackendResponseToFrontend = (backendData: any, fileId: string): FaceData[] => {
  if (!backendData || !Array.isArray(backendData.results)) {
    return [];
  }

  return backendData.results.map((item: any, index: number) => {
    // 1. 處理情緒字串轉換 (DeepFace 的輸出轉為 EmotionType Enum)
    const rawEmotion = item.emotion || 'neutral';
    // DeepFace 輸出可能是小寫，首字大寫化以符合 Enum
    const emotionStr = rawEmotion.charAt(0).toUpperCase() + rawEmotion.slice(1);
    
    let dominantEmotion = EmotionType.Neutral;
    if (Object.values(EmotionType).includes(emotionStr as EmotionType)) {
      dominantEmotion = emotionStr as EmotionType;
    }

    // 2. 處理年齡區間 (DeepFace 直接給數字)
    const age = item.age || 25;
    let ageRange = AgeRange.Adult;
    if (age <= 12) ageRange = AgeRange.Child;
    else if (age <= 17) ageRange = AgeRange.Teen;
    else if (age <= 25) ageRange = AgeRange.YoungAdult;
    else if (age <= 40) ageRange = AgeRange.Adult;
    else if (age <= 60) ageRange = AgeRange.MiddleAge;
    else ageRange = AgeRange.Senior;

    // 3. 處理性別或種族 (如果你需要在前端顯示這些，可以在 types.ts FaceData 擴充欄位)
    // 目前你的 FaceData 只有情緒和年齡，所以我們只取這兩個。
    // 如果你想顯示種族，建議修改 types.ts 加入 race 欄位。

    return {
      id: `${fileId}-face-${index}`,
      box_2d: item.bbox || [0, 0, 0, 0], 
      dominantEmotion: dominantEmotion,
      // 建構模擬的分數分佈 (DeepFace 如果沒回傳詳細機率，就給 dominant 100%)
      emotions: [
        { emotion: dominantEmotion, score: 0.95 },
        { emotion: EmotionType.Neutral, score: 0.05 }
      ],
      ageRange: ageRange,
      ageConfidence: item.confidence || 0.8
    };
  });
};