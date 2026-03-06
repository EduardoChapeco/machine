
import { GoogleGenAI, Type } from "@google/genai";
import { 
  CONTENT_ARCHITECT_SYSTEM_PROMPT, 
  ESCAMAS_ARCHITECT_PROMPT,
  ART_DIRECTOR_SYSTEM_PROMPT,
  TREND_HUNTER_SYSTEM_PROMPT
} from "../constants";
import { Slide, Brand, LayerElement, AssetType, GeneratedAsset, TrendIdea } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseSafeJSON = (text: string) => {
  if (!text) return null;
  try {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const startObj = cleaned.indexOf('{');
    const endObj = cleaned.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1) {
      cleaned = cleaned.substring(startObj, endObj + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("ESCAMAS Blueprint Parse Error:", text);
    return null;
  }
};

export const decomposeSlideLayers = async (slide: Slide, brand: Brand) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `HEADLINE: "${slide.text_content.headline}". BRAND: ${brand.name}. 
      AÇÃO: Gere o blueprint JSON de 8 camadas para este post.`,
      config: { 
        systemInstruction: ESCAMAS_ARCHITECT_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            background_prompt: { type: Type.STRING, description: "Prompt para o fundo base" },
            layers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { 
                    type: Type.STRING, 
                    enum: ["atmospheric", "design", "subject", "person", "dynamic", "textfx"],
                    description: "Tipo fixo da camada" 
                  },
                  prompt: { type: Type.STRING, description: "Prompt técnico isolado" },
                  initial_pos: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      scale: { type: Type.NUMBER },
                      zIndex: { type: Type.NUMBER }
                    },
                    required: ["x", "y", "scale", "zIndex"]
                  }
                },
                required: ["type", "prompt", "initial_pos"]
              }
            }
          },
          required: ["background_prompt", "layers"]
        }
      }
    });

    return parseSafeJSON(response.text);
  } catch (e) {
    console.error("Erro crítico na Decomposição:", e);
    return null;
  }
};

export const generateEscamasAsset = async (prompt: string, layerType: string, layerIndex: number): Promise<string> => {
  let technicalContext = "";
  if (layerIndex === 1) technicalContext = "Cinematic background environment, no text, no people, high definition.";
  else technicalContext = "Single element isolated on pure white background, high quality 3D render or professional photography, studio lighting, centered.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `${prompt}. ${technicalContext}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return "";
  } catch (e) { return ""; }
};

export const generateCarouselStructure = async (data: any, brand: any) => {
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Topic: ${data.topic}. Brand: ${brand.name}.`,
        config: { 
            systemInstruction: CONTENT_ARCHITECT_SYSTEM_PROMPT, 
            responseMimeType: 'application/json'
        }
      });
      return parseSafeJSON(response.text);
  } catch (e) { return null; }
};

export const generateImagePrompt = async (slide: Slide, brand: Brand, style: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Headline: ${slide.text_content.headline}. Style: ${style}.`,
    config: { systemInstruction: ART_DIRECTOR_SYSTEM_PROMPT }
  });
  return response.text || "";
};

export const generateSlideImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "4:3" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return "";
};

export const generateTrendIdeas = async (topic: string): Promise<TrendIdea[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Trends for: ${topic}`,
      config: { systemInstruction: TREND_HUNTER_SYSTEM_PROMPT, tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseSafeJSON(response.text) || [];
  } catch (e) { return []; }
};

export const generateAssets = async (type: AssetType, context: string, brand: Brand): Promise<GeneratedAsset[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `High quality ${type} for ${brand.name}: ${context}, isolated on white.` }] },
  });
  const assets: GeneratedAsset[] = [];
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      assets.push({ id: crypto.randomUUID(), url: `data:image/png;base64,${part.inlineData.data}`, label: `${type}` });
    }
  }
  return assets;
};

export const generateProImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { imageSize: size, aspectRatio: "1:1" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return "";
};

export const editImage = async (base64: string, prompt: string): Promise<string> => {
  const mime = base64.split(';')[0].split(':')[1];
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64.split(',')[1], mimeType: mime } }, { text: prompt }] }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return "";
};

export const generateVideo = async (prompt: string, image: string | null, ratio: '16:9' | '9:16'): Promise<string> => {
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: image ? { imageBytes: image.split(',')[1], mimeType: 'image/png' } : undefined,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: ratio }
  });
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
};

export const analyzeMedia = async (data: string, mimeType: string, prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ inlineData: { data: data.split(',')[1], mimeType } }, { text: prompt }] }
  });
  return response.text || "";
};
