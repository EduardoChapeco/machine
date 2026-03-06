import React, { useState, useEffect } from 'react';
import { Brand } from '../types';

interface BrandEditorProps {
  brand: Brand;
  onSave: (brand: Brand) => void;
  onCancel: () => void;
}

const FONT_OPTIONS = [
  { label: 'Inter (Modern Sans)', value: 'Inter' },
  { label: 'Roboto (Neutral Sans)', value: 'Roboto' },
  { label: 'Open Sans (Friendly Sans)', value: 'Open Sans' },
  { label: 'Montserrat (Geometric Sans)', value: 'Montserrat' },
  { label: 'Poppins (Soft Sans)', value: 'Poppins' },
  { label: 'Lato (Humanist Sans)', value: 'Lato' },
  { label: 'Raleway (Elegant Sans)', value: 'Raleway' },
  { label: 'Oswald (Condensed Sans)', value: 'Oswald' },
  { label: 'League Spartan (Bold Sans)', value: 'League Spartan' },
  { label: 'DM Sans (Tech Sans)', value: 'DM Sans' },
  { label: 'Space Grotesk (Brutalist)', value: 'Space Grotesk' },
  { label: 'Work Sans (Clean Sans)', value: 'Work Sans' },
  { label: 'Ubuntu (Humanist)', value: 'Ubuntu' },
  { label: 'Nunito (Rounded Sans)', value: 'Nunito' },
  { label: 'Rubik (Rounded)', value: 'Rubik' },
  { label: 'Manrope (Modern)', value: 'Manrope' },
  { label: 'Quicksand (Rounded)', value: 'Quicksand' },
  { label: 'Karla (Grotesque)', value: 'Karla' },
  { label: 'Josefin Sans (Geometric)', value: 'Josefin Sans' },
  { label: 'Bebas Neue (Display Caps)', value: 'Bebas Neue' },
  { label: 'Anton (Tall Display)', value: 'Anton' },
  { label: 'Syne (Artistic Display)', value: 'Syne' },
  { label: 'Archivo Black (Heavy Display)', value: 'Archivo Black' },
  { label: 'Abril Fatface (Curvy Display)', value: 'Abril Fatface' },
  { label: 'Playfair Display (Classy Serif)', value: 'Playfair Display' },
  { label: 'Merriweather (Readability Serif)', value: 'Merriweather' },
  { label: 'Lora (Calligraphic Serif)', value: 'Lora' },
  { label: 'Cinzel (Cinematic Serif)', value: 'Cinzel' },
  { label: 'Libre Baskerville (Classic Serif)', value: 'Libre Baskerville' },
  { label: 'PT Serif (Universal Serif)', value: 'PT Serif' },
  { label: 'Noto Sans (Global)', value: 'Noto Sans' },
  { label: 'Exo 2 (Futuristic)', value: 'Exo 2' },
  { label: 'Kanit (Modern Display)', value: 'Kanit' },
  { label: 'Prompt (Wide Sans)', value: 'Prompt' },
  { label: 'Pacifico (Fun Script)', value: 'Pacifico' },
  { label: 'Dancing Script (Elegant Script)', value: 'Dancing Script' },
  { label: 'Caveat (Handwritten)', value: 'Caveat' },
  { label: 'Satisfy (Brush Script)', value: 'Satisfy' },
  { label: 'Roboto Mono (Code/Tech)', value: 'Roboto Mono' },
  { label: 'Fira Code (Code)', value: 'Fira Code' },
];

const BrandEditor: React.FC<BrandEditorProps> = ({ brand, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Brand>(brand);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state if prop changes (e.g. parent reloads data)
  useEffect(() => {
    setFormData(brand);
  }, [brand]);

  const handleChange = (field: keyof Brand, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Utility to convert File to Base64 string for persistent local storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'moodboard') => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      const file = e.target.files[0];
      
      try {
        // Convert to Base64 so it survives page reloads
        const base64String = await fileToBase64(file);
        
        if (field === 'logoUrl') {
          handleChange('logoUrl', base64String);
        } else {
          const currentImages = formData.moodboardImages || [];
          handleChange('moodboardImages', [...currentImages, base64String]);
        }
      } catch (error) {
        console.error("Erro ao processar imagem", error);
        alert("Erro ao processar a imagem. Tente um arquivo menor.");
      } finally {
        setIsProcessing(false);
        // Clear input value to allow selecting the same file again if needed
        e.target.value = '';
      }
    }
  };

  const removeMoodboardImage = (index: number) => {
    const currentImages = formData.moodboardImages || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    handleChange('moodboardImages', newImages);
  };

  return (
    <div className="fixed inset-0 bg-dark-900 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8 border-b border-dark-700 pb-4 sticky top-0 bg-dark-900 z-10 pt-4">
          <div>
            <h2 className="text-3xl font-display text-white">Laboratório de Identidade</h2>
            <p className="text-gray-400 text-sm mt-1">Defina o DNA visual da sua marca.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
             <button 
               onClick={() => onSave(formData)}
               disabled={isProcessing}
               className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-brand-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {isProcessing ? 'Processando...' : 'Salvar Identidade'}
             </button>
          </div>
        </div>

        <div className="space-y-8 pb-12">
          
          {/* 1. Core Identity */}
          <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700">
             <div className="flex items-center gap-2 mb-6">
                <span className="text-brand-500 text-xl">💎</span>
                <h3 className="text-xl font-bold text-white">Identidade Central</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome da Marca</label>
                   <input 
                     type="text" 
                     value={formData.name}
                     onChange={e => handleChange('name', e.target.value)}
                     className="w-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white focus:border-brand-500 outline-none transition-colors"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nicho</label>
                   <input 
                     type="text" 
                     value={formData.niche}
                     onChange={e => handleChange('niche', e.target.value)}
                     className="w-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white focus:border-brand-500 outline-none transition-colors"
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Handle Social (@)</label>
                   <input 
                     type="text" 
                     value={formData.handle}
                     onChange={e => handleChange('handle', e.target.value)}
                     className="w-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white focus:border-brand-500 outline-none"
                   />
                </div>
             </div>
          </div>

          {/* 2. Typography & Colors */}
          <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700">
             <div className="flex items-center gap-2 mb-6">
                <span className="text-brand-500 text-xl">Aa</span>
                <h3 className="text-xl font-bold text-white">Tipografia & Cores</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fonte de Títulos</label>
                  <select 
                    value={formData.fontHeading}
                    onChange={e => handleChange('fontHeading', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white focus:border-brand-500 outline-none appearance-none"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.label}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fonte de Corpo</label>
                  <select 
                    value={formData.fontBody}
                    onChange={e => handleChange('fontBody', e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white focus:border-brand-500 outline-none appearance-none"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.label}</option>
                    ))}
                  </select>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primária</label>
                  <div className="flex gap-2 bg-dark-900 p-2 rounded border border-dark-600">
                    <input type="color" value={formData.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="w-8 h-8 rounded bg-transparent border-none cursor-pointer" />
                    <span className="text-xs self-center font-mono">{formData.primaryColor}</span>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Secundária</label>
                  <div className="flex gap-2 bg-dark-900 p-2 rounded border border-dark-600">
                    <input type="color" value={formData.secondaryColor} onChange={e => handleChange('secondaryColor', e.target.value)} className="w-8 h-8 rounded bg-transparent border-none cursor-pointer" />
                    <span className="text-xs self-center font-mono">{formData.secondaryColor}</span>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Destaque</label>
                  <div className="flex gap-2 bg-dark-900 p-2 rounded border border-dark-600">
                    <input type="color" value={formData.accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="w-8 h-8 rounded bg-transparent border-none cursor-pointer" />
                    <span className="text-xs self-center font-mono">{formData.accentColor}</span>
                  </div>
               </div>
             </div>
             
             {/* Live Preview */}
             <div className="mt-6 p-4 bg-dark-900 rounded border border-dashed border-dark-600 text-center">
               <h2 style={{ fontFamily: formData.fontHeading, color: formData.primaryColor }} className="text-3xl mb-2">A Raposa Rápida 123</h2>
               <p style={{ fontFamily: formData.fontBody }} className="text-gray-400">Pula sobre o cão preguiçoso. Exemplo de texto e tipografia.</p>
             </div>
          </div>

          {/* 3. Assets & Mood */}
          <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700">
             <div className="flex items-center gap-2 mb-6">
                <span className="text-brand-500 text-xl">📂</span>
                <h3 className="text-xl font-bold text-white">Ativos & Mood</h3>
             </div>

             <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição do Mood (para a IA)</label>
                <textarea 
                   value={formData.mood}
                   onChange={e => handleChange('mood', e.target.value)}
                   className="w-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white min-h-[80px]"
                   placeholder="Ex: Futurista, minimalista, luzes neon, sombras fortes..."
                />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Logo */}
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo</label>
                  <div className="bg-dark-900 border-2 border-dashed border-dark-600 rounded-xl p-6 flex flex-col items-center justify-center min-h-[120px] relative hover:border-brand-500 cursor-pointer transition-colors">
                    {formData.logoUrl ? (
                      <div className="relative flex flex-col items-center">
                         <img src={formData.logoUrl} className="h-16 object-contain mb-2" />
                         <span className="text-xs text-red-400 hover:underline" onClick={(e) => {e.preventDefault(); handleChange('logoUrl', '')}}>Remover</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl">☁️</span>
                        <p className="text-xs text-gray-500 mt-1">Upload Logo (PNG)</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                  </div>
               </div>

               {/* Moodboard */}
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Moodboard</label>
                  <div className="grid grid-cols-3 gap-2">
                     {formData.moodboardImages?.map((img, idx) => (
                       <div key={idx} className="aspect-square bg-dark-900 rounded relative group overflow-hidden">
                         <img src={img} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => removeMoodboardImage(idx)}>
                           <span className="text-red-500 font-bold">×</span>
                         </div>
                       </div>
                     ))}
                     <div className="aspect-square bg-dark-900 border-2 border-dashed border-dark-600 rounded flex items-center justify-center relative hover:border-brand-500 cursor-pointer">
                        <span className="text-gray-500">+</span>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'moodboard')} />
                     </div>
                  </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BrandEditor;