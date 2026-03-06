import React, { useState, useRef } from 'react';
import { Brand, AssetType, GeneratedAsset } from '../types';
import { generateAssets, generateProImage, editImage, generateVideo, analyzeMedia } from '../services/geminiService';

interface AssetLabProps {
  brand: Brand;
  onBack: () => void;
}

type Mode = 'assets' | 'pro_image' | 'edit_image' | 'video_studio' | 'analysis';

const AssetLab: React.FC<AssetLabProps> = ({ brand, onBack }) => {
  const [activeMode, setActiveMode] = useState<Mode>('assets');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // -- Assets State
  const [assetType, setAssetType] = useState<AssetType>('sticker');
  const [assetContext, setAssetContext] = useState('');
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  // -- Pro Image State
  const [proPrompt, setProPrompt] = useState('');
  const [proSize, setProSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [proResult, setProResult] = useState<string | null>(null);

  // -- Edit Image State
  const [editPrompt, setEditPrompt] = useState('');
  const [editSource, setEditSource] = useState<string | null>(null);
  const [editResult, setEditResult] = useState<string | null>(null);

  // -- Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResult, setVideoResult] = useState<string | null>(null);

  // -- Analysis State
  const [analyzePrompt, setAnalyzePrompt] = useState('Analyze this image and extract key insights.');
  const [analyzeSource, setAnalyzeSource] = useState<{data: string, type: string} | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState('');

  // Helpers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    if (e.target.files?.[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setter(b64);
    }
  };

  const handleAnalysisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const b64 = await fileToBase64(file);
      setAnalyzeSource({ data: b64, type: file.type });
    }
  };

  // Actions
  const runAssetGen = async () => {
    setIsProcessing(true);
    setAssets(await generateAssets(assetType, assetContext, brand));
    setIsProcessing(false);
  };

  const runProImage = async () => {
    setIsProcessing(true);
    setProResult(await generateProImage(proPrompt, proSize));
    setIsProcessing(false);
  };

  const runEditImage = async () => {
    if (!editSource) return;
    setIsProcessing(true);
    setEditResult(await editImage(editSource, editPrompt));
    setIsProcessing(false);
  };

  const runVideoGen = async () => {
    setIsProcessing(true);
    setVideoResult(await generateVideo(videoPrompt, videoSourceImage, videoRatio));
    setIsProcessing(false);
  };

  const runAnalysis = async () => {
    if (!analyzeSource) return;
    setIsProcessing(true);
    setAnalyzeResult(await analyzeMedia(analyzeSource.data, analyzeSource.type, analyzePrompt));
    setIsProcessing(false);
  };

  const applyVideoPreset = (preset: 'zoom' | 'parallax' | 'loop') => {
      if (preset === 'zoom') setVideoPrompt("Cinematic slow zoom in on [Subject]. Low key lighting. The atmosphere is tense. Static camera, only zooming.");
      if (preset === 'parallax') setVideoPrompt("Truck shot (camera moving sideways) passing by [Subject] in a warehouse. Depth of field changes.");
      if (preset === 'loop') setVideoPrompt("Abstract macro texture of [Material] moving slowly. Looping motion. No people.");
  };

  const modes: {id: Mode, label: string, icon: string}[] = [
    { id: 'assets', label: 'Brand Assets', icon: '📂' },
    { id: 'pro_image', label: 'Pro Image (4K)', icon: '✨' },
    { id: 'edit_image', label: 'Magic Edit', icon: '🎨' },
    { id: 'video_studio', label: 'Veo Video', icon: '🎥' },
    { id: 'analysis', label: 'Analyzer', icon: '👁️' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col">
      <header className="h-16 border-b border-dark-700 flex items-center justify-between px-6 bg-dark-800">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white">&larr; Voltar</button>
          <h1 className="font-bold text-xl">Creative Studio: {brand.name}</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-dark-800 border-r border-dark-700 p-4 flex flex-col gap-2 shrink-0">
           {modes.map(mode => (
             <button 
               key={mode.id}
               onClick={() => setActiveMode(mode.id)}
               className={`text-left p-3 rounded flex items-center gap-3 transition-colors ${activeMode === mode.id ? 'bg-brand-600 text-white font-bold' : 'text-gray-400 hover:bg-dark-700'}`}
             >
               <span>{mode.icon}</span>
               {mode.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
           <div className="max-w-5xl mx-auto">
             
             {/* MODE: ASSETS */}
             {activeMode === 'assets' && (
               <>
                 <div className="flex gap-4 mb-6 border-b border-dark-700 pb-4">
                    {['sticker', 'logo', 'social_cover', 'product_image'].map((t) => (
                      <button 
                        key={t} 
                        onClick={() => setAssetType(t as AssetType)}
                        className={`text-sm font-bold uppercase ${assetType === t ? 'text-brand-500' : 'text-gray-500'}`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                 </div>
                 <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 mb-8 flex gap-4">
                    <input 
                      className="flex-1 bg-dark-900 border border-dark-600 rounded p-3 text-white" 
                      placeholder={`Describe your ${assetType}...`}
                      value={assetContext}
                      onChange={e => setAssetContext(e.target.value)}
                    />
                    <button onClick={runAssetGen} disabled={isProcessing || !assetContext} className="bg-brand-600 px-6 rounded font-bold disabled:opacity-50">
                       {isProcessing ? 'Generating...' : 'Generate'}
                    </button>
                 </div>
                 <div className="grid grid-cols-4 gap-6">
                    {assets.map(a => (
                      <div key={a.id} className="bg-dark-800 rounded border border-dark-700 p-2">
                        <img src={a.url} className="w-full aspect-square object-cover rounded mb-2" />
                        <p className="text-xs text-gray-400">{a.label}</p>
                      </div>
                    ))}
                 </div>
               </>
             )}

             {/* MODE: PRO IMAGE */}
             {activeMode === 'pro_image' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                       <h2 className="text-2xl font-bold mb-4">Nano Banana Pro Generator</h2>
                       <p className="text-gray-400 text-sm">Generate high-fidelity images using Gemini 3 Pro.</p>
                     </div>
                     <textarea 
                        className="w-full h-32 bg-dark-800 border border-dark-600 rounded p-4 text-white"
                        placeholder="Detailed prompt for high quality image..."
                        value={proPrompt}
                        onChange={e => setProPrompt(e.target.value)}
                     />
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image Size</label>
                        <div className="flex gap-4">
                           {['1K', '2K', '4K'].map(s => (
                             <button 
                               key={s} 
                               onClick={() => setProSize(s as any)}
                               className={`px-4 py-2 rounded border ${proSize === s ? 'bg-brand-600 border-brand-600' : 'border-dark-600'}`}
                             >
                               {s}
                             </button>
                           ))}
                        </div>
                     </div>
                     <button onClick={runProImage} disabled={isProcessing || !proPrompt} className="w-full bg-brand-600 py-4 rounded font-bold text-lg disabled:opacity-50">
                        {isProcessing ? 'Rendering...' : 'Generate High Quality Image'}
                     </button>
                  </div>
                  <div className="bg-black rounded-xl border border-dark-700 flex items-center justify-center min-h-[400px]">
                     {proResult ? <img src={proResult} className="max-w-full max-h-[600px]" /> : <span className="text-gray-600">Result will appear here</span>}
                  </div>
               </div>
             )}

             {/* MODE: EDIT IMAGE */}
             {activeMode === 'edit_image' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h2 className="text-2xl font-bold">Magic Editor (Nano Banana)</h2>
                     
                     <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center hover:border-brand-500 relative">
                        {editSource ? (
                          <img src={editSource} className="h-40 mx-auto object-contain" />
                        ) : (
                          <div className="text-gray-500">Upload Image to Edit</div>
                        )}
                        <input type="file" onChange={e => handleFileUpload(e, setEditSource)} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>

                     <textarea 
                        className="w-full bg-dark-800 border border-dark-600 rounded p-4 text-white"
                        placeholder="Instructions: 'Add a retro filter', 'Remove background person'..."
                        value={editPrompt}
                        onChange={e => setEditPrompt(e.target.value)}
                     />
                     
                     <button onClick={runEditImage} disabled={isProcessing || !editSource || !editPrompt} className="w-full bg-brand-600 py-3 rounded font-bold disabled:opacity-50">
                        {isProcessing ? 'Editing...' : 'Apply Magic Edit'}
                     </button>
                  </div>
                  <div className="bg-black rounded-xl border border-dark-700 flex items-center justify-center min-h-[400px]">
                     {editResult ? <img src={editResult} className="max-w-full max-h-[600px]" /> : <span className="text-gray-600">Edited image result</span>}
                  </div>
               </div>
             )}

             {/* MODE: VEO VIDEO */}
             {activeMode === 'video_studio' && (
               <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                       <h2 className="text-2xl font-bold">Veo Video Studio</h2>
                       <p className="text-gray-400 text-sm">Generate videos from text or image prompts.</p>
                    </div>
                    <div className="text-xs text-orange-400 border border-orange-400/30 bg-orange-400/10 px-3 py-1 rounded">
                       Requires Paid API Key Selection
                    </div>
                  </div>
                  
                  {/* Motion Presets */}
                  <div className="flex gap-3">
                     <button onClick={() => applyVideoPreset('zoom')} className="px-3 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-dark-600">🔎 Slow Zoom</button>
                     <button onClick={() => applyVideoPreset('parallax')} className="px-3 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-dark-600">↔️ Parallax</button>
                     <button onClick={() => applyVideoPreset('loop')} className="px-3 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-dark-600">🔄 Abstract Loop</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prompt</label>
                          <textarea 
                             className="w-full h-32 bg-dark-800 border border-dark-600 rounded p-3 text-white"
                             placeholder="A neon hologram of a cat driving at top speed..."
                             value={videoPrompt}
                             onChange={e => setVideoPrompt(e.target.value)}
                          />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reference Image (Optional)</label>
                           <div className="border border-dark-600 bg-dark-800 rounded h-24 flex items-center justify-center relative hover:bg-dark-700">
                              {videoSourceImage ? <img src={videoSourceImage} className="h-full object-contain" /> : <span className="text-xs text-gray-500">Upload Source</span>}
                              <input type="file" onChange={e => handleFileUpload(e, setVideoSourceImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Aspect Ratio</label>
                           <div className="flex gap-2">
                              <button onClick={() => setVideoRatio('16:9')} className={`flex-1 py-2 rounded border ${videoRatio === '16:9' ? 'bg-brand-600 border-brand-600' : 'border-dark-600'}`}>16:9</button>
                              <button onClick={() => setVideoRatio('9:16')} className={`flex-1 py-2 rounded border ${videoRatio === '9:16' ? 'bg-brand-600 border-brand-600' : 'border-dark-600'}`}>9:16</button>
                           </div>
                        </div>

                        <button onClick={runVideoGen} disabled={isProcessing || !videoPrompt} className="w-full bg-brand-600 py-3 rounded font-bold disabled:opacity-50">
                           {isProcessing ? 'Generating Video...' : 'Generate with Veo'}
                        </button>
                     </div>

                     <div className="lg:col-span-2 bg-black rounded-xl border border-dark-700 flex items-center justify-center min-h-[400px]">
                        {videoResult ? (
                          <video src={videoResult} controls autoPlay loop className="max-w-full max-h-[500px]" />
                        ) : (
                          <div className="text-center text-gray-600">
                             <div className="text-4xl mb-2">🎬</div>
                             Video preview will appear here
                          </div>
                        )}
                     </div>
                  </div>
               </div>
             )}

             {/* MODE: ANALYSIS */}
             {activeMode === 'analysis' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
                   <div className="flex flex-col gap-4 h-full">
                      <div className="flex-1 bg-dark-800 border border-dark-600 rounded-xl relative flex items-center justify-center overflow-hidden">
                         {analyzeSource ? (
                           analyzeSource.type.startsWith('video') ? (
                             <video src={analyzeSource.data} controls className="max-w-full max-h-full" />
                           ) : (
                             <img src={analyzeSource.data} className="max-w-full max-h-full object-contain" />
                           )
                         ) : (
                           <div className="text-gray-500">Upload Image or Video</div>
                         )}
                         <input type="file" onChange={handleAnalysisUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div className="flex gap-2">
                         <input 
                           className="flex-1 bg-dark-800 border border-dark-600 rounded p-3 text-white" 
                           value={analyzePrompt}
                           onChange={e => setAnalyzePrompt(e.target.value)}
                         />
                         <button onClick={runAnalysis} disabled={isProcessing || !analyzeSource} className="bg-brand-600 px-6 rounded font-bold disabled:opacity-50">
                            {isProcessing ? 'Analyzing...' : 'Analyze'}
                         </button>
                      </div>
                   </div>
                   <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 overflow-y-auto">
                      <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">Gemini 3 Pro Insights</h3>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {analyzeResult || "AI analysis results will appear here."}
                      </div>
                   </div>
                </div>
             )}

           </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLab;