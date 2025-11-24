
export interface SimulationParams {
  ipd: number; // Interpupillary distance in mm (default ~64mm)
  focalLength: number; // Camera focal length in mm
  targetDistance: number; // Distance to the focus object in meters
  vergenceAngle: number; // Calculated angle (read-only for display usually)
  objectType: 'cube' | 'sphere' | 'torus' | 'dna';
  wireframe: boolean;
  objectScale: number; // Scale factor for the target object
  cameraSize: number; // Scale factor for the camera visualizer in God View
  isPaused: boolean; // Controls rotation animation
}

export interface AIAnalysisResult {
  title: string;
  explanation: string;
  depthImplications: string;
  technicalNote: string;
}

export enum ViewMode {
  SIDE_BY_SIDE = 'SBS',
  ANAGLYPH = 'ANAGLYPH',
  OVERLAY = 'OVERLAY'
}