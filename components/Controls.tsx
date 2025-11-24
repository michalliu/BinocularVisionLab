
import React, { useState, useEffect, useRef } from 'react';
import { SimulationParams, ViewMode } from '../types';
import { MIN_IPD, MAX_IPD, MIN_DISTANCE, MAX_DISTANCE } from '../constants';
import { Sliders, Eye, Box, Move3d, Grid3X3, Info, Scaling, Monitor, Play, Pause } from 'lucide-react';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

interface SliderProps {
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  unit: string; 
  onChange: (val: number) => void;
  tooltipTitle?: string;
  tooltipContent?: string;
}

const Slider = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit, 
  onChange,
  tooltipTitle,
  tooltipContent
}: SliderProps) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [showTooltip, setShowTooltip] = useState(false);
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
    <div className="mb-5 relative group/slider">
      <div 
        className="flex justify-between items-center text-sm text-slate-400 mb-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-1.5 cursor-help">
          <label className="group-hover/slider:text-indigo-300 transition-colors">{label}</label>
          {tooltipTitle && <Info className="w-3.5 h-3.5 text-slate-600 group-hover/slider:text-indigo-400 transition-colors" />}
        </div>
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

      {/* Educational Tooltip Overlay */}
      {tooltipTitle && tooltipContent && (
        <div className={`
          absolute left-0 top-full mt-2 w-full z-50 
          bg-slate-900/95 backdrop-blur-md border border-slate-600/50 
          p-3 rounded-lg shadow-2xl shadow-black/50
          transition-all duration-200 origin-top
          ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}>
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-xs text-indigo-100">{tooltipTitle}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {tooltipContent}
          </p>
          {/* Arrow */}
          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-900/95 border-t border-l border-slate-600/50 transform rotate-45"></div>
        </div>
      )}
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
    <div className="h-full flex flex-col p-6 bg-slate-800/50 overflow-y-auto custom-scrollbar">
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
            tooltipTitle="瞳孔间距 (Interpupillary Distance)"
            tooltipContent="左右眼瞳孔中心之间的距离（成人平均约63mm）。增大瞳距会增强双眼视差，从而增强立体感，但也可能导致物体看起来变小（巨人效应）；减小瞳距则会减弱立体感，使世界显得巨大。"
          />
          
          <Slider
            label="物体距离"
            value={params.targetDistance}
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={0.1}
            unit="m"
            onChange={(v) => updateParam('targetDistance', v)}
            tooltipTitle="目标物体距离"
            tooltipContent="观察者与注视点之间的距离。距离越近，双眼为了聚焦需要进行的内转（辐辏）角度越大，产生的视差也越明显，这是大脑判断近距离深度的重要线索。远距离时视线趋于平行，立体感减弱。"
          />

          <Slider
            label="焦距 (Focal Length)"
            value={params.focalLength}
            min={15}
            max={2000}
            step={1}
            unit="mm"
            onChange={(v) => updateParam('focalLength', v)}
            tooltipTitle="摄影机焦距 (FOV)"
            tooltipContent="模拟眼睛或相机的镜头焦距。较长的焦距（如85mm+）会压缩空间，使背景拉近，视野变窄；较短的广角焦距（如24mm）会夸大近大远小的透视效果，增强画面的纵深感和视觉冲击力。"
          />
        </div>

        {/* Scene Objects */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 z-0">
           <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-400" /> 目标物体
          </h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
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

          <Slider
            label="物体缩放"
            value={params.objectScale}
            min={0.1}
            max={3.0}
            step={0.1}
            unit="x"
            onChange={(v) => updateParam('objectScale', v)}
            tooltipTitle="物体尺寸缩放"
            tooltipContent="等比调整目标物体的大小。较小的物体需要更近的观察距离才能看清细节，而较大的物体即使在远处也能提供视差线索。调整此项可以模拟观察不同体量物体时的视觉体验。"
          />

          <div className="flex items-center justify-between border-t border-slate-700/50 pt-4 gap-4">
             {/* Wireframe Toggle */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => updateParam('wireframe', !params.wireframe)}
                className={`w-12 h-6 rounded-full transition-colors relative ${params.wireframe ? 'bg-indigo-500' : 'bg-slate-700'}`}
                title="切换网格模式"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${params.wireframe ? 'left-7' : 'left-1'}`} />
              </button>
              <label className="text-sm text-slate-400 flex items-center gap-2 cursor-pointer" onClick={() => updateParam('wireframe', !params.wireframe)}>
                <Grid3X3 className="w-3.5 h-3.5" /> 网格
              </label>
            </div>

            {/* Animation Toggle */}
             <div className="flex items-center gap-3">
              <button 
                onClick={() => updateParam('isPaused', !params.isPaused)}
                className={`w-12 h-6 rounded-full transition-colors relative ${!params.isPaused ? 'bg-emerald-500' : 'bg-slate-700'}`}
                title={params.isPaused ? "播放动画" : "暂停动画"}
              >
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow flex items-center justify-center ${!params.isPaused ? 'left-7' : 'left-1'}`}>
                   {params.isPaused ? <Pause className="w-2.5 h-2.5 text-slate-700" fill="currentColor" /> : <Play className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" />}
                 </div>
              </button>
               <label className="text-sm text-slate-400 flex items-center gap-2 cursor-pointer" onClick={() => updateParam('isPaused', !params.isPaused)}>
                 <Move3d className="w-3.5 h-3.5" /> 动画
              </label>
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
           <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-400" /> 显示设置
          </h3>
          <Slider
            label="相机模型大小"
            value={params.cameraSize}
            min={0.05}
            max={1.0}
            step={0.05}
            unit="x"
            onChange={(v) => updateParam('cameraSize', v)}
            tooltipTitle="上帝视角相机尺寸"
            tooltipContent="调整在上帝视角中代表左眼和右眼的摄像机模型大小。减小此数值可以避免在小瞳距设置下两个相机模型发生重叠，从而更清晰地观察光路结构。"
          />
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