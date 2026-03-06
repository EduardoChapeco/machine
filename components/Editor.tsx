
import React, { useState, useCallback, useEffect } from 'react';
import { CarouselProject, Slide, LayerElement } from '../types';
import SlideRenderer from './SlideRenderer';
import { decomposeSlideLayers, generateEscamasAsset } from '../services/geminiService';

interface EditorProps {
  project: CarouselProject;
  onUpdate: (project: CarouselProject) => void;
  onBack: () => void;
}

const Editor: React.FC<EditorProps> = ({ project, onUpdate, onBack }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  
  const slides = project.slides || [];
  const currentSlide = slides[selectedIdx];

  const updateCurrentSlide = useCallback((updates: Partial<Slide>) => {
    if (!currentSlide) return;
    const newSlides = [...slides];
    newSlides[selectedIdx] = { ...newSlides[selectedIdx], ...updates };
    onUpdate({ ...project, slides: newSlides });
  }, [currentSlide, slides, selectedIdx, onUpdate, project]);

  const updateLayer = (id: string, updates: Partial<LayerElement>) => {
    if (!currentSlide) return;
    const newLayers = currentSlide.layers.map(l => l.id === id ? { ...l, ...updates } : l);
    updateCurrentSlide({ layers: newLayers });
  };

  const handleLayerDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayerId || !currentSlide) return;
    const layer = currentSlide.layers.find(l => l.id === selectedLayerId);
    if (!layer) return;

    // Conversão de movimento mouse para escala canvas 1080x1350
    const newX = layer.x + (e.movementX / zoom / 10.8);
    const newY = layer.y + (e.movementY / zoom / 13.5);

    updateLayer(selectedLayerId, { x: newX, y: newY });
  };

  const handleEscamasDeepGeneration = async () => {
    if (!currentSlide) return;
    setIsProcessing(true);
    setGenerationProgress(5);
    updateCurrentSlide({ isLoading: true });
    
    try {
      // 1. ANÁLISE E DECOMPOSIÇÃO (ETAPA 1 & 2)
      const blueprint = await decomposeSlideLayers(currentSlide, project.brand);
      if (!blueprint) throw new Error("Falha no Arquiteto");
      setGenerationProgress(20);

      // 2. RENDERIZAÇÃO MODULAR (ETAPA 3)
      // Gerar Background primeiro
      const bgUrl = await generateEscamasAsset(blueprint.background_prompt, 'background', 1);
      setGenerationProgress(40);
      
      const layers: LayerElement[] = [];
      const totalLayers = blueprint.layers.length;

      // Gerar cada camada sequencialmente para garantir o isolamento e DNA
      for (let i = 0; i < totalLayers; i++) {
        const lDef = blueprint.layers[i];
        const url = await generateEscamasAsset(lDef.prompt, lDef.type, lDef.initial_pos.zIndex);
        
        if (url) {
          layers.push({
            id: crypto.randomUUID(),
            type: lDef.type as any,
            url,
            x: lDef.initial_pos.x,
            y: lDef.initial_pos.y,
            scale: lDef.initial_pos.scale || 0.6,
            rotation: 0,
            opacity: 1,
            zIndex: lDef.initial_pos.zIndex,
            prompt: lDef.prompt
          });
        }
        setGenerationProgress(40 + ((i + 1) / totalLayers * 55));
      }

      updateCurrentSlide({
        background_url: bgUrl,
        layers: layers,
        isLoading: false,
        layout_type: 'escamas_layered'
      });
      setGenerationProgress(100);
    } catch (err) {
      console.error(err);
      updateCurrentSlide({ isLoading: false });
      alert("Erro no Pipeline de Camadas. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  if (!currentSlide) return null;

  return (
    <div className="h-screen w-screen bg-[#020202] flex overflow-hidden font-sans select-none text-white">
      
      {/* PAINEL HIERARQUIA ESCAMAS */}
      <aside className={`bg-[#080808] border-r border-white/5 transition-all duration-500 relative flex flex-col shrink-0 ${leftOpen ? 'w-80' : 'w-0'}`}>
        <button 
          onClick={() => setLeftOpen(!leftOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-dark-700 border border-white/10 rounded-full z-[100] flex items-center justify-center text-[10px] hover:bg-brand-500 transition-colors shadow-2xl"
        >
          {leftOpen ? '‹' : '›'}
        </button>

        {leftOpen && (
          <div className="flex-1 p-6 space-y-10 overflow-y-auto min-w-[320px] animate-fade-in">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Estrutura Escamas</h2>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Navegador de Slides</label>
              <div className="grid grid-cols-4 gap-2">
                {slides.map((s, i) => (
                  <button 
                    key={s.id} 
                    onClick={() => setSelectedIdx(i)}
                    className={`aspect-square rounded-2xl flex items-center justify-center font-black text-xs border transition-all ${selectedIdx === i ? 'bg-brand-600 border-brand-500 shadow-xl' : 'bg-dark-900 border-white/5 text-gray-600'}`}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Camadas do Slide {selectedIdx + 1}</label>
              <div className="space-y-2">
                 <div 
                   onClick={() => setSelectedLayerId(null)} 
                   className={`p-4 rounded-2xl border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-3 ${!selectedLayerId ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-white/5 bg-dark-800'}`}
                 >
                   <span className="opacity-50">Z-1</span> Plano de Fundo
                 </div>
                 {currentSlide.layers.sort((a,b) => b.zIndex - a.zIndex).map((l) => (
                   <div 
                    key={l.id} 
                    onClick={() => setSelectedLayerId(l.id)} 
                    className={`p-4 rounded-2xl border text-[10px] font-bold uppercase transition-all cursor-pointer flex justify-between items-center ${selectedLayerId === l.id ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-white/5 bg-dark-800'}`}
                   >
                     <div className="flex items-center gap-3">
                        <span className="opacity-50">Z-{l.zIndex}</span>
                        <span>{l.type.replace('fx', '').toUpperCase()}</span>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ÁREA CENTRAL CANVAS */}
      <main 
        className="flex-1 relative bg-[#050505] overflow-hidden flex flex-col items-center justify-center transition-all duration-500"
        onMouseMove={handleLayerDrag}
        onMouseUp={() => setIsDragging(false)}
      >
        <div 
          className="relative shadow-[0_0_150px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
          onMouseDown={() => selectedLayerId && setIsDragging(true)}
        >
          <SlideRenderer 
            slide={currentSlide} 
            brand={project.brand} 
            scale={1}
            onLayerSelect={setSelectedLayerId}
            selectedLayerId={selectedLayerId || undefined}
          />
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-10 bg-black/60 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] flex items-center gap-6 shadow-2xl z-[150] animate-slide-up">
           <div className="flex items-center gap-1 px-4">
             <button onClick={() => setZoom(prev => Math.max(0.1, prev - 0.05))} className="w-10 h-10 rounded-full hover:bg-white/10 transition-colors">－</button>
             <span className="text-[11px] font-black w-14 text-center tracking-tighter">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(prev => Math.min(1.2, prev + 0.05))} className="w-10 h-10 rounded-full hover:bg-white/10 transition-colors">＋</button>
           </div>
           
           <div className="h-8 w-px bg-white/10" />
           
           <div className="flex gap-2">
              <button 
                onClick={handleEscamasDeepGeneration}
                disabled={isProcessing}
                className="relative overflow-hidden px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 min-w-[240px]"
              >
                <span className="relative z-10">{isProcessing ? `Renderizando... ${Math.round(generationProgress)}%` : '🪄 Pipeline Escamas Deep'}</span>
                {isProcessing && (
                  <div className="absolute inset-0 bg-brand-400/20 transition-all" style={{ width: `${generationProgress}%` }} />
                )}
              </button>
           </div>
        </div>
      </main>

      {/* PAINEL PROPRIEDADES */}
      <aside className={`bg-[#080808] border-l border-white/5 transition-all duration-500 relative flex flex-col shrink-0 ${rightOpen ? 'w-80' : 'w-0'}`}>
        <button 
          onClick={() => setRightOpen(!rightOpen)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-dark-700 border border-white/10 rounded-full z-[100] flex items-center justify-center text-[10px] hover:bg-brand-500 transition-colors shadow-2xl"
        >
          {rightOpen ? '›' : '‹'}
        </button>

        {rightOpen && (
          <div className="flex-1 p-8 space-y-12 overflow-y-auto min-w-[320px] animate-fade-in">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Ajustes</h2>
            
            {selectedLayerId ? (
              <div className="space-y-10">
                 <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dimensão</label>
                        <span className="text-[10px] text-brand-500 font-bold">{(currentSlide.layers.find(l => l.id === selectedLayerId)?.scale || 1).toFixed(2)}x</span>
                      </div>
                      <input type="range" min="0.1" max="5" step="0.01" className="w-full accent-brand-500" value={currentSlide.layers.find(l => l.id === selectedLayerId)?.scale || 1} onChange={e => updateLayer(selectedLayerId, { scale: parseFloat(e.target.value) })} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ângulo</label>
                        <span className="text-[10px] text-brand-500 font-bold">{currentSlide.layers.find(l => l.id === selectedLayerId)?.rotation || 0}°</span>
                      </div>
                      <input type="range" min="-180" max="180" className="w-full accent-brand-500" value={currentSlide.layers.find(l => l.id === selectedLayerId)?.rotation || 0} onChange={e => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })} />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase block mb-4 tracking-widest">Z-Index (Hierarquia)</label>
                      <input type="number" className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 font-black" value={currentSlide.layers.find(l => l.id === selectedLayerId)?.zIndex || 10} onChange={e => updateLayer(selectedLayerId, { zIndex: parseInt(e.target.value) })} />
                    </div>
                 </div>

                 <div className="p-6 bg-dark-900 rounded-[2rem] border border-white/5 space-y-4">
                    <p className="text-[9px] font-black text-brand-500 uppercase tracking-[0.2em]">Gen Prompt</p>
                    <p className="text-[11px] text-gray-400 italic leading-relaxed">"{currentSlide.layers.find(l => l.id === selectedLayerId)?.prompt}"</p>
                 </div>

                 <button 
                   onClick={() => {
                     updateCurrentSlide({ layers: currentSlide.layers.filter(l => l.id !== selectedLayerId) });
                     setSelectedLayerId(null);
                   }}
                   className="w-full py-5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-2xl hover:bg-red-500/10 transition-all tracking-widest"
                 >
                   Eliminar Elemento
                 </button>
              </div>
            ) : (
              <div className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">Copywriting Context</label>
                    <textarea 
                      value={currentSlide.text_content.headline}
                      onChange={e => updateCurrentSlide({ text_content: { ...currentSlide.text_content, headline: e.target.value } })}
                      className="w-full bg-dark-900 border border-white/5 rounded-3xl p-6 text-sm font-bold text-white focus:border-brand-500 outline-none transition-colors min-h-[160px]"
                    />
                 </div>
                 
                 <div className="p-6 bg-brand-900/10 rounded-[2rem] border border-brand-500/20">
                    <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-2">Dica Escamas</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Clique nos elementos no canvas para ajustar o posicionamento e escala manualmente.</p>
                 </div>

                 <button className="w-full py-7 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-[2.5rem] shadow-2xl hover:bg-gray-200 transition-colors">Finalizar Carrossel</button>
              </div>
            )}
          </div>
        )}
      </aside>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        input[type="range"] { cursor: ew-resize; }
      `}</style>
    </div>
  );
};

export default Editor;
