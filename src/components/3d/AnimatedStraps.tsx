'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Animated Straps for Pilates Reformer
 *
 * Renders straps that connect from the reformer pulleys to the person's hands.
 * Animates with arm circles exercise.
 */

interface AnimatedStrapsProps {
  animation: string;
  visible?: boolean;
}

// Constants matching ReformerModel and HumanModel
const FRAME_HEIGHT = 0.28;
const CARRIAGE_TOP = 0.37;
const LENGTH = 1.4;

// Pulley positions (at head end of reformer)
const PULLEY_X = -LENGTH / 2 + 0.08;
const PULLEY_Y = FRAME_HEIGHT + 0.06;
const PULLEY_Z_LEFT = -0.12;
const PULLEY_Z_RIGHT = 0.12;

// Shoulder position (where arms attach)
const SHOULDER_X = -0.22;
const SHOULDER_Y = CARRIAGE_TOP + 0.04;

// Arm segment lengths
const UPPER_ARM_LEN = 0.18;
const FOREARM_LEN = 0.16;

const CYCLE = 5.0;
const ROPE_COLOR = '#3a3a3a';

export function AnimatedStraps({ animation, visible = true }: AnimatedStrapsProps) {
  const timeRef = useRef(0);
  const leftRopeRef = useRef<THREE.Mesh>(null);
  const rightRopeRef = useRef<THREE.Mesh>(null);
  const leftHandleRef = useRef<THREE.Group>(null);
  const rightHandleRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animation !== 'arm-circles' || !visible) return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;
    const angle = (t / CYCLE) * Math.PI * 2;

    // Calculate hand positions matching HumanModel arm circles animation
    const armSwingZ = -0.3 + Math.sin(angle) * 0.5;
    const armSpreadX = Math.abs(Math.sin(angle)) * 0.8;

    // Calculate hand world position for left arm
    // Shoulder at (SHOULDER_X, SHOULDER_Y, -0.10)
    // Arm rotates, hand ends up at certain position
    const armLength = UPPER_ARM_LEN + FOREARM_LEN;

    // Simplified hand position calculation
    // When armSwingZ is negative, hand is toward head (negative X)
    // When armSpreadX is positive, hand is outward (more negative Z for left)
    const leftHandX = SHOULDER_X + 0.02 + Math.cos(armSwingZ + Math.PI / 2) * armLength * 0.7;
    const leftHandY = SHOULDER_Y + Math.sin(armSwingZ + Math.PI / 2) * armLength * 0.7;
    const leftHandZ = -0.10 - armSpreadX * 0.15;

    const rightHandX = leftHandX;
    const rightHandY = leftHandY;
    const rightHandZ = 0.10 + armSpreadX * 0.15;

    // Update handle positions
    if (leftHandleRef.current) {
      leftHandleRef.current.position.set(leftHandX, leftHandY, leftHandZ);
    }
    if (rightHandleRef.current) {
      rightHandleRef.current.position.set(rightHandX, rightHandY, rightHandZ);
    }

    // Update rope geometry to connect pulley to hand
    updateRope(leftRopeRef.current, PULLEY_X, PULLEY_Y, PULLEY_Z_LEFT, leftHandX, leftHandY, leftHandZ);
    updateRope(rightRopeRef.current, PULLEY_X, PULLEY_Y, PULLEY_Z_RIGHT, rightHandX, rightHandY, rightHandZ);
  });

  function updateRope(
    mesh: THREE.Mesh | null,
    startX: number, startY: number, startZ: number,
    endX: number, endY: number, endZ: number
  ) {
    if (!mesh) return;

    // Calculate rope midpoint and length
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const midZ = (startZ + endZ) / 2;

    const dx = endX - startX;
    const dy = endY - startY;
    const dz = endZ - startZ;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Position at midpoint
    mesh.position.set(midX, midY, midZ);

    // Scale to length
    mesh.scale.y = length;

    // Rotate to point from start to end
    mesh.lookAt(endX, endY, endZ);
    mesh.rotateX(Math.PI / 2);
  }

  if (!visible) return null;

  // Initial hand positions (arms up)
  const initialHandX = SHOULDER_X + 0.02;
  const initialHandY = SHOULDER_Y + UPPER_ARM_LEN + FOREARM_LEN * 0.7;

  return (
    <group>
      {/* Left strap rope */}
      <mesh ref={leftRopeRef} position={[(PULLEY_X + initialHandX) / 2, (PULLEY_Y + initialHandY) / 2, PULLEY_Z_LEFT]}>
        <cylinderGeometry args={[0.004, 0.004, 1, 6]} />
        <meshStandardMaterial color={ROPE_COLOR} />
      </mesh>

      {/* Right strap rope */}
      <mesh ref={rightRopeRef} position={[(PULLEY_X + initialHandX) / 2, (PULLEY_Y + initialHandY) / 2, PULLEY_Z_RIGHT]}>
        <cylinderGeometry args={[0.004, 0.004, 1, 6]} />
        <meshStandardMaterial color={ROPE_COLOR} />
      </mesh>

      {/* Left handle */}
      <group ref={leftHandleRef} position={[initialHandX, initialHandY, -0.10]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Right handle */}
      <group ref={rightHandleRef} position={[initialHandX, initialHandY, 0.10]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  );
}
