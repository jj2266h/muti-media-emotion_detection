import React from 'react';
import { ScanFace, UserRound, Sparkles, BrainCircuit } from 'lucide-react';

interface ProcessingStateProps {
  currentStep: number; // 0: Idle, 1: Detection, 2: Alignment, 3: Inference
}

const steps = [
  { icon: ScanFace, label: "Face Detection", desc: "Locating ROIs" },
  { icon: UserRound, label: "Alignment", desc: "Landmark norm." },
  { icon: BrainCircuit, label: "Inference", desc: "Analysis model" },
];

const ProcessingState: React.FC<ProcessingStateProps> = ({ currentStep }) => {
  if (currentStep === 0) return null;

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-6 mt-6 shadow-xl">
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 transition-all duration-700 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, idx) => {
          const isActive = currentStep >= idx + 1;
          const isCurrent = currentStep === idx + 1;
          
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${isActive 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                    : 'bg-slate-800 border-slate-600 text-slate-500'
                  }
                  ${isCurrent ? 'animate-pulse scale-110' : ''}
                `}
              >
                <step.icon size={20} />
              </div>
              <div className={`mt-3 text-center transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                <p className="text-xs font-bold uppercase tracking-wider">{step.label}</p>
                <p className="text-[10px] text-slate-500 font-mono">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingState;
