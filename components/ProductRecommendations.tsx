import React, { useMemo } from 'react';
import { AgeRange, EmotionType, Product } from '../types';
import { getRecommendations } from '../services/recommendationService';
import { ShoppingBag, Tag, DollarSign } from 'lucide-react';

interface ProductRecommendationsProps {
  emotion: EmotionType;
  age: AgeRange;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ emotion, age }) => {
  const products = useMemo(() => getRecommendations(emotion, age), [emotion, age]);

  return (
    <div className="mt-4 pt-3 border-t border-slate-700/50">
      <div className="flex items-center gap-2 mb-3 text-emerald-400">
        <ShoppingBag size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Smart Recommendations</span>
      </div>
      
      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="bg-slate-800 rounded p-2 flex items-center justify-between group hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="flex flex-col">
                <span className="text-sm text-slate-200 font-medium">{product.name}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Tag size={10} /> {product.category} • {product.reason}
                </span>
            </div>
            <div className="flex items-center text-emerald-300 font-mono text-sm font-bold bg-emerald-900/30 px-2 py-1 rounded">
                <DollarSign size={12} className="mr-0.5" />
                {product.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;