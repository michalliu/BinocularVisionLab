export const DEFAULT_PARAMS = {
  ipd: 64, // mm
  focalLength: 50, // mm
  targetDistance: 2.5, // meters
  vergenceAngle: 0,
  objectType: 'torus' as const,
};

export const MIN_IPD = 0; // Cyclops!
export const MAX_IPD = 200; // Hammerhead shark simulation
export const MIN_DISTANCE = 0.5;
export const MAX_DISTANCE = 10.0;

export const GEMINI_MODEL_FLASH = 'gemini-2.5-flash';

export const AI_SYSTEM_INSTRUCTION = `You are an expert Professor of Optics, Computer Vision, and Ophthalmology. 
Your goal is to explain binocular vision concepts based on the user's simulation settings. 
Keep explanations concise, educational, and focused on the physics of stereopsis, disparity, and depth perception.
Avoid markdown code blocks unless necessary for math formulas. Use bolding for key terms.`;
