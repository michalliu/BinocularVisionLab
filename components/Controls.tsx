import React, { useState, useEffect, useRef } from 'react';
import { SimulationParams, ViewMode } from '../types';
import { MIN_IPD, MAX_IPD, MIN_DISTANCE, MAX_DISTANCE } from '../constants';
import { Sliders, Eye, Box, Move3d, Grid3X3 } from 'lucide-react';

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
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with props when not focused
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    let newValue = parseFloat(inputValue);
    if (isNaN(newValue)) {
      newValue = value;
    } else {
      newValue = Math.max(min, Math.min(max, newValue));
    }
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
        <label>{label}</label>
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-right font-mono text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <span className="font-mono text-slate-500 text-xs w-6">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          onChange(parseFloat(e.target.value));
        }}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
    </div>
  );
};

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
        <h2 className="text-lg font-semibold tracking-wide uppercase">控制面板</h2>
      </div>

      <div className="space-y-6">
        {/* Optical Parameters */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" /> 光学参数
          </h3>
          
          <Slider
            label="瞳距 (IPD)"
            value={params.ipd}
            min={MIN_IPD}
            max={MAX_IPD}
            step={0.5}
            unit="mm"
            onChange={(v) => updateParam('ipd', v)}
          />
          
          <Slider
            label="物体距离"
            value={params.targetDistance}
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={0.1}
            unit="m"
            onChange={(v) => updateParam('targetDistance', v)}
          />

          <Slider
            label="焦距 (Focal Length)"
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
            <Box className="w-4 h-4 text-emerald-400" /> 目标物体
          </h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
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

          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-400 flex items-center gap-2">
              <Grid3X3 className="w-3 h-3" /> 网格模式
            </label>
             <button 
              onClick={() => updateParam('wireframe', !params.wireframe)}
              className={`w-12 h-6 rounded-full transition-colors relative ${params.wireframe ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${params.wireframe ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* View Mode */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
           <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Move3d className="w-4 h-4 text-amber-400" /> 视图模式
          </h3>
          <div className="grid grid-cols-3 gap-1 bg-slate-800 rounded p-1">
            <button
              onClick={() => setViewMode(ViewMode.SIDE_BY_SIDE)}
              className={`py-1.5 text-[10px] sm:text-xs rounded transition-all ${viewMode === ViewMode.SIDE_BY_SIDE ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              分屏 (SBS)
            </button>
            <button
              onClick={() => setViewMode(ViewMode.OVERLAY)}
              className={`py-1.5 text-[10px] sm:text-xs rounded transition-all ${viewMode === ViewMode.OVERLAY ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              叠加对比
            </button>
            <button
              onClick={() => setViewMode(ViewMode.ANAGLYPH)}
              className={`py-1.5 text-[10px] sm:text-xs rounded transition-all ${viewMode === ViewMode.ANAGLYPH ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              红蓝3D
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
             <span className="group-hover:scale-105 transition-transform">Gemini AI 分析</span>
          )}
        </button>
      </div>
    </div>
  );
};