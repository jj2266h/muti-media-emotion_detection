import { AgeRange, EmotionType, Product } from "../types";

// 模擬雜貨店商品資料庫
const MOCK_INVENTORY = [
  // 零食類
  { id: 's1', name: 'Dark Chocolate 85%', category: 'Snacks', price: 120, tags: [EmotionType.Sad, EmotionType.Fear, AgeRange.Adult, AgeRange.MiddleAge, AgeRange.Senior] },
  { id: 's2', name: 'Rainbow Gummy Bears', category: 'Candy', price: 45, tags: [AgeRange.Child, AgeRange.Teen, EmotionType.Happy] },
  { id: 's3', name: 'Spicy Potato Chips', category: 'Snacks', price: 35, tags: [EmotionType.Anger, EmotionType.Surprise, AgeRange.Teen, AgeRange.YoungAdult] },
  { id: 's4', name: 'Party Mix Bucket', category: 'Snacks', price: 250, tags: [EmotionType.Happy, AgeRange.YoungAdult, AgeRange.Adult] },
  { id: 's5', name: 'Organic Rice Crackers', category: 'Snacks', price: 80, tags: [AgeRange.Senior, AgeRange.Child, EmotionType.Neutral] },
  
  // 飲料類
  { id: 'd1', name: 'Energy Drink XL', category: 'Drinks', price: 60, tags: [EmotionType.Disgust, AgeRange.YoungAdult, AgeRange.Adult] }, // Need energy to deal with it
  { id: 'd2', name: 'Chamomile Tea', category: 'Tea', price: 150, tags: [EmotionType.Fear, EmotionType.Sad, AgeRange.MiddleAge, AgeRange.Senior] },
  { id: 'd3', name: 'Ice Cold Cola', category: 'Drinks', price: 25, tags: [EmotionType.Happy, EmotionType.Anger, AgeRange.Teen] },
  { id: 'd4', name: 'Premium Craft Beer', category: 'Alcohol', price: 180, tags: [EmotionType.Sad, EmotionType.Happy, AgeRange.Adult, AgeRange.MiddleAge] },
  { id: 'd5', name: 'Calcium Milk', category: 'Dairy', price: 90, tags: [AgeRange.Child, AgeRange.Senior] },
  
  // 生活用品/其他
  { id: 'o1', name: 'Lavender Eye Mask', category: 'Wellness', price: 300, tags: [EmotionType.Fear, EmotionType.Sad, AgeRange.Adult] },
  { id: 'o2', name: 'Surprise Toy Box', category: 'Toys', price: 199, tags: [EmotionType.Surprise, AgeRange.Child] },
  { id: 'o3', name: 'Vitamin C 1000mg', category: 'Health', price: 450, tags: [EmotionType.Disgust, AgeRange.MiddleAge, AgeRange.Senior] }, // Sick?
  { id: 'o4', name: 'Chewing Gum (Mint)', category: 'Candy', price: 30, tags: [EmotionType.Anger, EmotionType.Neutral] },
];

/**
 * 根據情緒和年齡推薦商品
 */
export const getRecommendations = (emotion: EmotionType, age: AgeRange): Product[] => {
  // 1. 找出符合情緒 或 符合年齡 的商品
  const relevantProducts = MOCK_INVENTORY.filter(item => {
    return item.tags.includes(emotion) || item.tags.includes(age);
  });

  // 2. 評分排序 (同時符合 情緒+年齡 的優先)
  const scoredProducts = relevantProducts.map(item => {
    let score = 0;
    if (item.tags.includes(emotion)) score += 2;
    if (item.tags.includes(age)) score += 1;
    
    // 隨機擾動，讓推薦不會每次都一模一樣
    score += Math.random() * 0.5;

    // 產生推薦理由
    let reason = "";
    if (item.tags.includes(emotion)) {
        if (emotion === EmotionType.Sad) reason = "Comfort food for you";
        else if (emotion === EmotionType.Happy) reason = "Keep the vibe going!";
        else if (emotion === EmotionType.Anger) reason = "Cool down a bit";
        else if (emotion === EmotionType.Fear) reason = "Something to relax";
        else reason = "Matches your mood";
    } else {
        reason = "Popular for your age";
    }

    return { ...item, score, reason };
  });

  // 3. 排序並取前 3 名
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ id, name, category, price, reason }) => ({
      id, name, category, price, reason
    }));
};