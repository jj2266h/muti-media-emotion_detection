export enum EmotionType {
  Happy = 'Happy',
  Sad = 'Sad',
  Fear = 'Fear',
  Anger = 'Anger',
  Surprise = 'Surprise',
  Disgust = 'Disgust',
  Neutral = 'Neutral' // Useful for baseline
}

export enum AgeRange {
  Child = '0-12',
  Teen = '13-17',
  YoungAdult = '18-25',
  Adult = '26-40',
  MiddleAge = '41-60',
  Senior = '60+'
}

export interface EmotionScore {
  emotion: EmotionType;
  score: number; // 0 to 1
}

export interface FaceData {
  id: string;
  box_2d?: number[]; // [ymin, xmin, ymax, xmax]
  emotions: EmotionScore[];
  dominantEmotion: EmotionType;
  ageRange: AgeRange;
  ageConfidence: number;
}

export interface AnalysisResult {
  fileId: string;
  fileName: string;
  timestamp: number;
  faces: FaceData[];
  processingTimeMs: number;
}

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
}

// --- New Recommendation Types ---

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string; // Optional URL, otherwise we use icons
  reason: string; // Why was this recommended?
}