'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human Model for Pilates Bridging - HIERARCHICAL SKELETON
 *
 * The body is built as a SINGLE connected chain where each part
 * is a CHILD of the previous part. This guarantees connection.
 *
 * HIERARCHY:
 * Root (at shoulders - fixed on carriage)
 * └── Shoulders
 *     └── Upper Torso
 *         └── Lower Torso (animates rotation for bridge)
 *             └── Pelvis
 *                 ├── Left Hip → Thigh → Knee → Shin → Foot
 *                 └── Right Hip → Thigh → Knee → Shin → Foot
 *
 * ANIMATION: Lower torso rotates upward, lifting the pelvis while
 * shoulders stay fixed and feet stay on footbar.
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Shared constants (must match ReformerModel)
const CARRIAGE_TOP = 0.37;
const FOOTBAR_X = 0.55;
const FOOTBAR_Y = 0.52;

// Body segment lengths
const TORSO_LEN = 0.22;
const PELVIS_LEN = 0.08;
const THIGH_LEN = 0.26;
const SHIN_LEN = 0.24;

const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);
  const lowerTorsoRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);

  // Calculate base angles to position feet on footbar
  // Person lies with head toward left, feet at footbar on right
  const SHOULDER_X = -0.22;
  const SHOULDER_Y = CARRIAGE_TOP + 0.04;

  // Leg angles calculated to reach footbar at (0.55, 0.52)
  // Hip is at approximately X=0.30 after torso chain
  // Legs need sharper bend so feet REST ON the footbar, not past it
  const baseHipAngle = 0.75; // Thigh angles upward toward raised knee
  const baseShinAngle = -1.6; // Shin angles sharply down to footbar

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation progress (0 to 1 and back)
    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 3) p = 1;
    else if (t < 4.5) p = 1 - ease((t - 3) / 1.5);

    const maxLift = 0.5; // Maximum rotation in radians (more pronounced)

    // Animate lower torso rotation (creates the bridge lift)
    if (lowerTorsoRef.current) {
      lowerTorsoRef.current.rotation.z = p * maxLift;
    }

    // Counter-rotate thighs to keep feet on footbar as pelvis lifts
    const thighCompensation = -p * maxLift * 0.8;
    if (leftThighRef.current) {
      leftThighRef.current.rotation.z = baseHipAngle + thighCompensation;
    }
    if (rightThighRef.current) {
      rightThighRef.current.rotation.z = baseHipAngle + thighCompensation;
    }

    // Counter-rotate shins to maintain foot position on footbar
    const shinCompensation = p * maxLift * 0.6;
    if (leftShinRef.current) {
      leftShinRef.current.rotation.z = baseShinAngle + shinCompensation;
    }
    if (rightShinRef.current) {
      rightShinRef.current.rotation.z = baseShinAngle + shinCompensation;
    }

    if (onCarriageMove) onCarriageMove(0.02);
  });

  function ease(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  return (
    <group position={[SHOULDER_X, SHOULDER_Y, 0]}>
      {/* === HEAD (behind shoulders, resting on headrest) === */}
      <mesh position={[-0.14, 0.02, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[-0.07, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.05, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS (root anchor - fixed on carriage) === */}
      <mesh>
        <boxGeometry args={[0.08, 0.05, 0.24]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* Arms (fixed, resting on carriage) */}
      {[-0.10, 0.10].map((z, i) => (
        <group key={`arm-${i}`} position={[0.02, -0.01, z]}>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.018, 0.12, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.015, 0.10, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      ))}

      {/* === UPPER TORSO (connected to shoulders) === */}
      <group position={[0.04, 0, 0]}>
        <mesh position={[TORSO_LEN / 2 - 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.045, TORSO_LEN - 0.04, 4, 8]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* === LOWER TORSO (animates - creates bridge lift) === */}
        <group ref={lowerTorsoRef} position={[TORSO_LEN, 0, 0]}>
          <mesh position={[TORSO_LEN / 2 - 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.048, TORSO_LEN - 0.02, 4, 8]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* === PELVIS (at end of lower torso) === */}
          <group position={[TORSO_LEN, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.10, 0.06, 0.20]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* === LEFT LEG === */}
            <group position={[0.04, 0, -0.08]}>
              {/* Hip joint */}
              <mesh>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Thigh (rotates at hip) */}
              <group ref={leftThighRef} rotation={[0, 0, baseHipAngle]}>
                <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Knee joint */}
                <group position={[THIGH_LEN, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.030, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Shin (rotates at knee) */}
                  <group ref={leftShinRef} rotation={[0, 0, baseShinAngle]}>
                    <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Foot */}
                    <mesh position={[SHIN_LEN, 0, 0]}>
                      <boxGeometry args={[0.08, 0.025, 0.04]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* === RIGHT LEG (mirror) === */}
            <group position={[0.04, 0, 0.08]}>
              <mesh>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={rightThighRef} rotation={[0, 0, baseHipAngle]}>
                <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH_LEN, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.030, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={rightShinRef} rotation={[0, 0, baseShinAngle]}>
                    <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    <mesh position={[SHIN_LEN, 0, 0]}>
                      <boxGeometry args={[0.08, 0.025, 0.04]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
