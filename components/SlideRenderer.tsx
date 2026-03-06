
import React from 'react';
import { Slide, Brand, LayerElement } from '../types';

interface RendererProps {
  slide: Slide;
  brand: Brand;
  scale?: number;
  onLayerSelect?: (layerId: string) => void;
  selectedLayerId?: string;
}

const SlideRenderer: React.FC<RendererProps> = ({ slide, brand, scale = 1, onLayerSelect, selectedLayerId }) => {
  if (!slide || !brand) return null;

  const artboardStyle: React.CSSProperties = {
    width: 1080,
    height: 1350,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 100px 200px -50px rgba(0,0,0,0.8)',
  };

  // Ensure background_opacity has a default value if undefined
  const bgOpacity = slide.background_opacity ?? 1;

  return (
    <div style={artboardStyle} className="select-none font-sans">
      
      {/* LAYER 0: BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-black">
        {slide.background_url ? (
          <img 
            src={slide.background_url} 
            className="w-full h-full object-cover transition-opacity duration-500" 
            style={{ opacity: bgOpacity }}
            alt="Background"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#121212] to-black" />
        )}
      </div>

      {/* ESCAMAS SYSTEM: DYNAMIC LAYERS */}
      {(slide.layers || []).sort((a,b) => a.zIndex - b.zIndex).map((layer) => (
        <div
          key={layer.id}
          onClick={(e) => {
            e.stopPropagation();
            onLayerSelect?.(layer.id);
          }}
          className={`absolute cursor-move transition-shadow ${selectedLayerId === layer.id ? 'ring-4 ring-brand-500 shadow-2xl z-50' : ''}`}
          style={{
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            width: `${layer.scale * 100}%`,
            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
            opacity: layer.opacity,
            zIndex: layer.zIndex + 10
          }}
        >
          <img src={layer.url} className="w-full h-auto pointer-events-none" alt={layer.type} />
        </div>
      ))}

      {/* TEXT LAYER: HEADLINE */}
      <div className="absolute inset-0 z-40 flex flex-col justify-center items-center p-20 pointer-events-none">
        {slide.text_content?.headline && (
          <h2 
            className="text-white text-center font-black uppercase tracking-tighter leading-[0.85]"
            style={{ 
              fontFamily: brand.fontHeading || 'sans-serif', 
              fontSize: '9rem',
              textShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            {slide.text_content.headline}
          </h2>
        )}
        {slide.text_content?.body && (
           <p className="mt-10 text-gray-300 text-3xl max-w-4xl text-center font-medium leading-tight">
             {slide.text_content.body}
           </p>
        )}
      </div>

      {/* BRANDING */}
      <div className="absolute bottom-16 left-16 z-50 opacity-60 flex items-center gap-4">
        {brand.logoUrl && <img src={brand.logoUrl} className="h-12" alt="Logo" />}
        <span className="text-white font-bold text-2xl tracking-widest uppercase">{brand.handle}</span>
      </div>

      {/* LOADING OVERLAY */}
      {slide.isLoading && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Esculpinco Camadas...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideRenderer;
