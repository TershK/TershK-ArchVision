import { GoogleGenAI } from "@google/genai";
import { DesignConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Keep Gemini for text analysis/validation
const TEXT_MODEL = 'gemini-2.5-flash';

// Unsplash Configuration
const UNSPLASH_ACCESS_KEY = 'TJ67hozVYyJOCXCmIGelYJrymFutZz0m7ZT_zzZlcLw';
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export const validateCustomInstructions = async (instructions: string): Promise<boolean> => {
  if (!instructions || instructions.trim().length === 0) return true;

  const prompt = `
    You are a content safety filter for an architecture generation app.
    
    User Input: "${instructions}"

    Task: Determine if this input describes a house, building, architectural feature, design style, interior design, or landscape element.
    
    Rules:
    1. If the input is about food, animals (as subjects), people, politics, violence, coding, or random gibberish -> Return INVALID.
    2. If the input is about a house style, room, material, color, landscape, or architectural detail -> Return VALID.
    
    Response Format: strictly just the word "VALID" or "INVALID".
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [{ text: prompt }]
      }
    });

    const text = response.text?.trim().toUpperCase();
    return text?.includes("VALID") && !text?.includes("INVALID");
  } catch (error) {
    console.error("Validation check failed:", error);
    // Fail safe: if validation API fails (e.g. no Gemini key), allow it to proceed.
    return true; 
  }
};

const searchUnsplash = async (query: string): Promise<string> => {
  try {
    // Fetch multiple results to provide variety in "generation"
    const response = await fetch(
      `${UNSPLASH_API_URL}?client_id=${UNSPLASH_ACCESS_KEY}&query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Pick a random image from the results to simulate generation
      const randomIndex = Math.floor(Math.random() * data.results.length);
      return data.results[randomIndex].urls.regular;
    }
    
    throw new Error("No images found for query");
  } catch (error) {
    console.error("Unsplash search failed:", error);
    // Fallback image in case of API limits or errors
    return "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80";
  }
};

export const generateBlueprint = async (config: DesignConfig): Promise<string> => {
  // Construct a query to find floor plans or architectural sketches
  // Note: Unsplash has limited "technical" blueprints, so we broaden terms to architectural drawings
  const query = `architectural floor plan blueprint sketch drawing white background`;
  return await searchUnsplash(query);
};

export const generateExterior = async (config: DesignConfig): Promise<string> => {
  // Construct a rich query based on the config
  const features = config.features.slice(0, 3).join(" "); // Use top 3 features
  const styleTerm = config.style.replace("Modern Minimalist", "Modern Architecture")
                                .replace("Traditional Family", "Traditional House")
                                .replace("Compact Urban", "Urban Modern House");
                                
  const query = `${styleTerm} exterior house architecture ${features} ${config.customInstructions}`;
  return await searchUnsplash(query);
};