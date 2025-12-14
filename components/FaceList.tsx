import React from 'react';
import { FaceData, EmotionType } from '../types';
import ProductRecommendations from './ProductRecommendations';
// 新增 User 和 Globe 圖示
import { User, Globe } from 'lucide-react';

interface FaceListProps {
  faces: FaceData[];
  fileName: string;
}

const FaceList: React.FC<FaceListProps> = ({ faces, fileName }) => {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 mt-4">
      <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">
        Details: {fileName}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faces.map((face) => (
          <div key={face.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 flex flex-col h-full">
            
            {/* Top Section: Face Stats */}
            <div className="flex items-start space-x-3 mb-2">
                {/* Emoji 顯示部分保持不變 */}
                <div className="h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600 flex-shrink-0 text-2xl shadow-lg">
                {face.dominantEmotion === EmotionType.Happy ? '😄' :
                    face.dominantEmotion === EmotionType.Sad ? '😢' :
                    face.dominantEmotion === EmotionType.Anger ? '😡' :
                    face.dominantEmotion === EmotionType.Fear ? '😱' :
                    face.dominantEmotion === EmotionType.Surprise ? '😲' :
                    face.dominantEmotion === EmotionType.Disgust ? '🤢' : '😐'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-bold text-lg truncate">{face.dominantEmotion}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-800">
                      {face.ageRange}
                      </span>
                  </div>

                  {/* --- 新增區塊：顯示性別與人種 --- */}
                  <div className="flex gap-2 mt-2 mb-2">
                    <div className="flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                      <User size={10} />
                      <span className="capitalize">{face.gender}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                      <Globe size={10} />
                      <span className="capitalize">{face.race}</span>
                    </div>
                  </div>
                  
                  {/* Confidence Bar (保留原本的信心分數條) */}
                  <div className="space-y-1 mt-2">
                      {face.emotions.slice(0, 2).map((e) => (
                      <div key={e.emotion} className="flex items-center text-[10px] text-slate-400">
                          <span className="w-12 truncate font-medium">{e.emotion}</span>
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full mx-2 overflow-hidden">
                          <div 
                              className={`h-full rounded-full ${e.emotion === face.dominantEmotion ? 'bg-blue-400' : 'bg-slate-500'}`}
                              style={{ width: `${e.score * 100}%` }}
                          ></div>
                          </div>
                          <span>{(e.score * 100).toFixed(0)}%</span>
                      </div>
                      ))}
                  </div>
                </div>
            </div>

            {/* Bottom Section: Recommendations (保持不變) */}
            <div className="mt-auto">
                <ProductRecommendations emotion={face.dominantEmotion} age={face.ageRange} gender={face.gender}race={face.race}/>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default FaceList;