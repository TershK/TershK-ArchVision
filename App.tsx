import React, { useState } from 'react';
import { Layout, Home, Library, Columns } from 'lucide-react';
import { ViewMode, HomeStyle, DesignConfig, GeneratedDesign, HOME_STYLES } from './types';
import HomeView from './components/HomeView';
import GenerateView from './components/GenerateView';
import LibraryView from './components/LibraryView';
import CompareView from './components/CompareView';

// Initial Configuration State
const INITIAL_CONFIG: DesignConfig = {
  style: HomeStyle.LUXURY,
  bedrooms: 4,
  bathrooms: 3,
  levels: 2,
  lotSize: 800,
  features: ["Garage", "Garden", "Pool"],
  customInstructions: ""
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [config, setConfig] = useState<DesignConfig>(INITIAL_CONFIG);
  const [library, setLibrary] = useState<GeneratedDesign[]>([]);
  
  // Lifted state for the Generate workspace
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [exterior, setExterior] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  // Auto-generation trigger
  const [autoGenerate, setAutoGenerate] = useState<boolean>(false);

  // Navigate to generate with a specific style pre-selected
  const handleSelectTemplate = (style: HomeStyle) => {
    setConfig({
      ...INITIAL_CONFIG,
      style: style
    });
    // Reset workspace
    setBlueprint(null);
    setExterior(null);
    setGenerationTime(null);
    // Trigger auto-generation
    setAutoGenerate(true);
    setCurrentView(ViewMode.GENERATE);
  };

  const handleEditDesign = (design: GeneratedDesign) => {
    setConfig(design.config);
    setBlueprint(design.blueprintUrl || null);
    setExterior(design.exteriorUrl || null);
    setGenerationTime(design.generationTime || null);
    setAutoGenerate(false);
    setCurrentView(ViewMode.GENERATE);
  };

  const handleSaveToLibrary = () => {
    // Generate mock scores for the comparison matrix
    // In a real app, this might come from the AI analysis
    const scores = Array.from({ length: 5 }, () => Math.floor(Math.random() * 3) + 7); // Random scores 7-10

    const newDesign: GeneratedDesign = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      config: { ...config },
      blueprintUrl: blueprint || undefined,
      exteriorUrl: exterior || undefined,
      scores: scores,
      generationTime: generationTime || undefined
    };
    setLibrary([newDesign, ...library]);
    setCurrentView(ViewMode.LIBRARY);
  };

  const handleDeleteFromLibrary = (id: string) => {
    setLibrary(library.filter(item => item.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case ViewMode.HOME:
        return <HomeView onSelectTemplate={handleSelectTemplate} />;
      case ViewMode.GENERATE:
        return (
          <GenerateView 
            config={config} 
            setConfig={setConfig} 
            blueprint={blueprint}
            setBlueprint={setBlueprint}
            exterior={exterior}
            setExterior={setExterior}
            generationTime={generationTime}
            setGenerationTime={setGenerationTime}
            onSave={handleSaveToLibrary}
            autoGenerate={autoGenerate}
            onAutoGenerateComplete={() => setAutoGenerate(false)}
          />
        );
      case ViewMode.LIBRARY:
        return (
          <LibraryView 
            items={library} 
            onDelete={handleDeleteFromLibrary} 
            onEdit={handleEditDesign}
          />
        );
      case ViewMode.COMPARE:
        return <CompareView items={library} />;
      default:
        return <HomeView onSelectTemplate={handleSelectTemplate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-slate-900 text-white h-14 px-6 flex items-center justify-between shadow-md z-30 flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(ViewMode.HOME)}>
          <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight">ArchVision</span>
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest leading-none">AI Home Builder</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
          <span>v1.0.0-beta</span>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <button 
            onClick={() => setCurrentView(ViewMode.HOME)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
              currentView === ViewMode.HOME 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button 
            onClick={() => setCurrentView(ViewMode.GENERATE)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
              currentView === ViewMode.GENERATE 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layout className="w-4 h-4" />
            Generate
          </button>
          <button 
            onClick={() => setCurrentView(ViewMode.LIBRARY)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
              currentView === ViewMode.LIBRARY 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Library className="w-4 h-4" />
            Library
            {library.length > 0 && (
              <span className="bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full ml-1">{library.length}</span>
            )}
          </button>
          <button 
            onClick={() => setCurrentView(ViewMode.COMPARE)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
              currentView === ViewMode.COMPARE 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            Compare
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>

    </div>
  );
};

export default App;