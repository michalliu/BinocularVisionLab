
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  View, 
  PerspectiveCamera, 
  OrbitControls, 
  Environment, 
  Grid,
  TorusKnot, 
  Sphere, 
  Box,
  Text,
  Float,
  Line,
  Cone
} from '@react-three/drei';
import * as THREE from 'three';
import { SimulationParams, ViewMode } from '../types';

interface SimulationCanvasProps {
  params: SimulationParams;
  viewMode: ViewMode;
}

// Reusable 3D Scene Content
const SceneContent = ({ params, isGodView = false }: { params: SimulationParams, isGodView?: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#6366f1", 
    roughness: 0.2, 
    metalness: 0.8,
    wireframe: params.wireframe
  }), [params.wireframe]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="city" />
      
      <Grid 
        position={[0, -2, 0]} 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={1} 
        cellColor="#334155" 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#64748b" 
        fadeDistance={20} 
      />

      <Float speed={isGodView ? 0 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={meshRef} scale={params.objectScale}>
          {params.objectType === 'torus' && (
            <TorusKnot args={[1, 0.3, 128, 32]} material={material} />
          )}
          {params.objectType === 'cube' && (
            <Box args={[2, 2, 2]} material={material} />
          )}
          {params.objectType === 'sphere' && (
            <Sphere args={[1.5, 64, 64]} material={material} />
          )}
          {params.objectType === 'dna' && (
             <group>
               {Array.from({ length: 10 }).map((_, i) => (
                 <group key={i} position={[0, (i - 5) * 0.8, 0]} rotation={[0, i * 0.5, 0]}>
                   <Sphere args={[0.2]} position={[1, 0, 0]} material={material} />
                   <Sphere args={[0.2]} position={[-1, 0, 0]} material={material} />
                   <Box args={[2, 0.05, 0.05]} material={material} />
                 </group>
               ))}
             </group>
          )}
        </group>
      </Float>

      {/* Background Reference Objects for Parallax */}
      <group>
        <Sphere position={[-5, 0, -10]} args={[1]} material={new THREE.MeshStandardMaterial({ color: '#ef4444', wireframe: params.wireframe })} />
        <Sphere position={[6, 3, -15]} args={[2]} material={new THREE.MeshStandardMaterial({ color: '#10b981', wireframe: params.wireframe })} />
        <Box position={[0, -2, -5]} args={[1, 1, 1]} material={new THREE.MeshStandardMaterial({ color: '#fbbf24', wireframe: params.wireframe })} />
      </group>
    </>
  );
};

// Component to visualize the physical cameras in God View
const CameraVisualizer = ({ params }: { params: SimulationParams }) => {
  const halfBaseLine = (params.ipd * 0.001) / 2;
  const camZ = params.targetDistance;
  const convergenceAngle = Math.atan(halfBaseLine / params.targetDistance);

  const CameraMesh = ({ color, pos, rot, label }: { color: string, pos: [number, number, number], rot: [number, number, number], label: string }) => (
    <group position={pos} rotation={rot}>
      {/* Camera Body */}
      <Box args={[0.4, 0.3, 0.6]} material={new THREE.MeshStandardMaterial({ color: '#334155' })} />
      <Cone args={[0.25, 0.4, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })} />
      
      {/* Lens */}
      <Sphere args={[0.15]} position={[0, 0, -0.7]} material={new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 })} />
      
      {/* Label */}
      <Text position={[0, 0.5, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="bottom">
        {label}
      </Text>

      {/* Frustum Line (Visual Cone) */}
      <Line 
        points={[[0, 0, 0], [0, 0, -params.targetDistance * 1.2]]} 
        color={color} 
        lineWidth={1} 
        transparent 
        opacity={0.3} 
        dashed 
      />
    </group>
  );

  return (
    <>
      <CameraMesh 
        color="#22d3ee" 
        pos={[-halfBaseLine, 0, camZ]} 
        rot={[0, -convergenceAngle, 0]} 
        label="左眼 (L)"
      />
      <CameraMesh 
        color="#f87171" 
        pos={[halfBaseLine, 0, camZ]} 
        rot={[0, convergenceAngle, 0]} 
        label="右眼 (R)"
      />
      
      {/* Target Lines */}
      <Line 
        points={[[-halfBaseLine, 0, camZ], [0, 0, 0]]} 
        color="#22d3ee" 
        lineWidth={2} 
        transparent 
        opacity={0.2} 
      />
      <Line 
        points={[[halfBaseLine, 0, camZ], [0, 0, 0]]} 
        color="#f87171" 
        lineWidth={2} 
        transparent 
        opacity={0.2} 
      />
    </>
  );
};

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ params, viewMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewLeftRef = useRef<HTMLDivElement>(null);
  const viewRightRef = useRef<HTMLDivElement>(null);
  const viewGodRef = useRef<HTMLDivElement>(null);

  const halfBaseLine = (params.ipd * 0.001) / 2;
  const convergenceAngle = Math.atan(halfBaseLine / params.targetDistance);
  const camZ = params.targetDistance;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      
      {/* Top Section: Stereo Views */}
      <div className="flex-1 relative min-h-0 flex flex-row">
        {/* Left Eye Container */}
        <div ref={viewLeftRef} className={`relative h-full transition-all duration-300 ${viewMode === ViewMode.SIDE_BY_SIDE ? 'w-1/2 border-r border-slate-700' : 'w-full'} ${viewMode === ViewMode.ANAGLYPH || viewMode === ViewMode.OVERLAY ? 'absolute inset-0 mix-blend-screen opacity-100 z-10' : ''}`}>
          <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-900">
            左眼视图 (L)
          </div>
        </div>

        {/* Right Eye Container */}
        <div ref={viewRightRef} className={`relative h-full transition-all duration-300 ${viewMode === ViewMode.SIDE_BY_SIDE ? 'w-1/2' : 'w-full'} ${viewMode === ViewMode.ANAGLYPH || viewMode === ViewMode.OVERLAY ? 'absolute inset-0 mix-blend-screen opacity-50 z-20 pointer-events-none' : ''}`}>
           <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-red-400 border border-red-900">
            右眼视图 (R)
          </div>
        </div>

        {/* Anaglyph/Overlay Hint */}
        {(viewMode === ViewMode.ANAGLYPH || viewMode === ViewMode.OVERLAY) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-800/80 px-4 py-2 rounded text-sm text-slate-300 pointer-events-none border border-slate-600">
            {viewMode === ViewMode.ANAGLYPH ? "红蓝3D模式: 请佩戴红蓝眼镜" : "叠加对比模式"}
          </div>
        )}
      </div>

      {/* Bottom Section: God View */}
      <div className="h-1/3 border-t border-slate-700 relative bg-slate-900/50">
        <div ref={viewGodRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-20 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-amber-400 border border-amber-900/50">
          上帝视角 (GOD VIEW)
        </div>
        <div className="absolute bottom-2 right-2 z-20 text-[10px] text-slate-500 font-mono">
          鼠标左键旋转 · 滚轮缩放
        </div>
      </div>
      
      {/* The Single Canvas Logic */}
      <Canvas 
        className="w-full h-full block fixed inset-0 pointer-events-none" 
        eventSource={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        {/* Left View */}
        <View track={viewLeftRef as React.MutableRefObject<HTMLElement>}>
          <color attach="background" args={['#0f172a']} />
          <PerspectiveCamera 
            makeDefault 
            position={[-halfBaseLine, 0, camZ]} 
            fov={45}
            rotation={[0, -convergenceAngle, 0]}
          />
          <SceneContent params={params} />
           {viewMode === ViewMode.OVERLAY && (
              <mesh position={[0,0,camZ - 1]}>
                 <planeGeometry args={[100,100]} />
                 <meshBasicMaterial color="cyan" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthTest={false} />
              </mesh>
           )}
           {viewMode === ViewMode.ANAGLYPH && (
             <mesh position={[0,0,camZ - 0.5]}>
                <planeGeometry args={[100,100]} />
                <meshBasicMaterial color="#ff0000" blending={THREE.MultiplyBlending} transparent opacity={1} depthTest={false} side={THREE.DoubleSide} />
             </mesh>
           )}
        </View>

        {/* Right View */}
        <View track={viewRightRef as React.MutableRefObject<HTMLElement>}>
           <color attach="background" args={['#0f172a']} />
          <PerspectiveCamera 
            makeDefault 
            position={[halfBaseLine, 0, camZ]} 
            fov={45} 
            rotation={[0, convergenceAngle, 0]}
          />
          <SceneContent params={params} />
           {viewMode === ViewMode.OVERLAY && (
              <mesh position={[0,0,camZ - 1]}>
                 <planeGeometry args={[100,100]} />
                 <meshBasicMaterial color="red" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthTest={false} />
              </mesh>
           )}
           {viewMode === ViewMode.ANAGLYPH && (
             <mesh position={[0,0,camZ - 0.5]}>
                <planeGeometry args={[100,100]} />
                <meshBasicMaterial color="#00ffff" blending={THREE.MultiplyBlending} transparent opacity={1} depthTest={false} side={THREE.DoubleSide} />
             </mesh>
           )}
        </View>

        {/* God View (Third Person) */}
        <View track={viewGodRef as React.MutableRefObject<HTMLElement>}>
          <color attach="background" args={['#1e293b']} />
          <PerspectiveCamera makeDefault position={[0, 8, params.targetDistance + 5]} fov={50} />
          <OrbitControls makeDefault minDistance={2} maxDistance={20} />
          <SceneContent params={params} isGodView={true} />
          <CameraVisualizer params={params} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
        </View>
      </Canvas>
    </div>
  );
};
