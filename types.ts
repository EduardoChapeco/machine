
export interface Brand {
  id: string;
  name: string;
  niche: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  mood: string;
  handle: string;
  logoLetter: string;
  logoUrl?: string;
  moodboardImages?: string[];
}

export interface LayerElement {
  id: string;
  type: 'subject' | 'design' | 'textfx' | 'overlay';
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  prompt?: string;
}

export type LayoutType = 
  | 'escamas_layered'
  | 'analista_craft'
  | 'magnata_lux'
  | 'viral_card'
  | 'typography_mask'
  | 'split_solid'
  | 'ios_notification';

export interface Slide {
  id: string;
  slide_number: number;
  layout_type: LayoutType;
  role_in_narrative: string;
  text_content: {
    headline: string;
    body?: string;
  };
  visual_blueprint?: string;
  background_url?: string;
  background_prompt?: string;
  image_url?: string;
  image_prompt?: string;
  layers: LayerElement[];
  background_opacity: number;
  isLoading?: boolean;
}

export interface CarouselProject {
  id: string;
  topic: string;
  goal: string;
  targetAudience?: string;
  brand: Brand;
  slides: Slide[];
  title: string;
  createdAt: number;
  visualStyle: string;
  generationMode: 'ai_full' | 'manual_upload' | 'escamas';
}

export interface StepWizardData {
  topic: string;
  goal: string;
  targetAudience: string;
  visualStyle: string;
  brandId: string;
  slideCount: number;
  generationMode: 'ai_full' | 'manual_upload' | 'escamas';
  customTone?: string;
}

export interface TrendIdea {
  idea_id: string;
  headline: string;
  summary: string;
  angle: string;
  seed_topic_for_generator: string;
  source_url?: string;
}

export type AssetType = 'sticker' | 'logo' | 'social_cover' | 'product_image';

export interface GeneratedAsset {
  id: string;
  url: string;
  label: string;
}
