import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, Ruler, Sparkles, MessageSquarePlus, Save, 
  Map as MapIcon, Image as ImageIcon, Layers, Layout, 
  CheckCircle, Loader2, Download, Clock, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import Accordion from './Accordion';
import { DesignConfig, HomeStyle, HOME_STYLES, AVAILABLE_FEATURES } from '../types';
import { generateBlueprint, generateExterior, validateCustomInstructions } from '../services/geminiService';

interface ImagePreviewProps {
  src: string;
  alt: string;
  title: string;
  onDownload: () => void;
  isDarkBackground?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, title, onDownload, isDarkBackground }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset position on full zoom out
      return newScale;
    });
  };
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 z-10 select-none">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          {title}
        </span>
        <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm p-1">
          <button 
            onClick={handleZoomOut} 
            disabled={scale <= 1}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-medium text-slate-600 w-10 text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={handleZoomIn} 
            disabled={scale >= 5}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-200 mx-1"></div>
          <button 
            onClick={handleReset} 
            disabled={scale === 1}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-200 mx-1"></div>
          <button 
            onClick={onDownload}
            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div 
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 ${isDarkBackground ? 'bg-slate-900' : 'bg-slate-50'} ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
          <img 
            src={src} 
            alt={alt} 
            draggable={false}
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              maxHeight: '100%',
              maxWidth: '100%'
            }} 
            className={`object-contain shadow-lg ${isDarkBackground ? '' : 'bg-white'}`} 
          />
          
          {scale > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none backdrop-blur-sm">
              Drag to pan
            </div>
          )}
      </div>
    </div>
  );
};

interface GenerateViewProps {
  config: DesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<DesignConfig>>;
  blueprint: string | null;
  setBlueprint: React.Dispatch<React.SetStateAction<string | null>>;
  exterior: string | null;
  setExterior: React.Dispatch<React.SetStateAction<string | null>>;
  generationTime: number | null;
  setGenerationTime: React.Dispatch<React.SetStateAction<number | null>>;
  onSave: () => void;
  autoGenerate?: boolean;
  onAutoGenerateComplete?: () => void;
}

const GenerateView: React.FC<GenerateViewProps> = ({ 
  config, setConfig, 
  blueprint, setBlueprint, 
  exterior, setExterior, 
  generationTime, setGenerationTime,
  onSave,
  autoGenerate,
  onAutoGenerateComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Live timer effect
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const startTime = Date.now();
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const handleGenerate = async (type: 'blueprint' | 'exterior' | 'both') => {
    setIsGenerating(true);
    setGenerationTime(null);
    const startTime = Date.now();
    
    try {
      // Step 1: Validate Instructions
      if (config.customInstructions && config.customInstructions.trim()) {
        setLoadingStep("Validating instructions...");
        const isValid = await validateCustomInstructions(config.customInstructions);
        if (!isValid) {
          throw new Error("Validation Error: Custom instructions must be related to houses or architecture.");
        }
      }

      // Step 2: Generate Content
      if (type === 'both') {
        setLoadingStep("Generating blueprint and exterior...");
        const [bp, ext] = await Promise.all([
          generateBlueprint(config),
          generateExterior(config)
        ]);
        setBlueprint(bp);
        setExterior(ext);
      } else if (type === 'blueprint') {
        setLoadingStep("Drafting architectural blueprint...");
        const bp = await generateBlueprint(config);
        setBlueprint(bp);
      } else if (type === 'exterior') {
        setLoadingStep("Rendering photorealistic exterior...");
        const ext = await generateExterior(config);
        setExterior(ext);
      }
      
      const totalTime = (Date.now() - startTime) / 1000;
      setGenerationTime(totalTime);
      setElapsedTime(totalTime); // Freeze timer at final time

    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("Validation Error")) {
        alert(e.message);
      } else {
        alert("Failed to call the Gemini API: permission denied or API key error. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      setLoadingStep("");
    }
  };

  // Trigger auto-generation if enabled
  useEffect(() => {
    if (autoGenerate) {
      handleGenerate('both');
      onAutoGenerateComplete?.();
    }
  }, [autoGenerate]);

  const downloadImage = (url: string, prefix: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `archvision-${prefix}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBoth = () => {
    if (blueprint) downloadImage(blueprint, 'blueprint');
    if (exterior) {
      setTimeout(() => downloadImage(exterior, 'exterior'), 500);
    }
  };

  const updateFeature = (feature: string) => {
    setConfig(prev => {
      const exists = prev.features.includes(feature);
      if (exists) {
        return { ...prev, features: prev.features.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...prev.features, feature] };
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            disabled={isGenerating}
            onClick={() => handleGenerate('blueprint')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <MapIcon className="w-4 h-4" />
            Generate Blueprint
          </button>
          <button 
             disabled={isGenerating}
            onClick={() => handleGenerate('exterior')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            Generate Exterior
          </button>
          <button 
             disabled={isGenerating}
            onClick={() => handleGenerate('both')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <Layers className="w-4 h-4" />
            Generate Both
          </button>

          {(isGenerating || generationTime) && (
             <div className="flex items-center gap-2 text-sm font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
               <Clock className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
               {isGenerating ? elapsedTime.toFixed(1) : generationTime?.toFixed(1)}s
             </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {blueprint && exterior && (
             <button 
              onClick={handleDownloadBoth}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          )}

          <button 
            onClick={onSave}
            disabled={!blueprint && !exterior}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save to Library
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Configuration */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Layout className="w-5 h-5 text-primary" />
              Configuration
            </h2>

            {/* Home Style */}
            <Accordion 
              title="Home Style" 
              icon={<Paintbrush className="w-4 h-4 text-primary" />}
              defaultOpen={true}
            >
              <div className="space-y-2">
                {HOME_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setConfig({ ...config, style: s.id })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex justify-between items-center ${
                      config.style === s.id 
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{s.label}</span>
                    {config.style === s.id && <CheckCircle className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </Accordion>

            {/* Dimensions */}
            <Accordion 
              title="Dimensions" 
              icon={<Ruler className="w-4 h-4 text-primary" />}
              defaultOpen={true}
            >
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Bedrooms</span>
                    <span className="font-medium text-slate-700">{config.bedrooms}</span>
                  </div>
                  <input 
                    type="range" min="1" max="8" step="1"
                    value={config.bedrooms}
                    onChange={(e) => setConfig({...config, bedrooms: parseInt(e.target.value)})}
                    className="w-full accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Levels</span>
                    <span className="font-medium text-slate-700">{config.levels}</span>
                  </div>
                  <input 
                    type="range" min="1" max="4" step="1"
                    value={config.levels}
                    onChange={(e) => setConfig({...config, levels: parseInt(e.target.value)})}
                    className="w-full accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Bathrooms</span>
                    <span className="font-medium text-slate-700">{config.bathrooms}</span>
                  </div>
                  <input 
                    type="range" min="1" max="8" step="0.5"
                    value={config.bathrooms}
                    onChange={(e) => setConfig({...config, bathrooms: parseFloat(e.target.value)})}
                    className="w-full accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                 <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Lot Size</span>
                    <span className="font-medium text-slate-700">{config.lotSize} m²</span>
                  </div>
                  <input 
                    type="range" min="100" max="2000" step="50"
                    value={config.lotSize}
                    onChange={(e) => setConfig({...config, lotSize: parseInt(e.target.value)})}
                    className="w-full accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </Accordion>

            {/* Features */}
            <Accordion 
              title="Features" 
              icon={<Sparkles className="w-4 h-4 text-primary" />}
            >
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FEATURES.map(feat => (
                  <button
                    key={feat}
                    onClick={() => updateFeature(feat)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      config.features.includes(feat)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {feat}
                  </button>
                ))}
              </div>
            </Accordion>

            {/* Custom Instructions */}
            <Accordion 
              title="Custom Instructions" 
              icon={<MessageSquarePlus className="w-4 h-4 text-primary" />}
            >
              <textarea
                value={config.customInstructions}
                onChange={(e) => setConfig({...config, customInstructions: e.target.value})}
                placeholder="Add specific details (e.g., 'red brick facade', 'large oak tree in front')..."
                className="w-full h-24 text-sm p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </Accordion>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto p-6 flex flex-col">
          
          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-slate-700">Generating Design...</p>
                <div className="flex flex-col items-center mt-2 gap-1">
                  <p className="text-sm text-slate-500">{loadingStep}</p>
                  <p className="text-xs font-mono text-slate-400">{elapsedTime.toFixed(1)}s</p>
                </div>
            </div>
          ) : (!blueprint && !exterior) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                 <ImageIcon className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Visualize</h3>
               <p className="text-slate-500 text-center max-w-md">
                 Configure your dream home parameters in the sidebar to the left and click generate to create AI-powered architectural blueprints and exterior visualizations.
               </p>
            </div>
          ) : (
            <div className={`flex-1 grid grid-cols-1 ${blueprint && exterior ? 'lg:grid-cols-2' : ''} gap-6 h-full min-h-[500px]`}>
              
              {/* Blueprint Panel - Show only if blueprint is available */}
              {blueprint && (
                <ImagePreview 
                  src={blueprint} 
                  alt="Blueprint" 
                  title="Blueprint View" 
                  onDownload={() => downloadImage(blueprint, 'blueprint')} 
                />
              )}

              {/* Exterior Panel - Show only if exterior is available */}
              {exterior && (
                <ImagePreview 
                  src={exterior} 
                  alt="Exterior" 
                  title="Exterior Render" 
                  onDownload={() => downloadImage(exterior, 'exterior')}
                  isDarkBackground={true}
                />
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateView;