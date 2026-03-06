
import { Brand } from "./types";

export const VISUAL_STYLES = {
  escamas_ultra: 'Escamas (Hyper-Layered 3D)',
  editorial_impact: 'Editorial Impact',
  paper_collage: 'Paper & Collage',
  glass_corporate: 'Glass & Corporate',
  noir_drama: 'Noir & Drama',
  brutalist_raw: 'Brutalist Raw',
};

export const GOAL_OPTIONS = [
  { id: 'leads', label: 'Gerar Leads', desc: 'Foco em conversão' },
  { id: 'viral', label: 'Viralização', desc: 'Foco em compartilhamento' },
  { id: 'education', label: 'Educativo', desc: 'Foco em ensinar' }
];

export const ESCAMAS_ARCHITECT_PROMPT = `Você é o Arquiteto do Sistema ESCAMAS.
Sua única função é decompor o post solicitado em uma estrutura visual de exatamente 8 camadas.

TIPOS DE CAMADA PERMITIDOS:
- atmospheric: Efeitos como névoa, partículas, luz.
- design: Elementos gráficos, formas, molduras.
- subject: Objetos principais (carros, gadgets, produtos).
- person: Seres vivos, pessoas, poses.
- dynamic: Efeitos de movimento, rastros de luz.
- textfx: Elementos tipográficos decorativos.

REGRAS:
1. Retorne APENAS o JSON solicitado.
2. Não gere roteiros ou legendas.
3. Posicione as camadas usando coordenadas X/Y de 0 a 100.
4. O Z-Index deve variar de 1 (fundo) a 8 (frente).`;

export const MOCK_BRANDS: Brand[] = [
  {
    id: '1',
    name: 'TechFlow',
    niche: 'AI & Productivity',
    handle: '@techflow_ai',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#818cf8',
    fontHeading: 'Archivo Black',
    fontBody: 'Inter',
    mood: 'Futuristic, cinematic lighting, 3D depth',
    logoLetter: 'T'
  }
];

export const TREND_HUNTER_SYSTEM_PROMPT = `Viral Trend Hunter. Find real topics via Google Search.`;
export const ART_DIRECTOR_SYSTEM_PROMPT = `Art Director. Create hyper-realistic design prompts.`;
export const CONTENT_ARCHITECT_SYSTEM_PROMPT = `Content Architect. Create viral carousel scripts in Portuguese. JSON format: { "title": "str", "slides": [{ "headline": "str", "body": "str" }] }`;
