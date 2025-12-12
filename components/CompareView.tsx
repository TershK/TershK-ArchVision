import React from 'react';
import { GeneratedDesign } from '../types';
import { CheckCircle2, Building, Zap, Brush, Layout, Box, ArrowRight, Columns } from 'lucide-react';

interface CompareViewProps {
  items: GeneratedDesign[];
}

const CompareView: React.FC<CompareViewProps> = ({ items }) => {
  
  const metrics = [
    { name: "Architectural Detail", icon: Building },
    { name: "Lighting Quality", icon: Zap },
    { name: "Material Rendering", icon: Brush },
    { name: "Composition", icon: Layout },
    { name: "Realism Score", icon: Box },
  ];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
           <Columns className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">No Designs to Compare</h2>
        <p className="text-center max-w-md">
          Your library is empty. Generate and save some designs to compare their quality metrics here.
        </p>
      </div>
    );
  }

  // Calculate Average Scores per item
  const getAverage = (scores: number[]) => {
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8 flex-shrink-0">
         <h2 className="text-2xl font-bold text-slate-800">Quality Comparison Matrix</h2>
         <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{items.length} Saved Designs</span>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-w-max inline-block">
          
          {/* Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <div className="w-48 p-4 font-semibold text-slate-500 text-sm sticky left-0 bg-slate-50 border-r border-slate-200/50 z-10 flex items-center">
              Quality Metric
            </div>
            {items.map((item, index) => (
              <div key={item.id} className="w-48 p-4 flex flex-col items-center text-center border-r border-slate-100 last:border-0">
                <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-slate-200 border border-slate-200 relative group">
                  {item.exteriorUrl ? (
                     <img src={item.exteriorUrl} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                    #{items.length - index}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 truncate w-full px-2" title={item.config.style}>
                  {item.config.style}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          {/* Metric Rows */}
          {metrics.map((metric, idx) => (
            <div key={metric.name} className="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="w-48 p-4 flex flex-col justify-center sticky left-0 bg-white hover:bg-slate-50 border-r border-slate-200/50 z-10">
                 <div className="flex items-center gap-2">
                   <metric.icon className="w-3.5 h-3.5 text-slate-400" />
                   <span className="font-medium text-slate-700 text-sm">{metric.name}</span>
                 </div>
              </div>
              {items.map(item => {
                const score = item.scores[idx];
                const isHigh = score >= 9;
                return (
                  <div key={item.id} className="w-48 p-4 flex items-center justify-center border-r border-slate-100 last:border-0">
                    <span className={`text-sm font-bold ${isHigh ? 'text-green-600' : 'text-slate-600'}`}>
                      {score}/10
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Average Row */}
          <div className="flex bg-slate-50 rounded-b-xl border-t border-slate-200">
             <div className="w-48 p-4 font-bold text-slate-800 flex items-center sticky left-0 bg-slate-50 border-r border-slate-200/50 z-10">
               Average Score
             </div>
             {items.map(item => {
                const avg = getAverage(item.scores);
                return (
                  <div key={item.id} className="w-48 p-4 flex flex-col items-center justify-center border-r border-slate-100 last:border-0">
                     <div className="px-3 py-1 rounded-full bg-slate-800 text-white text-sm font-bold shadow-sm">
                       {avg}/10
                     </div>
                     {parseFloat(avg) > 9 && (
                       <div className="mt-2 flex items-center text-[10px] text-green-600 font-medium">
                         <CheckCircle2 className="w-3 h-3 mr-1" />
                         Recommended
                       </div>
                     )}
                  </div>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompareView;