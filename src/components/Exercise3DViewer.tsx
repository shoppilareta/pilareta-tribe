'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { ReformerModel } from './3d/ReformerModel';
import { HumanModel } from './3d/HumanModel';

interface Exercise3DViewerProps {
  exerciseSlug: string;
  showReformer?: boolean;
}

// Loading placeholder while 3D scene loads
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

export function Exercise3DViewer({
  exerciseSlug,
  showReformer = true,
}: Exercise3DViewerProps) {
  const [carriagePosition, setCarriagePosition] = useState(0.1);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          height: '320px',
          width: '100%',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
          borderRadius: '0.5rem 0.5rem 0 0',
        }}
      >
        <Canvas
          camera={{
            position: [2.5, 1.8, 2],
            fov: 40,
            near: 0.1,
            far: 100,
          }}
          shadows
        >
          <Suspense fallback={<LoadingPlaceholder />}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-3, 5, -3]} intensity={0.3} />

            {/* Environment for reflections */}
            <Environment preset="studio" />

            {/* Ground plane with contact shadows */}
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />

            {/* Floor */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.01, 0]}
              receiveShadow
            >
              <planeGeometry args={[12, 12]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Reformer */}
            {showReformer && (
              <ReformerModel carriagePosition={carriagePosition} />
            )}

            {/* Human figure with animation */}
            {isPlaying && (
              <HumanModel
                animation={exerciseSlug}
                onCarriageMove={setCarriagePosition}
              />
            )}

            {/* Camera controls */}
            <OrbitControls
              enablePan={false}
              minDistance={1.5}
              maxDistance={6}
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2 - 0.05}
              target={[0, 0.5, 0]}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls overlay */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: 'rgba(26, 26, 26, 0.95)',
          borderTop: '1px solid rgba(246, 237, 221, 0.1)',
        }}
      >
        {/* Play/Pause button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(246, 237, 221, 0.1)',
            border: '1px solid rgba(246, 237, 221, 0.2)',
            borderRadius: '0.375rem',
            color: '#f6eddd',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(246, 237, 221, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(246, 237, 221, 0.1)';
          }}
        >
          {isPlaying ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Instructions */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'rgba(246, 237, 221, 0.5)',
            margin: 0,
          }}
        >
          Drag to rotate &bull; Scroll to zoom
        </p>

        {/* 3D badge */}
        <span
          style={{
            padding: '0.25rem 0.5rem',
            background: 'rgba(246, 237, 221, 0.1)',
            borderRadius: '0.25rem',
            fontSize: '0.6875rem',
            color: 'rgba(246, 237, 221, 0.6)',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          3D PREVIEW
        </span>
      </div>
    </div>
  );
}
