import React from 'react';
import { SimulationParams, ViewMode } from '../types';
import { MIN_IPD, MAX_IPD, MIN_DISTANCE, MAX_DISTANCE } from '../constants';
import { Sliders, Eye, Box, Move3d } from 'lucide-react';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const Slider = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit, 
  onChange 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  unit: string; 
  onChange: (val: number) => void; 
}) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm text-slate-400 mb-1">
      <label>{label}</label>
      <span className="font-mono text-slate-200">{value.toFixed(1)} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    />
  </div>
);

export const Controls: React.FC<ControlsProps> = ({ 
  params, 
  setParams, 
  viewMode, 
  setViewMode, 
  onAnalyze, 
  isAnalyzing 
}) => {
  
  const updateParam = (key: keyof SimulationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-800/50 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 text-indigo-400">
        <Sliders className="w-5 h-5" />
        <h2 className="text-lg font-semibold tracking-wide uppercase">Parameters</h2>
      </div>

      <div className="space-y-6">
        {/* Optical Parameters */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" /> Optics
          </h3>
          
          <Slider
            label="IPD (Baseline)"
            value={params.ipd}
            min={MIN_IPD}
            max={MAX_IPD}
            step={0.5}
            unit="mm"
            onChange={(v) => updateParam('ipd', v)}
          />
          
          <Slider
            label="Object Distance"
            value={params.targetDistance}
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={0.1}
            unit="m"
            onChange={(v) => updateParam('targetDistance', v)}
          />

          <Slider
            label="Focal Length"
            value={params.focalLength}
            min={15}
            max={200}
            step={1}
            unit="mm"
            onChange={(v) => updateParam('focalLength', v)}
          />
        </div>

        {/* Scene Objects */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
           <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-400" /> Subject
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {['torus', 'cube', 'sphere', 'dna'].map((type) => (
              <button
                key={type}
                onClick={() => updateParam('objectType', type)}
                className={`p-2 rounded text-xs font-medium uppercase transition-colors ${
                  params.objectType === type 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
           <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Move3d className="w-4 h-4 text-amber-400" /> Visualization
          </h3>
          <div className="flex bg-slate-800 rounded p-1">
            <button
              onClick={() => setViewMode(ViewMode.SIDE_BY_SIDE)}
              className={`flex-1 py-1.5 text-xs rounded transition-all ${viewMode === ViewMode.SIDE_BY_SIDE ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Split (SBS)
            </button>
            <button
              onClick={() => setViewMode(ViewMode.OVERLAY)}
              className={`flex-1 py-1.5 text-xs rounded transition-all ${viewMode === ViewMode.OVERLAY ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Overlay
            </button>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
        >
          {isAnalyzing ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <span className="group-hover:scale-105 transition-transform">Analyze with Gemini</span>
          )}
        </button>
      </div>
    </div>
  );
};
