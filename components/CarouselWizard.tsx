
import React, { useState } from 'react';
import { GOAL_OPTIONS, VISUAL_STYLES } from '../constants';
import { Brand, StepWizardData, TrendIdea } from '../types';
import { generateTrendIdeas } from '../services/geminiService';

interface WizardProps {
  onGenerate: (data: StepWizardData, brand: Brand) => void;
  isGenerating: boolean;
  brands: Brand[];
}

const CarouselWizard: React.FC<WizardProps> = ({ onGenerate, isGenerating, brands }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<StepWizardData>({
    topic: '',
    goal: 'viral',
    targetAudience: '',
    visualStyle: 'escamas_ultra',
    brandId: brands[0]?.id || '',
    slideCount: 7,
    generationMode: 'escamas'
  });

  const [escamasConfig, setEscamasConfig] = useState({
    density: 'high', // low, medium, high
    depthEffect: 'bokeh', // flat, bokeh, motion_blur
    elementStyle: 'realistic' // realistic, 3d_render, organic
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-4xl bg-dark-800 p-10 rounded-[3rem] border border-white/5 shadow-2xl mb-20">
        
        {step === 1 && (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-white tracking-tighter">Motor de Geração</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                onClick={() => setFormData({...formData, generationMode: 'escamas'})}
                className={`p-8 rounded-3xl border-2 text-left transition-all ${formData.generationMode === 'escamas' ? 'border-brand-500 bg-brand-500/10' : 'border-white/5 bg-dark-900'}`}
               >
                 <div className="text-3xl mb-3">🐉</div>
                 <div className="font-black text-white uppercase text-xs tracking-widest">Motor Escamas</div>
                 <p className="text-xs text-gray-500 mt-2 font-medium">Arquitetura em camadas. O post é construído elemento por elemento, como no Canva Pro.</p>
               </button>
               <button 
                onClick={() => setFormData({...formData, generationMode: 'ai_full'})}
                className={`p-8 rounded-3xl border-2 text-left transition-all ${formData.generationMode === 'ai_full' ? 'border-brand-500 bg-brand-500/10' : 'border-white/5 bg-dark-900'}`}
               >
                 <div className="text-3xl mb-3">🪄</div>
                 <div className="font-black text-white uppercase text-xs tracking-widest">IA Classic</div>
                 <p className="text-xs text-gray-500 mt-2 font-medium">Geração de imagem única com texto por cima. Mais rápido, menos editável.</p>
               </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-white tracking-tighter">O que vamos criar?</h2>
            <input 
              type="text" 
              placeholder="Ex: 5 erros fatais de quem começa no tráfego pago..."
              className="w-full bg-dark-900 border border-white/5 rounded-2xl p-6 text-xl font-bold text-white focus:border-brand-500 outline-none"
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
            />
            <div className="grid grid-cols-3 gap-4">
               {GOAL_OPTIONS.map(g => (
                 <button 
                   key={g.id} 
                   onClick={() => setFormData({...formData, goal: g.id})}
                   className={`p-4 rounded-xl border-2 text-xs font-black uppercase transition-all ${formData.goal === g.id ? 'border-brand-500 text-white' : 'border-white/5 text-gray-500'}`}
                 >
                   {g.label}
                 </button>
               ))}
            </div>
          </div>
        )}

        {step === 3 && formData.generationMode === 'escamas' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-white tracking-tighter">Configuração de Escamas</h2>
            <div className="space-y-6 bg-dark-900 p-8 rounded-[2rem] border border-white/5">
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Densidade de Camadas</label>
                  <div className="flex gap-4">
                     {['low', 'medium', 'high'].map(d => (
                       <button 
                        key={d} 
                        onClick={() => setEscamasConfig({...escamasConfig, density: d})}
                        className={`flex-1 py-4 rounded-xl border-2 font-bold text-xs uppercase ${escamasConfig.density === d ? 'border-brand-500 text-brand-500' : 'border-white/5 text-gray-500'}`}
                       >
                         {d === 'low' ? 'Minimal' : d === 'medium' ? 'Equilibrado' : 'Max Pro'}
                       </button>
                     ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Efeito de Profundidade</label>
                  <div className="flex gap-4">
                     {['flat', 'bokeh', 'motion'].map(e => (
                       <button 
                        key={e} 
                        onClick={() => setEscamasConfig({...escamasConfig, depthEffect: e})}
                        className={`flex-1 py-4 rounded-xl border-2 font-bold text-xs uppercase ${escamasConfig.depthEffect === e ? 'border-brand-500 text-brand-500' : 'border-white/5 text-gray-500'}`}
                       >
                         {e}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-16 pt-8 border-t border-white/5">
          <button onClick={handleBack} disabled={step === 1} className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Voltar</button>
          <button 
            onClick={() => step < 3 ? handleNext() : onGenerate(formData, brands[0])} 
            className="bg-brand-500 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-brand-500/20 uppercase text-xs tracking-widest"
          >
            {isGenerating ? 'Iniciando Motor...' : step === 3 ? 'Finalizar & Gerar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarouselWizard;
