import { GoogleGenAI, Type } from "@google/genai";
import { SimulationParams, AIAnalysisResult } from "../types";
import { GEMINI_MODEL_FLASH, AI_SYSTEM_INSTRUCTION } from "../constants";

const apiKey = process.env.API_KEY || '';

// Safely initialize GenAI only if key exists, otherwise we'll handle errors gracefully in the UI
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeSimulation = async (params: SimulationParams): Promise<AIAnalysisResult> => {
  if (!ai) {
    throw new Error("Gemini API Key is missing. Please check your environment configuration.");
  }

  const prompt = `
    Analyze the following binocular vision simulation setup:
    - Interpupillary Distance (Baseline): ${params.ipd} mm
    - Focal Length: ${params.focalLength} mm
    - Target Object Distance: ${params.targetDistance} meters
    
    Please provide:
    1. A short title for this configuration state (e.g., "Hyper-Stereo Vision", "Standard Human Vision").
    2. An explanation of how the current baseline affects depth perception (stereopsis).
    3. The implications for depth resolution (e.g., is the disparity large or small?).
    4. A technical note on potential visual comfort or computer vision application.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: prompt,
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            explanation: { type: Type.STRING },
            depthImplications: { type: Type.STRING },
            technicalNote: { type: Type.STRING }
          },
          required: ["title", "explanation", "depthImplications", "technicalNote"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};
