'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Human Model for Pilates Exercises
 *
 * SCALABLE ARCHITECTURE:
 * - Supports multiple exercise animations
 * - Uses inverse kinematics for realistic joint movement
 * - Feet stay fixed during bridging (IK calculated)
 * - Arms animate for arm circles with integrated straps
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
  showStraps?: boolean;  // Show straps for arm circles
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Shared constants (must match ReformerModel)
const CARRIAGE_TOP = 0.37;
const FOOTBAR_X = 0.55;
const FOOTBAR_Y = 0.52;

// Strap system constants
const LENGTH = 1.4;  // Reformer length
const FRAME_HEIGHT = 0.28;
const PULLEY_X = -LENGTH / 2 + 0.06;
const PULLEY_Y = FRAME_HEIGHT + 0.27;  // Top of pulley posts
const PULLEY_Z_LEFT = -0.14;
const PULLEY_Z_RIGHT = 0.14;
const ROPE_COLOR = '#666666';
const ROPE_RADIUS = 0.006;
const HANDLE_COLOR = '#2a2a2a';
const STRAP_COLOR = '#333333';

// Body segment lengths
const UPPER_TORSO_LEN = 0.18;
const LOWER_TORSO_LEN = 0.16;
const UPPER_ARM_LEN = 0.18;
const FOREARM_LEN = 0.16;
const THIGH_LEN = 0.26;
const SHIN_LEN = 0.24;

const CYCLE = 5.0;

// Inverse kinematics for 2-segment limb
function solveIK(
  originX: number, originY: number,
  targetX: number, targetY: number,
  len1: number, len2: number
): { angle1: number; angle2: number } {
  const dx = targetX - originX;
  const dy = targetY - originY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Clamp distance to valid range
  const maxDist = len1 + len2 - 0.01;
  const minDist = Math.abs(len1 - len2) + 0.01;
  const clampedDist = Math.max(minDist, Math.min(maxDist, dist));

  // Law of cosines for knee angle
  const cosKnee = (len1 * len1 + len2 * len2 - clampedDist * clampedDist) / (2 * len1 * len2);
  const kneeAngle = Math.acos(Math.max(-1, Math.min(1, cosKnee)));

  // Angle from origin to target
  const angleToTarget = Math.atan2(dy, dx);

  // Offset angle for first segment
  const cosOffset = (len1 * len1 + clampedDist * clampedDist - len2 * len2) / (2 * len1 * clampedDist);
  const offsetAngle = Math.acos(Math.max(-1, Math.min(1, cosOffset)));

  // Hip angle (thigh)
  const angle1 = angleToTarget + offsetAngle;

  // Knee bend (relative to thigh) - bend inward
  const angle2 = -(Math.PI - kneeAngle);

  return { angle1, angle2 };
}

export function HumanModel({ animation, onCarriageMove, showStraps = true }: HumanModelProps) {
  const timeRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);  // Root group for position updates

  // Refs for animated parts
  const chestRef = useRef<THREE.Mesh>(null);  // For breathing animation
  const lowerTorsoRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Hand refs for strap attachment
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);

  // Strap refs (ropes and handles)
  const leftRopeRef = useRef<THREE.Mesh>(null);
  const rightRopeRef = useRef<THREE.Mesh>(null);
  const leftHandleRef = useRef<THREE.Group>(null);
  const rightHandleRef = useRef<THREE.Group>(null);

  // Body positioning
  const SHOULDER_X = -0.22;
  const SHOULDER_Y = CARRIAGE_TOP + 0.04;
  const HIP_WIDTH = 0.08;

  // Fixed foot target (on footbar) - NEVER changes
  const FOOT_TARGET_X = FOOTBAR_X - 0.02;
  const FOOT_TARGET_Y = FOOTBAR_Y + 0.02;

  // Calculate hip position when pelvis is at rest
  const restHipX = SHOULDER_X + 0.04 + UPPER_TORSO_LEN + LOWER_TORSO_LEN + 0.04;
  const restHipY = SHOULDER_Y;

  // Initial IK solution for rest position
  const restIK = useMemo(() => {
    return solveIK(restHipX, restHipY, FOOT_TARGET_X, FOOT_TARGET_Y, THIGH_LEN, SHIN_LEN);
  }, [restHipX, restHipY]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation progress (0 to 1 and back)
    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 3) p = 1;
    else if (t < 4.5) p = 1 - ease((t - 3) / 1.5);

    // Animation dispatch based on exercise type
    let carriagePos = 0;

    if (animation === 'bridging') {
      animateBridging(p);
      carriagePos = 0;  // Carriage stationary for bridging
    } else if (animation === 'arm-circles') {
      animateArmCircles(t);
      carriagePos = 0;  // Carriage stationary for arm circles
    } else if (animation === 'footwork' || animation === 'leg-press') {
      carriagePos = animateFootwork(p);  // Carriage moves with leg push
    } else {
      // Default: stationary with arms by sides
      setArmsResting();
    }

    // Subtle breathing animation (always active)
    animateBreathing(timeRef.current);

    // Update straps for arm circles (use actual hand world positions)
    if (animation === 'arm-circles' && showStraps) {
      updateStraps();
    }

    // Update group position for footwork (body moves with carriage)
    if (groupRef.current) {
      if (animation === 'footwork' || animation === 'leg-press') {
        // Body slides away from footbar with carriage
        groupRef.current.position.x = SHOULDER_X + carriagePos;
      } else {
        // Other exercises: body stays in place
        groupRef.current.position.x = SHOULDER_X;
      }
    }

    if (onCarriageMove) onCarriageMove(carriagePos);
  });

  function ease(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function animateBreathing(time: number) {
    // Subtle chest expansion for breathing (3-second cycle)
    const breathCycle = 3.0;
    const breathPhase = (time % breathCycle) / breathCycle;
    // Smooth sine wave for natural breathing
    const breathAmount = Math.sin(breathPhase * Math.PI * 2) * 0.02 + 1;

    if (chestRef.current) {
      // Subtle scale change on Y (vertical expansion)
      chestRef.current.scale.y = breathAmount;
      chestRef.current.scale.z = 1 + (breathAmount - 1) * 0.5; // Slight width change
    }
  }

  function animateBridging(p: number) {
    const maxLift = 0.45;
    const liftRotation = p * maxLift;

    // Lower torso lifts (creates the bridge)
    if (lowerTorsoRef.current) {
      lowerTorsoRef.current.rotation.z = liftRotation;
    }

    // Calculate current hip position based on torso rotation
    // Hip moves in an arc as lower torso rotates
    const pelvisOffset = LOWER_TORSO_LEN;
    const currentHipX = restHipX + pelvisOffset * (Math.cos(liftRotation) - 1);
    const currentHipY = restHipY + pelvisOffset * Math.sin(liftRotation);

    // Solve IK for legs to keep feet on footbar
    const ik = solveIK(currentHipX, currentHipY, FOOT_TARGET_X, FOOT_TARGET_Y, THIGH_LEN, SHIN_LEN);

    // The thigh rotation needs to account for the pelvis rotation
    const thighWorldAngle = ik.angle1;
    const thighLocalAngle = thighWorldAngle - liftRotation;

    if (leftThighRef.current) {
      leftThighRef.current.rotation.z = thighLocalAngle;
    }
    if (rightThighRef.current) {
      rightThighRef.current.rotation.z = thighLocalAngle;
    }

    if (leftShinRef.current) {
      leftShinRef.current.rotation.z = ik.angle2;
    }
    if (rightShinRef.current) {
      rightShinRef.current.rotation.z = ik.angle2;
    }

    // Arms by sides for bridging (resting on carriage)
    // Rotation z = 0 means arms point along body toward feet
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.z = 0.05;  // Slight angle, resting
      leftUpperArmRef.current.rotation.x = 0;     // No spread
      leftUpperArmRef.current.rotation.y = 0;
    }
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.z = 0.05;
      rightUpperArmRef.current.rotation.x = 0;
      rightUpperArmRef.current.rotation.y = 0;
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.z = 0;
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.z = 0;
    }
  }

  function animateArmCircles(t: number) {
    // ARM CIRCLES ON THE SIDES
    // Each arm makes a circle in a plane on its own side of the body
    // Like drawing circles in the air with arms extended to the sides
    const angle = (t / CYCLE) * Math.PI * 2;

    // Arms spread outward to sides (constant)
    const SPREAD = 0.5;

    // Circle motion: arms trace circles on their respective sides
    // rotation.z swings forward/back, rotation.y creates the circular path
    const circleSize = 0.4;
    const circleZ = Math.sin(angle) * circleSize;
    const circleY = Math.cos(angle) * circleSize;

    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.z = Math.PI / 2 + circleZ;  // Base up + circle
      leftUpperArmRef.current.rotation.x = SPREAD;  // Spread outward left
      leftUpperArmRef.current.rotation.y = circleY;  // Circle motion
    }
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.z = Math.PI / 2 + circleZ;
      rightUpperArmRef.current.rotation.x = -SPREAD;  // Spread outward right
      rightUpperArmRef.current.rotation.y = -circleY;  // Opposite circle
    }

    // Slight forearm bend
    const forearmBend = 0.15;
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.z = forearmBend;
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.z = forearmBend;
    }

    // Legs bent with feet flat on carriage (hook-lying position)
    // Thighs nearly vertical, shins pointing down to place feet on carriage
    // This creates the classic "tabletop" position for arm exercises
    const thighAngle = 1.35;  // Thighs nearly vertical (~77 degrees)
    const shinAngle = -2.7;   // Shins pointing down and slightly back

    if (leftThighRef.current) leftThighRef.current.rotation.z = thighAngle;
    if (rightThighRef.current) rightThighRef.current.rotation.z = thighAngle;
    if (leftShinRef.current) leftShinRef.current.rotation.z = shinAngle;
    if (rightShinRef.current) rightShinRef.current.rotation.z = shinAngle;
  }

  function animateFootwork(p: number): number {
    // Footwork: legs push carriage out, then return
    // p = 0: legs bent, carriage in
    // p = 1: legs extended, carriage out

    // Carriage position (0 to 0.4 range for visible movement)
    const carriagePos = p * 0.35;

    // IMPORTANT: For footwork, feet stay FIXED on the footbar
    // The carriage (and body) move away from the footbar
    // This causes legs to straighten as distance increases

    // Foot target stays at footbar (doesn't move)
    const footTargetX = FOOT_TARGET_X;
    const footTargetY = FOOT_TARGET_Y;

    // Hip position moves with the carriage (body slides away from footbar)
    // As carriage moves out, hip X increases (moves away from footbar)
    const currentHipX = restHipX + carriagePos;
    const currentHipY = restHipY;

    // IK calculates leg angles to reach from moving hip to fixed foot
    const ik = solveIK(currentHipX, currentHipY, footTargetX, footTargetY, THIGH_LEN, SHIN_LEN);

    if (leftThighRef.current) leftThighRef.current.rotation.z = ik.angle1;
    if (rightThighRef.current) rightThighRef.current.rotation.z = ik.angle1;
    if (leftShinRef.current) leftShinRef.current.rotation.z = ik.angle2;
    if (rightShinRef.current) rightShinRef.current.rotation.z = ik.angle2;

    // Arms by sides for footwork
    setArmsResting();

    return carriagePos;
  }

  function setArmsResting() {
    // Arms resting by sides (default pose)
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.z = 0.05;
      leftUpperArmRef.current.rotation.x = 0;
      leftUpperArmRef.current.rotation.y = 0;
    }
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.z = 0.05;
      rightUpperArmRef.current.rotation.x = 0;
      rightUpperArmRef.current.rotation.y = 0;
    }
    if (leftForearmRef.current) leftForearmRef.current.rotation.z = 0;
    if (rightForearmRef.current) rightForearmRef.current.rotation.z = 0;
  }

  function updateStraps() {
    // Get actual hand world positions from the mesh refs
    const leftHandWorld = new THREE.Vector3();
    const rightHandWorld = new THREE.Vector3();

    if (leftHandRef.current) {
      leftHandRef.current.getWorldPosition(leftHandWorld);
    }
    if (rightHandRef.current) {
      rightHandRef.current.getWorldPosition(rightHandWorld);
    }

    // Left strap - pulley to left hand
    const leftPulley = new THREE.Vector3(PULLEY_X, PULLEY_Y, PULLEY_Z_LEFT);
    updateRope(leftRopeRef.current, leftPulley, leftHandWorld);

    // Position left handle at the hand
    if (leftHandleRef.current) {
      leftHandleRef.current.position.copy(leftHandWorld);
      leftHandleRef.current.rotation.z = Math.PI / 2;
    }

    // Right strap - pulley to right hand
    const rightPulley = new THREE.Vector3(PULLEY_X, PULLEY_Y, PULLEY_Z_RIGHT);
    updateRope(rightRopeRef.current, rightPulley, rightHandWorld);

    // Position right handle at the hand
    if (rightHandleRef.current) {
      rightHandleRef.current.position.copy(rightHandWorld);
      rightHandleRef.current.rotation.z = Math.PI / 2;
      rightHandleRef.current.rotation.y = Math.PI;  // Mirror for right side
    }
  }

  function updateRope(
    mesh: THREE.Mesh | null,
    start: THREE.Vector3,
    end: THREE.Vector3
  ) {
    if (!mesh) return;

    // Calculate midpoint
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    // Calculate length
    const length = start.distanceTo(end);

    // Position at midpoint
    mesh.position.copy(mid);

    // Scale to length
    mesh.scale.y = length;

    // Rotate to point from start to end
    mesh.lookAt(end);
    mesh.rotateX(Math.PI / 2);
  }

  // Initial angles for static pose
  const initialThighAngle = restIK.angle1;
  const initialKneeAngle = restIK.angle2;

  return (
    <group ref={groupRef} position={[SHOULDER_X, SHOULDER_Y, 0]}>
      {/* === HEAD === */}
      <mesh position={[-0.14, 0.02, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[-0.07, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.05, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS === */}
      <mesh>
        <boxGeometry args={[0.08, 0.05, 0.24]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* === LEFT ARM === */}
      <group position={[0.02, 0, -0.10]}>
        <group ref={leftUpperArmRef} rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[UPPER_ARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.020, UPPER_ARM_LEN - 0.02, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          {/* Elbow */}
          <group position={[UPPER_ARM_LEN, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            {/* Forearm */}
            <group ref={leftForearmRef} rotation={[0, 0, 0]}>
              <mesh position={[FOREARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.016, FOREARM_LEN - 0.02, 4, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Hand - with ref for strap attachment */}
              <mesh ref={leftHandRef} position={[FOREARM_LEN, 0, 0]}>
                <sphereGeometry args={[0.022, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* === RIGHT ARM === */}
      <group position={[0.02, 0, 0.10]}>
        <group ref={rightUpperArmRef} rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[UPPER_ARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.020, UPPER_ARM_LEN - 0.02, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          {/* Elbow */}
          <group position={[UPPER_ARM_LEN, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            {/* Forearm */}
            <group ref={rightForearmRef} rotation={[0, 0, 0]}>
              <mesh position={[FOREARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.016, FOREARM_LEN - 0.02, 4, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Hand - with ref for strap attachment */}
              <mesh ref={rightHandRef} position={[FOREARM_LEN, 0, 0]}>
                <sphereGeometry args={[0.022, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* === UPPER TORSO (with breathing animation) === */}
      <group position={[0.04, 0, 0]}>
        <mesh ref={chestRef} position={[UPPER_TORSO_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.045, UPPER_TORSO_LEN - 0.02, 4, 8]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* === LOWER TORSO (animates for bridging) === */}
        <group ref={lowerTorsoRef} position={[UPPER_TORSO_LEN, 0, 0]}>
          <mesh position={[LOWER_TORSO_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.048, LOWER_TORSO_LEN - 0.02, 4, 8]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* === PELVIS === */}
          <group position={[LOWER_TORSO_LEN, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.08, 0.05, 0.18]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* === LEFT LEG === */}
            <group position={[0.04, 0, -HIP_WIDTH]}>
              <mesh>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={leftThighRef} rotation={[0, 0, initialThighAngle]}>
                <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH_LEN, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.028, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={leftShinRef} rotation={[0, 0, initialKneeAngle]}>
                    <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Foot - more anatomical shape */}
                    <group position={[SHIN_LEN, 0, 0]}>
                      {/* Heel */}
                      <mesh position={[-0.01, -0.005, 0]}>
                        <sphereGeometry args={[0.022, 8, 8]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>
                      {/* Main foot */}
                      <mesh position={[0.03, -0.005, 0]} rotation={[0, 0, 0.1]}>
                        <capsuleGeometry args={[0.018, 0.04, 4, 8]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>
                    </group>
                  </group>
                </group>
              </group>
            </group>

            {/* === RIGHT LEG === */}
            <group position={[0.04, 0, HIP_WIDTH]}>
              <mesh>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={rightThighRef} rotation={[0, 0, initialThighAngle]}>
                <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH_LEN, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.028, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={rightShinRef} rotation={[0, 0, initialKneeAngle]}>
                    <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Foot - more anatomical shape */}
                    <group position={[SHIN_LEN, 0, 0]}>
                      {/* Heel */}
                      <mesh position={[-0.01, -0.005, 0]}>
                        <sphereGeometry args={[0.022, 8, 8]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>
                      {/* Main foot */}
                      <mesh position={[0.03, -0.005, 0]} rotation={[0, 0, 0.1]}>
                        <capsuleGeometry args={[0.018, 0.04, 4, 8]} />
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

      {/* === STRAPS (for arm circles) === */}
      {animation === 'arm-circles' && showStraps && (
        <>
          {/* Left strap rope - connects pulley to hand */}
          <mesh ref={leftRopeRef}>
            <cylinderGeometry args={[ROPE_RADIUS, ROPE_RADIUS, 1, 8]} />
            <meshStandardMaterial color={ROPE_COLOR} roughness={0.8} />
          </mesh>

          {/* Right strap rope */}
          <mesh ref={rightRopeRef}>
            <cylinderGeometry args={[ROPE_RADIUS, ROPE_RADIUS, 1, 8]} />
            <meshStandardMaterial color={ROPE_COLOR} roughness={0.8} />
          </mesh>

          {/* Left handle - fabric loop that hand holds */}
          <group ref={leftHandleRef}>
            {/* Loop part */}
            <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]}>
              <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
              <meshStandardMaterial color={HANDLE_COLOR} />
            </mesh>
            {/* Fabric straps */}
            <mesh position={[0, 0.03, 0.025]}>
              <boxGeometry args={[0.004, 0.05, 0.02]} />
              <meshStandardMaterial color={STRAP_COLOR} />
            </mesh>
            <mesh position={[0, 0.03, -0.025]}>
              <boxGeometry args={[0.004, 0.05, 0.02]} />
              <meshStandardMaterial color={STRAP_COLOR} />
            </mesh>
          </group>

          {/* Right handle - fabric loop */}
          <group ref={rightHandleRef}>
            {/* Loop part */}
            <mesh rotation={[Math.PI / 2, -Math.PI / 2, 0]}>
              <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
              <meshStandardMaterial color={HANDLE_COLOR} />
            </mesh>
            {/* Fabric straps */}
            <mesh position={[0, 0.03, 0.025]}>
              <boxGeometry args={[0.004, 0.05, 0.02]} />
              <meshStandardMaterial color={STRAP_COLOR} />
            </mesh>
            <mesh position={[0, 0.03, -0.025]}>
              <boxGeometry args={[0.004, 0.05, 0.02]} />
              <meshStandardMaterial color={STRAP_COLOR} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}
