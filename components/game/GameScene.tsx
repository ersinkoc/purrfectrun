'use client';
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Cat, MilkModel, Part, PawModel } from './Models';
import { LANES, THEMES, isPickup, type Entity, type RunnerEngine } from '@/lib/engine';

function Obstacle({ kind }: { kind: string }) {
  if (kind === 'box')
    return (
      <group>
        <Part shape="box" args={[1.3, 0.85, 1]} position={[0, 0.425, 0]} color="#c79669" />
        <Part shape="box" args={[0.12, 0.86, 1.02]} position={[0, 0.43, 0]} color="#e8c9a2" />
        <Part shape="box" args={[1.32, 0.12, 1.02]} position={[0, 0.6, 0]} color="#e8c9a2" />
      </group>
    );
  if (kind === 'fence')
    return (
      <group>
        {[-0.62, -0.31, 0, 0.31, 0.62].map((x) => (
          <Part
            key={x}
            shape="box"
            args={[0.17, 0.8, 0.13]}
            position={[x, 0.4, 0]}
            color="#fff0d6"
          />
        ))}
        {[0.22, 0.61].map((y) => (
          <Part
            key={y}
            shape="box"
            args={[1.55, 0.1, 0.18]}
            position={[0, y, 0.06]}
            color="#e5caaa"
          />
        ))}
      </group>
    );
  if (kind === 'branch')
    return (
      <group>
        {[-0.88, 0.88].map((x) => (
          <Part
            key={x}
            shape="box"
            args={[0.12, 2.5, 0.12]}
            position={[x, 1.25, 0]}
            color="#846a51"
          />
        ))}
        <Part shape="box" args={[1.95, 0.1, 0.13]} position={[0, 2.4, 0]} color="#846a51" />
        {[-0.55, 0, 0.55].map((x, i) => (
          <Part
            key={x}
            shape="box"
            args={[0.45, 1.15, 0.08]}
            position={[x, 1.8, 0]}
            color={['#e7a999', '#99c6bc', '#f1d287'][i]}
          />
        ))}
      </group>
    );
  if (kind === 'bin')
    return (
      <group>
        <Part shape="cylinder" args={[0.62, 0.5, 2.35]} position={[0, 1.175, 0]} color="#7b9c97" />
        <Part shape="cylinder" args={[0.68, 0.68, 0.13]} position={[0, 2.42, 0]} color="#527b74" />
        <Part shape="box" args={[0.35, 0.12, 0.12]} position={[0, 2.55, 0]} color="#527b74" />
      </group>
    );
  return (
    <group>
      <Part shape="box" args={[1.5, 1.7, 1.1]} position={[0, 0.85, 0]} color="#d7a182" />
      <Part
        shape="cone"
        args={[1.2, 1, 4]}
        position={[0, 2.15, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[1, 1, 0.8]}
        color="#aa7866"
      />
      <Part shape="box" args={[0.65, 1.05, 0.02]} position={[0, 0.53, 0.56]} color="#685b53" />
      <Part position={[0, 1.28, 0.57]} scale={[0.16, 0.09, 0.02]} color="#fff0d6" />
    </group>
  );
}
const KINDS = ['box', 'fence', 'branch', 'bin', 'kennel', 'milk', 'paw', 'fish'];
function RoadEntity({ engine, id }: { engine: RunnerEngine; id: number }) {
  const root = useRef<THREE.Group>(null);
  const visuals = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const e: Entity = engine.entities[id];
    if (!root.current || !visuals.current) return;
    const phase = engine.status === 'ready' ? clock.elapsedTime : engine.time;
    root.current.visible = e.active && e.z > -100 && e.z < 9;
    root.current.position.set(LANES[e.lane], 0, e.z);
    visuals.current.children.forEach((child, i) => {
      child.visible = KINDS[i] === e.kind;
      if (i >= 5) {
        child.position.y = 0.8 + Math.sin(phase * 2 + id) * 0.1;
        child.rotation.y = phase * 1.4;
      }
    });
  });
  return (
    <group ref={root}>
      <group ref={visuals}>
        {KINDS.map((kind) => (
          <group key={kind}>
            {kind === 'milk' ? (
              <MilkModel />
            ) : kind === 'paw' ? (
              <PawModel />
            ) : kind === 'fish' ? (
              <group>
                <Part scale={[0.36, 0.17, 0.12]} color="#8ac5d5" />
                <Part
                  shape="cone"
                  position={[0.38, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  args={[0.2, 0.3, 3]}
                  color="#8ac5d5"
                />
                <Part position={[-0.2, 0.04, 0.11]} scale={[0.03, 0.03, 0.025]} color="#263e49" />
              </group>
            ) : (
              <Obstacle kind={kind} />
            )}
            {isPickup(kind as Entity['kind']) && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
                <ringGeometry args={[0.32, 0.44, 24]} />
                <meshBasicMaterial
                  color={kind === 'milk' ? '#d5fff5' : '#ffe3a0'}
                  transparent
                  opacity={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

function Tree({ position, variant = 0 }: { position: [number, number, number]; variant?: number }) {
  return (
    <group position={position}>
      <Part shape="cylinder" args={[0.16, 0.23, 2.2]} position={[0, 1.1, 0]} color="#b39174" />
      <Part
        position={[0, 2.6, 0]}
        scale={[1.25, 1.55, 1.2]}
        color={variant % 2 ? '#79a981' : '#a3c393'}
      />
      <Part
        position={[0.55, 2.2, 0.3]}
        scale={[0.9, 1, 0.9]}
        color={variant % 2 ? '#8dbb8e' : '#bad0a0'}
      />
    </group>
  );
}
function House({ side, index }: { side: number; index: number }) {
  const colors = ['#efbfab', '#a9c7c0', '#f0d49c', '#c5bad1'];
  const paint = colors[index % 4];
  return (
    <group position={[side * 9, 0, -2]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <Part shape="box" args={[4.5, 4.4, 4]} position={[0, 2.2, 0]} color={paint} />
      <Part
        shape="cone"
        args={[3.65, 2, 4]}
        rotation={[0, Math.PI / 4, 0]}
        position={[0, 5.3, 0]}
        scale={[1, 1, 0.9]}
        color="#a17765"
      />
      <Part shape="box" args={[0.8, 1.8, 0.1]} position={[0.95, 0.9, 2.05]} color="#688e83" />
      {[-1.1, 1.1].map((x) => (
        <group key={x}>
          <Part shape="box" args={[1.1, 1.15, 0.12]} position={[x, 3.05, 2.08]} color="#f9efda" />
          <Part shape="box" args={[0.85, 0.9, 0.13]} position={[x, 3.05, 2.15]} color="#698e8f" />
          <Part shape="box" args={[0.07, 0.94, 0.14]} position={[x, 3.05, 2.23]} color="#f9efda" />
        </group>
      ))}
      <Part shape="box" args={[1.65, 1.25, 0.1]} position={[-1, 1.2, 2.06]} color="#f9efda" />
      <Part shape="box" args={[1.4, 1, 0.12]} position={[-1, 1.2, 2.13]} color="#779e97" />
      <group position={[-1, 2.15, 2.4]} rotation={[0.22, 0, 0]}>
        {Array.from({ length: 6 }, (_, i) => (
          <Part
            key={i}
            shape="box"
            args={[0.35, 0.08, 1.1]}
            position={[-0.875 + i * 0.35, 0, 0]}
            color={i % 2 ? '#fff5e1' : paint}
          />
        ))}
      </group>
      <Part shape="box" args={[0.5, 1.2, 0.5]} position={[1, 5.4, 0]} color={paint} />
    </group>
  );
}
function Segment({ engine, index }: { engine: RunnerEngine; index: number }) {
  const root = useRef<THREE.Group>(null);
  const grass = useRef<THREE.Mesh>(null);
  const neon = useRef<THREE.Group>(null);
  useFrame(() => {
    if (root.current) root.current.position.z = 16 - index * 16 + (engine.distance % 160);
    if (root.current && root.current.position.z > 24) root.current.position.z -= 160;
    if (grass.current)
      (grass.current.material as THREE.MeshToonMaterial).color.set(
        THEMES[(engine.level - 1) % 3].grass,
      );
    if (neon.current) neon.current.visible = (engine.level - 1) % 3 === 2;
  });
  return (
    <group ref={root}>
      <mesh ref={grass} position={[0, -0.19, -8]} receiveShadow>
        <boxGeometry args={[70, 0.25, 16]} />
        <meshToonMaterial color="#8bbd89" />
      </mesh>
      <Part shape="box" args={[7.8, 0.12, 16]} position={[0, -0.06, -8]} color="#e9dbbf" />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Part
            shape="box"
            args={[0.32, 0.15, 16]}
            position={[side * 4, 0.01, -8]}
            color="#fff1d7"
          />
          <Part
            shape="box"
            args={[1.7, 0.07, 16]}
            position={[side * 5, -0.02, -8]}
            color="#c8c5ad"
          />
          <Tree position={[side * 5.7, 0, -9]} variant={index} />
          {index % 2 === 0 && <House side={side} index={index + (side === 1 ? 1 : 0)} />}
          <Part position={[side * 5.3, 0.25, -3]} scale={[0.65, 0.4, 0.55]} color="#aac59c" />
          <Part position={[side * 5.7, 0.32, -3.4]} scale={[0.65, 0.5, 0.5]} color="#79a782" />
          <Part
            shape="cylinder"
            args={[0.06, 0.08, 3.5]}
            position={[side * 4.7, 1.75, -1]}
            color="#72938c"
          />
          <Part
            shape="box"
            args={[0.36, 0.46, 0.36]}
            position={[side * 4.7, 3.55, -1]}
            color="#fff4cd"
          />
          {[-4, -6, -12].map((z, i) => (
            <group key={z} position={[side * (4.5 + i * 0.18), 0.12, z]}>
              <Part
                shape="cylinder"
                args={[0.025, 0.025, 0.3]}
                position={[0, 0.15, 0]}
                color="#618668"
              />
              <Part
                position={[0, 0.35, 0]}
                scale={[0.13, 0.09, 0.13]}
                color={i % 2 ? '#fff4cf' : '#e8a899'}
              />
            </group>
          ))}
        </group>
      ))}
      {[-1.08, 1.08].flatMap((x) =>
        [-2, -6, -10, -14].map((z) => (
          <Part
            key={`${x}-${z}`}
            shape="box"
            args={[0.045, 0.008, 1.2]}
            position={[x, 0.008, z]}
            color="#fbf2dd"
          />
        )),
      )}
      {[-4, -8, -12, -16].map((z) => (
        <Part
          key={z}
          shape="box"
          args={[7.6, 0.004, 0.025]}
          position={[0, 0.009, z]}
          color="#d9c9ac"
        />
      ))}
      <group ref={neon} visible={false}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 3.75, 0.02, -8]}>
            <boxGeometry args={[0.055, 0.02, 16]} />
            <meshBasicMaterial color={side === 1 ? '#e6a9ef' : '#98ead9'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
function Sparkles({ engine }: { engine: RunnerEngine }) {
  const particles = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    if (!particles.current) return;
    const enabled = engine.energy > 90 && engine.status === 'running';
    particles.current.visible = enabled;
    if (!enabled) return;
    for (let i = 0; i < 36; i++) {
      const phase = (engine.time * 0.8 + i / 36) % 1;
      dummy.position.set(
        engine.x + Math.sin(i * 13) * (0.35 + phase),
        0.2 + phase * 1.5,
        0.4 + phase * 3,
      );
      dummy.scale.setScalar((1 - phase) * 0.055);
      dummy.updateMatrix();
      particles.current.setMatrixAt(i, dummy.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={particles} args={[undefined, undefined, 36]} frustumCulled={false}>
      <octahedronGeometry />
      <meshBasicMaterial color="#ffe4a0" />
    </instancedMesh>
  );
}
function Simulation({ engine, onUpdate }: { engine: RunnerEngine; onUpdate: () => void }) {
  const update = useRef(0);
  const previousStatus = useRef(engine.status);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, scene, size }, delta) => {
    engine.tick(delta);
    update.current += delta;
    if (update.current > 0.08) {
      if (engine.status === 'running' || previousStatus.current !== engine.status) onUpdate();
      previousStatus.current = engine.status;
      update.current = 0;
    }
    const theme = THEMES[(engine.level - 1) % 3];
    (scene.background as THREE.Color).set(theme.sky);
    (scene.fog as THREE.Fog).color.set(theme.fog);
    const preview = engine.status === 'ready';
    const mobilePreview = preview && size.width < 600;
    cameraTarget.set(
      preview ? (mobilePreview ? -3.1 : 4.8) : engine.x * 0.25,
      preview ? 5.2 : 4.7 + engine.y * 0.12,
      preview ? 10 : 9.8,
    );
    camera.position.lerp(cameraTarget, 1 - Math.exp(-3 * delta));
    camera.lookAt(mobilePreview ? -1 : engine.x * 0.32, 0.9 + engine.y * 0.1, -9);
    const perspective = camera as THREE.PerspectiveCamera;
    const fov = 48 + (engine.energy > 90 && engine.status === 'running' ? 3 : 0);
    perspective.fov = THREE.MathUtils.damp(perspective.fov, fov, 3, delta);
    perspective.updateProjectionMatrix();
  }, -2);
  return null;
}
export default function GameScene({
  engine,
  onUpdate,
  onReady,
  fallbackText,
}: {
  engine: RunnerEngine;
  onUpdate: () => void;
  onReady: () => void;
  fallbackText: string;
}) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 1.5]}
      camera={{ position: [4.8, 5.2, 10], fov: 48, near: 0.1, far: 180 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#c4e7e5');
        onReady();
      }}
      fallback={<div className="scene-fallback">{fallbackText}</div>}
    >
      <color attach="background" args={['#c4e7e5']} />
      <fog attach="fog" args={['#c4e7e5', 32, 93]} />
      <ambientLight intensity={THEMES[(engine.level - 1) % 3].ambient} />
      <hemisphereLight args={['#eef9ed', '#819a76', 1.2]} />
      <directionalLight
        color={THEMES[(engine.level - 1) % 3].sun}
        position={[-14, 22, 9]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={24}
        shadow-camera-bottom={-20}
        shadow-camera-far={65}
        shadow-normalBias={0.05}
      />
      <Simulation engine={engine} onUpdate={onUpdate} />
      {Array.from({ length: 10 }, (_, index) => (
        <Segment key={index} engine={engine} index={index} />
      ))}
      {engine.entities.map((e) => (
        <RoadEntity key={e.id} engine={engine} id={e.id} />
      ))}
      <Cat engine={engine} />
      <ContactShadows
        position={[0, 0.015, 0]}
        opacity={0.24}
        scale={9}
        blur={2.5}
        far={3}
        resolution={128}
        frames={1}
      />
      <Sparkles engine={engine} />
      <mesh position={[-22, 14, -76]}>
        <sphereGeometry args={[(engine.level - 1) % 3 === 2 ? 2.2 : 4, 24, 16]} />
        <meshBasicMaterial color={THEMES[(engine.level - 1) % 3].sun} fog={false} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[(i - 3) * 13, 15 + (i % 3), -45 - (i % 3) * 10]}>
          <Part color="#edf3e5" scale={[3.8, 1.2, 1.7]} />
          <Part color="#edf3e5" position={[1.2, 0.65, 0]} scale={[2, 1.25, 1.5]} />
        </group>
      ))}
    </Canvas>
  );
}
