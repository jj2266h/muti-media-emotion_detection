import React, { useState, useEffect } from 'react';
import { AgeRange, EmotionType, Product } from '../types';
import { getRecommendations } from '../services/recommendationService';
import { ShoppingBag, Tag, DollarSign, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductRecommendationsProps {
  emotion: EmotionType;
  age: AgeRange;
  gender?: string;
  race?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ 
  emotion, 
  age, 
  gender = "Unknown", 
  race = "Unknown" 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔴 新增：用來記錄哪一個商品的 ID 被點開了 (null 代表都沒開)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      // 隨機延遲避免 API 速率限制
      const delay = Math.random() * 3000; 
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (!isMounted) return;

      setIsLoading(true);
      try {
        const data = await getRecommendations(emotion, age, gender, race);
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [emotion, age, gender, race]);

  // 🔴 新增：切換展開/收合的邏輯
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-700/50">
      <div className="flex items-center gap-2 mb-3 text-emerald-400">
        <ShoppingBag size={16} />
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          AI Recommendations <Sparkles size={10} />
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-4 text-slate-500 space-y-2">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Consulting Gemini AI...</span>
        </div>
      ) : (
        <div className="space-y-2 animate-in fade-in duration-500">
          {products.map((product) => {
            // 判斷目前這個商品是否被展開
            const isExpanded = expandedId === product.id;

            return (
              <div 
                key={product.id} 
                // 🔴 新增 onClick 事件
                onClick={() => toggleExpand(product.id)}
                className={`
                  bg-slate-800 rounded p-2 flex flex-col justify-between group 
                  hover:bg-slate-700 transition-all cursor-pointer border border-slate-700/50 
                  hover:border-emerald-500/30 relative
                  ${isExpanded ? 'bg-slate-750 border-emerald-500/50' : ''}
                `}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex flex-col flex-1 mr-2 min-w-0">
                      
                      {/* 商品名稱：展開時顯示全部，收合時截斷 */}
                      <span className={`text-sm text-slate-200 font-medium block ${isExpanded ? '' : 'truncate'}`}>
                        {product.name}
                      </span>
                      
                      <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                          <span className="bg-slate-700/50 px-1.5 py-0.5 rounded flex-shrink-0 flex items-center">
                            <Tag size={8} className="mr-1"/>{product.category}
                          </span>

                          {/* 🔴 關鍵修改：條件式 class */}
                          {/* 如果展開 (isExpanded) -> 顯示全部內容 */}
                          {/* 如果收合 (!isExpanded) -> line-clamp-2 (限制兩行) */}
                          <span className={`text-emerald-400/80 leading-tight ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {product.reason}
                          </span>
                      </div>
                  </div>

                  {/* 價格與箭頭 */}
                  <div className="flex flex-col items-end pl-2 ml-1 space-y-1">
                     <div className="flex items-center text-emerald-300 font-mono text-sm font-bold bg-emerald-900/20 px-2 py-1 rounded">
                        <DollarSign size={12} className="mr-0.5" />
                        {product.price}
                     </div>
                     {/* 視覺提示：箭頭 icon */}
                     <div className="text-slate-600">
                        {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;