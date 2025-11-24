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
  Float
} from '@react-three/drei';
import * as THREE from 'three';
import { SimulationParams, ViewMode } from '../types';

interface SimulationCanvasProps {
  params: SimulationParams;
  viewMode: ViewMode;
}

// Reusable 3D Scene Content
const SceneContent = ({ params }: { params: SimulationParams }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#6366f1", 
    roughness: 0.2, 
    metalness: 0.8 
  }), []);

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

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, 0, -params.targetDistance + 2.5]}> 
          {/* Offset by 2.5 because default camera is usually back, but we control camera pos. 
              Actually, let's keep object at 0,0,0 and move cameras. 
          */}
        </group>
      </Float>

      {/* Main Target Object placed at origin */}
      <group ref={meshRef}>
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

      {/* Background Reference Objects for Parallax */}
      <group>
        <Sphere position={[-5, 0, -10]} args={[1]} material={new THREE.MeshStandardMaterial({ color: '#ef4444' })} />
        <Sphere position={[6, 3, -15]} args={[2]} material={new THREE.MeshStandardMaterial({ color: '#10b981' })} />
        <Box position={[0, -2, -5]} args={[1, 1, 1]} material={new THREE.MeshStandardMaterial({ color: '#fbbf24' })} />
      </group>
    </>
  );
};

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ params, viewMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewLeftRef = useRef<HTMLDivElement>(null);
  const viewRightRef = useRef<HTMLDivElement>(null);

  // Calculate Camera Positions based on IPD
  // IPD is in mm, scene is in meters. 1 unit = 1 meter usually in ThreeJS defaults but let's be explicit.
  // ipd mm = ipd * 0.001 meters.
  const halfBaseLine = (params.ipd * 0.001) / 2;
  
  // To converge at targetDistance, we rotate cameras inward.
  // theta = atan(halfBaseline / targetDistance)
  const convergenceAngle = Math.atan(halfBaseLine / params.targetDistance);

  // Camera positions
  // We place cameras at z = +distance to look at origin (0,0,0) if we want object at origin.
  // BUT the prop says "Target Object Distance".
  // Let's place Object at (0,0,0).
  // Place cameras at (x, 0, distance).
  const camZ = params.targetDistance;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
      {/* HTML Elements acting as Viewports */}
      <div className="absolute inset-0 flex flex-row">
        {/* Left Eye Container */}
        <div ref={viewLeftRef} className={`relative h-full transition-all duration-300 ${viewMode === ViewMode.SIDE_BY_SIDE ? 'w-1/2 border-r border-slate-700' : 'w-full'} ${viewMode === ViewMode.ANAGLYPH || viewMode === ViewMode.OVERLAY ? 'absolute inset-0 mix-blend-screen opacity-100 z-10' : ''}`}>
          <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-900">
            LEFT EYE (L)
          </div>
          {/* For Anaglyph, we might tint this container using CSS filters if we don't use shaders, 
              but standard CSS mix-blend-mode exclusion/screen is easier for simulation.
              Real anaglyph requires red/cyan channel masking. We will simulate overlay comparison. 
          */}
        </div>

        {/* Right Eye Container */}
        <div ref={viewRightRef} className={`relative h-full transition-all duration-300 ${viewMode === ViewMode.SIDE_BY_SIDE ? 'w-1/2' : 'w-full'} ${viewMode === ViewMode.ANAGLYPH || viewMode === ViewMode.OVERLAY ? 'absolute inset-0 mix-blend-screen opacity-50 z-20 pointer-events-none' : ''}`}>
           <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-mono text-red-400 border border-red-900">
            RIGHT EYE (R)
          </div>
        </div>
      </div>
      
      {/* Anaglyph/Overlay Hint */}
      {(viewMode === ViewMode.ANAGLYPH || viewMode === ViewMode.OVERLAY) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-800/80 px-4 py-2 rounded text-sm text-slate-300 pointer-events-none">
          Overlay Mode: Left (Cyan Tint) vs Right (Red Tint)
        </div>
      )}

      {/* The Single Canvas Logic */}
      <Canvas 
        className="w-full h-full block" 
        eventSource={containerRef}
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
          {/* For overlay mode, we can change the background color or add a filter visual 
              Here we keep it simple: Pure rendering. 
              If ViewMode is OVERLAY, the DOM elements handle the blending (opacity 50%).
          */}
           {viewMode === ViewMode.OVERLAY && (
              <mesh position={[0,0,camZ - 1]}>
                 <planeGeometry args={[100,100]} />
                 <meshBasicMaterial color="cyan" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthTest={false} />
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
        </View>
      </Canvas>
    </div>
  );
};
