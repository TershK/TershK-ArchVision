import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HOME_STYLES, HomeStyle } from '../types';

interface HomeViewProps {
  onSelectTemplate: (style: HomeStyle) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelectTemplate }) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-full py-12 px-6 fade-in animate-in slide-in-from-bottom-4 duration-700">
      
      {/* House Styles Section */}
      <div className="w-full max-w-[1600px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-slate-800">House Styles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {HOME_STYLES.map((style) => (
            <div 
              key={style.id}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-row h-32 cursor-pointer"
              onClick={() => onSelectTemplate(style.id)}
            >
              {/* Image Section */}
              <div className="w-1/3 h-full relative shrink-0 overflow-hidden">
                <img 
                  src={style.img} 
                  alt={style.label} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1 leading-tight">{style.label}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                    {style.desc}
                  </p>
                </div>
                
                <div className="flex items-center text-primary text-[10px] font-bold uppercase tracking-wider group-hover:underline mt-1">
                  Generate <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Hero */}
      <div className="flex flex-col items-center justify-center mt-20 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to ArchVision</h1>
        <p className="text-slate-600 text-lg">
          Select a house style above or start from scratch in the Generate tab to create AI-powered architectural blueprints and exterior visualizations.
        </p>
      </div>

    </div>
  );
};

export default HomeView;