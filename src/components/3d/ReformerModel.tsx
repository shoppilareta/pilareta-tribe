'use client';

import * as THREE from 'three';

interface ReformerProps {
  carriagePosition?: number; // 0 = home (near headrest), 1 = fully extended (near footbar)
}

export function ReformerModel({ carriagePosition = 0 }: ReformerProps) {
  // Reformer dimensions (scaled for human model ~1.7m tall)
  const FRAME_LENGTH = 2.4;
  const FRAME_WIDTH = 0.65;
  const FRAME_HEIGHT = 0.35;
  const CARRIAGE_LENGTH = 0.95;
  const RAIL_HEIGHT = 0.06;

  // Carriage slides from -0.6 (home) to +0.5 (extended)
  const carriageX = -0.6 + carriagePosition * 1.1;

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* Main Frame Base */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[FRAME_LENGTH, 0.04, FRAME_WIDTH]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>

      {/* Frame Legs - Front Left */}
      <mesh position={[FRAME_LENGTH / 2 - 0.1, FRAME_HEIGHT / 2, -FRAME_WIDTH / 2 + 0.05]}>
        <boxGeometry args={[0.08, FRAME_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      {/* Frame Legs - Front Right */}
      <mesh position={[FRAME_LENGTH / 2 - 0.1, FRAME_HEIGHT / 2, FRAME_WIDTH / 2 - 0.05]}>
        <boxGeometry args={[0.08, FRAME_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      {/* Frame Legs - Back Left */}
      <mesh position={[-FRAME_LENGTH / 2 + 0.1, FRAME_HEIGHT / 2, -FRAME_WIDTH / 2 + 0.05]}>
        <boxGeometry args={[0.08, FRAME_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      {/* Frame Legs - Back Right */}
      <mesh position={[-FRAME_LENGTH / 2 + 0.1, FRAME_HEIGHT / 2, FRAME_WIDTH / 2 - 0.05]}>
        <boxGeometry args={[0.08, FRAME_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      {/* Left Rail */}
      <mesh position={[0, FRAME_HEIGHT, -FRAME_WIDTH / 2 + 0.08]}>
        <boxGeometry args={[FRAME_LENGTH - 0.2, RAIL_HEIGHT, 0.04]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Right Rail */}
      <mesh position={[0, FRAME_HEIGHT, FRAME_WIDTH / 2 - 0.08]}>
        <boxGeometry args={[FRAME_LENGTH - 0.2, RAIL_HEIGHT, 0.04]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Carriage (the moving platform) */}
      <group position={[carriageX, FRAME_HEIGHT + RAIL_HEIGHT / 2 + 0.04, 0]}>
        {/* Carriage Platform */}
        <mesh>
          <boxGeometry args={[CARRIAGE_LENGTH, 0.06, FRAME_WIDTH - 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Carriage Padding (where person lies) */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[CARRIAGE_LENGTH - 0.05, 0.03, FRAME_WIDTH - 0.25]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Headrest */}
      <group position={[-FRAME_LENGTH / 2 + 0.25, FRAME_HEIGHT + RAIL_HEIGHT / 2 + 0.04, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.28]} />
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>
        {/* Headrest Cushion */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.25]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Footbar */}
      <group position={[FRAME_LENGTH / 2 - 0.15, FRAME_HEIGHT + 0.15, 0]}>
        {/* Footbar Supports */}
        <mesh position={[0, 0.1, -FRAME_WIDTH / 2 + 0.12]}>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.1, FRAME_WIDTH / 2 - 0.12]}>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.5} />
        </mesh>
        {/* Footbar Horizontal Bar */}
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, FRAME_WIDTH - 0.2, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Shoulder Rests (blocks on either side of carriage) */}
      <mesh position={[carriageX - CARRIAGE_LENGTH / 2 + 0.08, FRAME_HEIGHT + 0.18, -0.18]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[carriageX - CARRIAGE_LENGTH / 2 + 0.08, FRAME_HEIGHT + 0.18, 0.18]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Springs (simplified visual representation) */}
      <group position={[FRAME_LENGTH / 2 - 0.4, FRAME_HEIGHT - 0.05, 0]}>
        {[-0.15, -0.05, 0.05, 0.15].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
            <meshStandardMaterial
              color={i < 2 ? '#cc3333' : '#3366cc'}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Straps/Ropes (simplified) */}
      <group position={[0.2, FRAME_HEIGHT + 0.05, 0]}>
        {/* Left strap */}
        <mesh position={[0, 0.15, -0.25]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.02, 0.4, 0.03]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        {/* Right strap */}
        <mesh position={[0, 0.15, 0.25]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.02, 0.4, 0.03]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
    </group>
  );
}
