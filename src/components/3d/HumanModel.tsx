'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

// Geometric human figure using spheres and cylinders
// Simplified but recognizable humanoid shape
export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Animation state refs for smooth interpolation
  const hipRotation = useRef(0);
  const spineRotation = useRef(0);
  const upperSpineRotation = useRef(0);

  // Body part colors
  const skinColor = '#d4a574';
  const clothingColor = '#2a3d4f';

  // Animation parameters for bridging
  const animationConfig = useMemo(() => ({
    bridging: {
      duration: 4, // 4 seconds per cycle
      phases: [
        { time: 0, hip: 0, spine: 0, upperSpine: 0 },
        { time: 0.5, hip: 0.1, spine: 0.05, upperSpine: 0 },
        { time: 1.5, hip: 0.5, spine: 0.25, upperSpine: 0.1 },
        { time: 2, hip: 0.6, spine: 0.3, upperSpine: 0.15 }, // Peak
        { time: 2.5, hip: 0.6, spine: 0.3, upperSpine: 0.15 }, // Hold
        { time: 3.5, hip: 0.2, spine: 0.1, upperSpine: 0.05 },
        { time: 4, hip: 0, spine: 0, upperSpine: 0 },
      ],
    },
  }), []);

  // Interpolate between keyframes
  const interpolateKeyframes = (time: number, keyframes: { time: number; hip: number; spine: number; upperSpine: number }[]) => {
    const duration = keyframes[keyframes.length - 1].time;
    const t = time % duration;

    let prev = keyframes[0];
    let next = keyframes[1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
        prev = keyframes[i];
        next = keyframes[i + 1];
        break;
      }
    }

    const segmentDuration = next.time - prev.time;
    const segmentProgress = segmentDuration > 0 ? (t - prev.time) / segmentDuration : 0;

    // Smooth easing
    const eased = segmentProgress < 0.5
      ? 2 * segmentProgress * segmentProgress
      : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2;

    return {
      hip: prev.hip + (next.hip - prev.hip) * eased,
      spine: prev.spine + (next.spine - prev.spine) * eased,
      upperSpine: prev.upperSpine + (next.upperSpine - prev.upperSpine) * eased,
    };
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    timeRef.current += delta;

    if (animation === 'bridging') {
      const config = animationConfig.bridging;
      const values = interpolateKeyframes(timeRef.current, config.phases);

      hipRotation.current = values.hip;
      spineRotation.current = values.spine;
      upperSpineRotation.current = values.upperSpine;

      // Notify parent of carriage position (slight movement during bridge)
      if (onCarriageMove) {
        onCarriageMove(0.1 + values.hip * 0.15);
      }
    }
  });

  // Calculate positions based on animation state
  const hipLift = hipRotation.current * 0.4;
  const spineCurve = spineRotation.current * 0.2;

  return (
    <group
      ref={groupRef}
      position={[-0.3, 0.52, 0]} // Position on the carriage
      rotation={[0, Math.PI / 2, 0]} // Facing along the reformer
    >
      {/* === LOWER BODY === */}

      {/* Pelvis/Hips - the primary lifting point */}
      <group position={[0, hipLift, 0]} rotation={[hipRotation.current * 0.5, 0, 0]}>
        {/* Hip sphere */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={clothingColor} />
        </mesh>

        {/* Upper Legs (Thighs) - bent at ~45 degrees for bridging position */}
        <group position={[0, 0, 0]}>
          {/* Left Thigh */}
          <group position={[0, 0, -0.1]} rotation={[0.8 - hipRotation.current * 0.3, 0, 0.1]}>
            <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.35, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Knee */}
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Lower Leg (Shin) - bent back for feet on footbar */}
            <group position={[0, 0.35, 0]} rotation={[-1.5 + hipRotation.current * 0.2, 0, 0]}>
              <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.04, 0.32, 12]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
              {/* Foot */}
              <mesh position={[0.05, 0.32, 0]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.06]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
            </group>
          </group>

          {/* Right Thigh */}
          <group position={[0, 0, 0.1]} rotation={[0.8 - hipRotation.current * 0.3, 0, -0.1]}>
            <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.35, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Knee */}
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Lower Leg */}
            <group position={[0, 0.35, 0]} rotation={[-1.5 + hipRotation.current * 0.2, 0, 0]}>
              <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.04, 0.32, 12]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
              {/* Foot */}
              <mesh position={[0.05, 0.32, 0]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.06]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* === TORSO === */}

      {/* Lower Spine - articulates during bridge */}
      <group
        position={[-0.1, hipLift * 0.7 + spineCurve, 0]}
        rotation={[-spineRotation.current * 0.4, 0, 0]}
      >
        {/* Lower Back */}
        <mesh position={[-0.1, 0.05, 0]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.11, 0.18, 12]} />
          <meshStandardMaterial color={clothingColor} />
        </mesh>

        {/* Upper Spine */}
        <group
          position={[-0.18, 0.05, 0]}
          rotation={[-upperSpineRotation.current * 0.3, 0, 0]}
        >
          {/* Mid Back */}
          <mesh position={[-0.08, 0, 0]} rotation={[Math.PI / 2 + 0.1, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.1, 0.16, 12]} />
            <meshStandardMaterial color={clothingColor} />
          </mesh>

          {/* Upper Back / Chest */}
          <mesh position={[-0.22, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.11, 0.2, 12]} />
            <meshStandardMaterial color={clothingColor} />
          </mesh>

          {/* Shoulders */}
          <mesh position={[-0.32, -0.02, 0]}>
            <boxGeometry args={[0.1, 0.08, 0.35]} />
            <meshStandardMaterial color={clothingColor} />
          </mesh>

          {/* Neck */}
          <mesh position={[-0.4, 0, 0]} rotation={[Math.PI / 2 - 0.2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.1, 12]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>

          {/* Head - stays on carriage/headrest */}
          <mesh position={[-0.52, 0.02, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>

          {/* === ARMS - resting at sides === */}

          {/* Left Arm */}
          <group position={[-0.32, -0.02, -0.2]}>
            {/* Upper Arm */}
            <mesh position={[0.1, -0.02, -0.02]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.035, 0.04, 0.25, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Elbow */}
            <mesh position={[0.2, -0.06, -0.02]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Forearm */}
            <mesh position={[0.32, -0.04, 0]} rotation={[0, 0, 0.5]}>
              <cylinderGeometry args={[0.03, 0.035, 0.22, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Hand */}
            <mesh position={[0.42, -0.02, 0]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group position={[-0.32, -0.02, 0.2]}>
            {/* Upper Arm */}
            <mesh position={[0.1, -0.02, 0.02]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.035, 0.04, 0.25, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Elbow */}
            <mesh position={[0.2, -0.06, 0.02]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Forearm */}
            <mesh position={[0.32, -0.04, 0]} rotation={[0, 0, 0.5]}>
              <cylinderGeometry args={[0.03, 0.035, 0.22, 12]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Hand */}
            <mesh position={[0.42, -0.02, 0]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
