import React from 'react';
import { CarouselProject, Brand } from '../types';

interface DashboardProps {
  onCreateNew: () => void;
  onEditBrand: (brand: Brand) => void;
  onOpenAssetLab: (brand: Brand) => void;
  projects: CarouselProject[];
  currentBrandId: string;
  brands: Brand[];
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onEditBrand, onOpenAssetLab, projects, currentBrandId, brands }) => {
  // Find current brand from the dynamic list passed via props
  const brand = brands.find(b => b.id === currentBrandId) || brands[0];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-3 h-3 rounded-full" style={{backgroundColor: brand.primaryColor}}></span>
            <span>{brand.name}</span>
            <span className="text-dark-600">|</span>
            <button onClick={() => onEditBrand(brand)} className="text-brand-500 hover:text-brand-400 text-sm font-bold underline">Editar Identidade Visual</button>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => onOpenAssetLab(brand)}
            className="bg-dark-800 hover:bg-dark-700 text-white px-6 py-3 rounded-lg font-bold border border-dark-600 flex items-center gap-2"
          >
            <span>🎨</span> Laboratório de Ativos
          </button>
          <button 
            onClick={onCreateNew}
            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-brand-900/50"
          >
            <span>+</span> Novo Carrossel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
          <div className="text-brand-500 font-bold mb-2 text-sm uppercase tracking-wider">Tópico em Alta</div>
          <h3 className="text-xl font-semibold text-white">"Automação de IA para Pequenos Negócios"</h3>
          <p className="text-gray-500 text-sm mt-2">+240% volume de busca nesta semana</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
          <div className="text-purple-500 font-bold mb-2 text-sm uppercase tracking-wider">Gancho Viral</div>
          <h3 className="text-xl font-semibold text-white">"Pare de fazer X se você quer Y"</h3>
          <p className="text-gray-500 text-sm mt-2">Padrão com melhor performance no seu nicho</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex items-center justify-center cursor-pointer hover:border-brand-500 transition-colors group">
          <div className="text-center group-hover:text-brand-500 transition-colors">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-bold">Caçador de Tendências</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Projetos Recentes</h2>
      
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 rounded-xl border border-dashed border-dark-600">
          <p className="text-gray-500 mb-4">Nenhum carrossel gerado ainda.</p>
          <button onClick={onCreateNew} className="text-brand-500 hover:text-brand-400 font-medium">Comece seu primeiro projeto &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-dark-500 transition-colors group cursor-pointer">
              <div className="h-48 bg-dark-900 relative overflow-hidden">
                {/* Mock Thumbnail */}
                <img src={p.slides[0]?.image_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <span className="text-xs font-bold bg-brand-600 px-2 py-1 rounded text-white">{p.brand.name}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-1 truncate">{p.title}</h3>
                <p className="text-gray-500 text-sm mb-4 truncate">{p.topic}</p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{p.slides.length} slides</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;