import React from 'react';
import { GeneratedDesign } from '../types';
import { Calendar, Trash2, Edit, Download, MoreHorizontal } from 'lucide-react';

interface LibraryViewProps {
  items: GeneratedDesign[];
  onDelete: (id: string) => void;
  onEdit: (design: GeneratedDesign) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ items, onDelete, onEdit }) => {
  
  const downloadImage = (e: React.MouseEvent, url: string, prefix: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `archvision-${prefix}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">My Library</h2>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
          {items.length} {items.length === 1 ? 'Design' : 'Designs'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-lg">No saved designs yet.</p>
          <p className="text-sm">Go to Generate to create your first design.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
              
              {/* Image Preview Grid */}
              <div className="h-48 grid grid-cols-2 gap-0.5 bg-slate-100 relative">
                {item.exteriorUrl ? (
                  <img src={item.exteriorUrl} className={`object-cover w-full h-full ${!item.blueprintUrl ? 'col-span-2' : ''}`} alt="Ext" />
                ) : (
                   <div className="bg-slate-200 w-full h-full flex items-center justify-center text-xs text-slate-400">No Ext</div>
                )}
                 {item.blueprintUrl ? (
                  <img src={item.blueprintUrl} className={`object-cover w-full h-full ${!item.exteriorUrl ? 'col-span-2' : ''}`} alt="BP" />
                ) : (
                   <div className="bg-slate-200 w-full h-full flex items-center justify-center text-xs text-slate-400">No BP</div>
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <button 
                     onClick={() => onEdit(item)}
                     className="bg-white p-2 rounded-full text-slate-700 hover:text-primary hover:scale-110 transition-all shadow-lg"
                     title="Edit Design"
                   >
                     <Edit className="w-4 h-4" />
                   </button>
                   {item.blueprintUrl && (
                     <button 
                        onClick={(e) => downloadImage(e, item.blueprintUrl!, 'blueprint')}
                        className="bg-white p-2 rounded-full text-slate-700 hover:text-primary hover:scale-110 transition-all shadow-lg"
                        title="Download Blueprint"
                     >
                       <Download className="w-4 h-4" />
                     </button>
                   )}
                   {item.exteriorUrl && (
                     <button 
                        onClick={(e) => downloadImage(e, item.exteriorUrl!, 'exterior')}
                        className="bg-white p-2 rounded-full text-slate-700 hover:text-primary hover:scale-110 transition-all shadow-lg"
                        title="Download Exterior"
                     >
                       <Download className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{item.config.style}</h3>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-slate-500 flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{item.config.bedrooms} Beds</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{item.config.bathrooms} Baths</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{item.config.lotSize}m²</span>
                </div>

                <div className="mt-auto flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  {item.generationTime && (
                    <span>{item.generationTime.toFixed(1)}s gen</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryView;