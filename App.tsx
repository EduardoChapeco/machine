
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CarouselWizard from './components/CarouselWizard';
import Editor from './components/Editor';
import BrandEditor from './components/BrandEditor';
import AssetLab from './components/AssetLab';
import { CarouselProject, StepWizardData, Brand, Slide } from './types';
import { generateCarouselStructure, generateImagePrompt, generateSlideImage } from './services/geminiService';
import { MOCK_BRANDS } from './constants';

type View = 'dashboard' | 'wizard' | 'editor' | 'brand_editor' | 'asset_lab';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('viralflow_brands');
      return saved ? JSON.parse(saved) : MOCK_BRANDS;
    } catch { return MOCK_BRANDS; }
  });

  const [projects, setProjects] = useState<CarouselProject[]>(() => {
    try {
      const saved = localStorage.getItem('viralflow_projects');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeProject, setActiveProject] = useState<CarouselProject | null>(null);
  const [activeBrand, setActiveBrand] = useState<Brand>(brands[0] || MOCK_BRANDS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('viralflow_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('viralflow_projects', JSON.stringify(projects));
  }, [projects]);

  const handleGenerateCarousel = async (data: StepWizardData, selectedBrand: Brand) => {
    setIsGenerating(true);
    
    let brandToUse = brands.find(b => b.id === selectedBrand.id) || selectedBrand;
    
    try {
      const structure = await generateCarouselStructure(data, brandToUse);
      
      if (!structure || !structure.slides) {
        throw new Error("Falha na resposta da IA");
      }

      const initialSlides: Slide[] = structure.slides.map((s: any, i: number) => ({
          id: crypto.randomUUID(),
          slide_number: i + 1,
          layout_type: 'viral_card',
          role_in_narrative: s.role_in_narrative || 'content',
          text_content: {
            headline: s.text_content?.headline || s.headline || "Sem Título",
            body: s.text_content?.body || s.body || ""
          },
          layers: [],
          background_opacity: 1,
          isLoading: data.generationMode === 'ai_full'
      }));

      const newProject: CarouselProject = {
        id: crypto.randomUUID(),
        topic: data.topic,
        goal: data.goal,
        targetAudience: data.targetAudience,
        visualStyle: data.visualStyle,
        brand: brandToUse,
        slides: initialSlides,
        title: structure.title || data.topic,
        createdAt: Date.now(),
        generationMode: data.generationMode
      };

      setProjects(prev => [newProject, ...prev]);
      setActiveProject(newProject);
      setCurrentView('editor');

      if (data.generationMode === 'ai_full') {
        generateImagesInBackground(newProject, brandToUse, data.visualStyle);
      }
    } catch (error) {
      console.error("Critical Generation Error:", error);
      alert("Erro ao conectar com a IA. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImagesInBackground = async (project: CarouselProject, brand: Brand, visualStyle: string) => {
    const slides = [...project.slides];
    for (let i = 0; i < slides.length; i++) {
        try {
            const prompt = await generateImagePrompt(slides[i], brand, visualStyle);
            const image = await generateSlideImage(prompt);
            slides[i] = { 
              ...slides[i], 
              image_prompt: prompt, 
              image_url: image, 
              background_url: image, 
              isLoading: false 
            };
            
            const updatedProject = { ...project, slides: [...slides] };
            setActiveProject(updatedProject);
            setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        } catch (e) {
            slides[i].isLoading = false;
            setActiveProject({ ...project, slides: [...slides] });
        }
    }
  };

  const handleUpdateProject = (updated: CarouselProject) => {
     setActiveProject(updated);
     setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans antialiased">
      {currentView === 'dashboard' && (
        <Dashboard 
          onCreateNew={() => setCurrentView('wizard')} 
          onEditBrand={b => { setActiveBrand(b); setCurrentView('brand_editor'); }}
          onOpenAssetLab={b => { setActiveBrand(b); setCurrentView('asset_lab'); }}
          projects={projects} 
          currentBrandId={activeBrand.id}
          brands={brands}
        />
      )}
      {currentView === 'wizard' && (
        <CarouselWizard onGenerate={handleGenerateCarousel} isGenerating={isGenerating} brands={brands} />
      )}
      {currentView === 'editor' && activeProject && (
        <Editor 
          project={activeProject} 
          onUpdate={handleUpdateProject} 
          onBack={() => setCurrentView('dashboard')} 
        />
      )}
      {currentView === 'brand_editor' && (
        <BrandEditor 
          brand={activeBrand} 
          onSave={b => { 
            const updated = brands.map(ob => ob.id === b.id ? b : ob);
            setBrands(updated); 
            setCurrentView('dashboard'); 
          }} 
          onCancel={() => setCurrentView('dashboard')} 
        />
      )}
      {currentView === 'asset_lab' && (
        <AssetLab brand={activeBrand} onBack={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
}

export default App;
