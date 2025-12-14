import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from "@google/generative-ai";
import { AgeRange, EmotionType, Product } from "../types";

// @ts-ignore
const API_KEY = process.env.GEMINI_API_KEY;

// 如果沒有 Key，在 Console 警告
if (!API_KEY) {
  console.error("錯誤：找不到 GEMINI_API_KEY，請檢查 .env 檔案");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getRecommendations = async (
  emotion: EmotionType, 
  age: AgeRange,
  gender: string,
  race: string
): Promise<Product[]> => {
  try {
    // 設定模型參數
    const model = genAI.getGenerativeModel({ 
      
      model: "gemini-2.5-flash", 
      
      // 強制使用 JSON 模式 (減少格式錯誤)
      generationConfig: {
        responseMimeType: "application/json"
      },

      // 降低安全過濾門檻
      // 依據「人種/性別」推薦，容易觸發敏感詞過濾，所以設為 BLOCK_ONLY_HIGH
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const prompt = `
      You are a smart retail recommendation assistant.
      Recommend exactly 3 creative products for this customer profile:
      - Emotion: ${emotion}
      - Age Group: ${age}
      - Gender: ${gender}
      - Race/Ethnicity: ${race}

      Strict Constraints:
      1. Output MUST be a JSON list of 3 objects.
      2. "name": Max 5 words.
      3. "reason": EXTREMELY SHORT. Max 10-15 words. One sentence only.
      4. "price": Realistic integer USD.

      JSON Schema:
      [{"id": "string", "name": "string", "category": "string", "price": number, "reason": "string"}]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 檢查是否有回傳文字
    const text = response.text();
    if (!text) {
      console.warn("Gemini 回傳空內容，可能是被安全過濾擋住了。");
      throw new Error("Empty response");
    }

    // 因為用了 responseMimeType: "application/json"，通常不需要再 replace markdown
    // makesure
    const cleanText = text.replace(/```json|```/g, "").trim();
    
    const products: Product[] = JSON.parse(cleanText);
    return products;

  } catch (error) {
    console.error("Gemini 推薦發生錯誤:", error);
    
    // 如果AI 講了一些廢話而不是 JSON
    // 回傳預設值讓 UI 不會壞掉
    return [
      {
        id: "err-1",
        name: "Classic Coffee",
        category: "Drinks",
        price: 50,
        reason: "Relax while we fix our AI connection."
      },
      {
        id: "err-2",
        name: "Chocolate Bar",
        category: "Snacks",
        price: 30,
        reason: "Sweet treat works for everyone."
      }
    ];
  }
};