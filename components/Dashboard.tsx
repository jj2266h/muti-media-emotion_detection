import React, { useMemo } from 'react';
import { AnalysisResult, EmotionType, AgeRange } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { Users, Activity, Clock } from 'lucide-react';

interface DashboardProps {
  results: AnalysisResult[];
}

const COLORS = {
  [EmotionType.Happy]: '#4ade80',   // Green
  [EmotionType.Sad]: '#60a5fa',     // Blue
  [EmotionType.Fear]: '#a855f7',    // Purple
  [EmotionType.Anger]: '#f87171',   // Red
  [EmotionType.Surprise]: '#facc15', // Yellow
  [EmotionType.Disgust]: '#22c55e', // Green-ish
  [EmotionType.Neutral]: '#94a3b8', // Gray
};

const AGE_COLORS = {
  [AgeRange.Child]: '#38bdf8',
  [AgeRange.Teen]: '#818cf8',
  [AgeRange.YoungAdult]: '#c084fc',
  [AgeRange.Adult]: '#e879f9',
  [AgeRange.MiddleAge]: '#f472b6',
  [AgeRange.Senior]: '#fb7185',
};

const Dashboard: React.FC<DashboardProps> = ({ results }) => {
  const allFaces = useMemo(() => results.flatMap(r => r.faces), [results]);

  // --- Aggregation for Emotions (Pie Chart) ---
  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    // Summing up probabilistic scores instead of hard counts for smoother charts
    allFaces.forEach(face => {
      face.emotions.forEach(e => {
        counts[e.emotion] = (counts[e.emotion] || 0) + e.score;
        total += e.score;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, percentage: (value / total) * 100 }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [allFaces]);

  // --- Aggregation for Age (Bar Chart) ---
  const ageData = useMemo(() => {
    const counts: Record<string, number> = {};
    const confidences: Record<string, number[]> = {};

    allFaces.forEach(face => {
      counts[face.ageRange] = (counts[face.ageRange] || 0) + 1;
      if (!confidences[face.ageRange]) confidences[face.ageRange] = [];
      confidences[face.ageRange].push(face.ageConfidence);
    });

    return Object.values(AgeRange).map(range => ({
      name: range,
      count: counts[range] || 0,
      avgConfidence: confidences[range] 
        ? (confidences[range].reduce((a,b)=>a+b,0) / confidences[range].length * 100).toFixed(1) 
        : 0
    }));
  }, [allFaces]);

  // --- Time Series / Sequence Data (Area Chart) ---
  const timeSeriesData = useMemo(() => {
    // If multiple files, treat file index as time step
    return results.map((res, idx) => {
        const avgEmotions: Record<string, number> = {};
        
        // Initialize
        Object.values(EmotionType).forEach(e => avgEmotions[e] = 0);

        // Average emotions for all faces in this frame/file
        res.faces.forEach(face => {
            face.emotions.forEach(e => {
                avgEmotions[e.emotion] += e.score;
            });
        });

        const faceCount = res.faces.length || 1;
        const entry: any = { name: `T${idx + 1}` };
        
        Object.keys(avgEmotions).forEach(key => {
            entry[key] = (avgEmotions[key] / faceCount).toFixed(2);
        });
        
        return entry;
    });
  }, [results]);

  if (results.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Users size={18} />
            <span className="text-sm font-medium">Total Faces Analyzed</span>
          </div>
          <div className="text-3xl font-bold text-white">{allFaces.length}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Activity size={18} />
            <span className="text-sm font-medium">Dominant Emotion</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {emotionData.length > 0 ? emotionData[0].name : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {emotionData.length > 0 ? `${emotionData[0].percentage.toFixed(1)}% of aggregate` : ''}
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Clock size={18} />
            <span className="text-sm font-medium">Processing Time</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {results.reduce((a, b) => a + b.processingTimeMs, 0)} <span className="text-base font-normal text-slate-500">ms</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Aggregate Emotion Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as EmotionType] || '#ccc'} stroke="rgba(0,0,0,0.2)" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Age Demographics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} />
                <RechartsTooltip
                   cursor={{fill: '#334155', opacity: 0.2}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AGE_COLORS[entry.name as AgeRange] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Series / Sequence Analysis */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-lg lg:col-span-2">
           <h3 className="text-lg font-semibold text-white mb-2">Temporal Emotion Analysis</h3>
           <p className="text-sm text-slate-400 mb-6">Tracking emotional shifts across the uploaded sequence (frames/files).</p>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={timeSeriesData}>
                 <defs>
                   <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={COLORS[EmotionType.Happy]} stopOpacity={0.8}/>
                     <stop offset="95%" stopColor={COLORS[EmotionType.Happy]} stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorSad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={COLORS[EmotionType.Sad]} stopOpacity={0.8}/>
                     <stop offset="95%" stopColor={COLORS[EmotionType.Sad]} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                 <Legend />
                 {/* Only showing top 3 distinct emotions to avoid clutter, or specifically requested ones */}
                 <Area type="monotone" dataKey={EmotionType.Happy} stroke={COLORS[EmotionType.Happy]} fillOpacity={1} fill="url(#colorHappy)" stackId="1" />
                 <Area type="monotone" dataKey={EmotionType.Surprise} stroke={COLORS[EmotionType.Surprise]} fillOpacity={1} fill={COLORS[EmotionType.Surprise]} stackId="1" />
                 <Area type="monotone" dataKey={EmotionType.Sad} stroke={COLORS[EmotionType.Sad]} fillOpacity={1} fill="url(#colorSad)" stackId="1" />
                 <Area type="monotone" dataKey={EmotionType.Anger} stroke={COLORS[EmotionType.Anger]} fillOpacity={1} fill={COLORS[EmotionType.Anger]} stackId="1" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
