'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RunnerEngine } from '@/lib/engine';
import type { CatProfile } from '@/lib/cat-profiles';

type PartProps = {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  shape?: 'box' | 'sphere' | 'cone' | 'cylinder';
  args?: [number, number, number];
};
export function Part({ position, scale, rotation, color, shape = 'sphere', args }: PartProps) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      {shape === 'sphere' && <sphereGeometry args={[1, 12, 10]} />}
      {shape === 'box' && <boxGeometry args={args ?? [1, 1, 1]} />}
      {shape === 'cone' && <coneGeometry args={args ?? [0.3, 0.6, 4]} />}
      {shape === 'cylinder' && <cylinderGeometry args={args ? [...args, 12] : [0.2, 0.2, 1, 12]} />}
      <meshToonMaterial color={color} />
    </mesh>
  );
}
export function Cat({ engine, profile }: { engine: RunnerEngine; profile: CatProfile }) {
  const coat = profile.colors;
  const cat = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!cat.current || !body.current || !tail.current || !legs.current) return;
    const active = engine.status === 'running';
    const phase =
      engine.status === 'ready'
        ? clock.elapsedTime * 2
        : engine.time * (engine.energy < 20 ? 9 : 17);
    cat.current.position.set(
      engine.x,
      engine.status === 'over'
        ? THREE.MathUtils.damp(cat.current.position.y, 0.15, 6, delta)
        : engine.y,
      0,
    );
    cat.current.visible =
      engine.status !== 'running' ||
      engine.invulnerable <= 0 ||
      Math.floor(engine.time * 12) % 2 === 0;
    cat.current.rotation.z = THREE.MathUtils.damp(
      cat.current.rotation.z,
      engine.status === 'over' ? -1.3 : 0,
      8,
      delta,
    );
    body.current.scale.y = engine.slide > 0 ? 0.4 : 1;
    body.current.position.y = active && engine.y === 0 ? Math.sin(phase * 2) * 0.045 : 0;
    body.current.rotation.x = engine.y > 0 ? -0.13 : engine.energy < 20 ? 0.1 : 0;
    tail.current.rotation.x = -0.3 + Math.sin(phase * 0.55) * 0.18;
    tail.current.rotation.z = Math.sin(phase * 0.4) * 0.2;
    legs.current.children.forEach((leg, i) => {
      leg.rotation.x =
        active && engine.y === 0 && engine.slide === 0
          ? Math.sin(phase + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.65
          : engine.y > 0
            ? -0.5
            : 0;
    });
  });
  return (
    <group ref={cat}>
      <group ref={body}>
        <Part position={[0, 0.78, 0.08]} scale={[0.43, 0.43, 0.68]} color={coat.fur} />
        <Part position={[0, 0.82, -0.36]} scale={[0.37, 0.35, 0.35]} color={coat.chest} />
        <Part position={[0, 1.18, -0.43]} scale={[0.48, 0.4, 0.39]} color={coat.head} />
        <Part position={[0, 1.03, -0.72]} scale={[0.28, 0.18, 0.14]} color={coat.muzzle} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Part
              position={[side * 0.31, 1.55, -0.4]}
              rotation={[0, 0, side * -0.18]}
              color={coat.ear}
              shape="cone"
              args={[0.25, 0.43, 4]}
            />
            <Part
              position={[side * 0.31, 1.56, -0.52]}
              scale={[0.55, 0.65, 0.2]}
              color="#f4b5a2"
              shape="cone"
              args={[0.25, 0.43, 4]}
            />
            <Part
              position={[side * 0.19, 1.24, -0.775]}
              scale={[0.08, 0.105, 0.045]}
              color={coat.eyes}
            />
            <Part
              position={[side * 0.21, 1.28, -0.812]}
              scale={[0.022, 0.026, 0.014]}
              color="#ffffff"
            />
            {[0, 1, 2].map((i) => (
              <Part
                key={i}
                shape="box"
                args={[0.32, 0.018, 0.018]}
                position={[side * 0.4, 1.06 + i * 0.065, -0.76]}
                rotation={[0, 0, side * (i - 1) * 0.2]}
                color="#72574b"
              />
            ))}
          </group>
        ))}
        <Part position={[0, 1.1, -0.864]} scale={[0.065, 0.047, 0.04]} color="#bd746e" />
        {profile.pattern === 'tabby' &&
          [0, 1, 2].map((i) => (
            <Part
              key={i}
              shape="box"
              args={[0.12, 0.025, 0.45]}
              position={[-0.17 + i * 0.17, 1.53, -0.39]}
              color={coat.markings}
            />
          ))}
        {profile.pattern === 'tuxedo' && (
          <Part position={[0, 1.35, -0.78]} scale={[0.1, 0.18, 0.045]} color={coat.muzzle} />
        )}
        {profile.pattern === 'calico' && (
          <group>
            <Part position={[0.3, 0.87, 0.24]} scale={[0.2, 0.27, 0.37]} color={coat.markings} />
            <Part position={[-0.3, 0.9, -0.12]} scale={[0.2, 0.25, 0.3]} color="#424b50" />
            <Part position={[0.3, 1.29, -0.4]} scale={[0.2, 0.23, 0.31]} color={coat.markings} />
            <Part position={[-0.3, 1.29, -0.4]} scale={[0.2, 0.23, 0.31]} color="#424b50" />
          </group>
        )}
        <mesh position={[0, 0.98, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.047, 6, 20]} />
          <meshToonMaterial color={coat.collar} />
        </mesh>
        <Part position={[0, 0.89, -0.7]} scale={[0.058, 0.07, 0.035]} color="#f7d372" />
        <group ref={tail} position={[0, 0.85, 0.57]} rotation={[-0.3, 0, 0]}>
          <Part
            position={[0, 0.35, 0.12]}
            rotation={[0.3, 0, 0]}
            scale={[0.115, 0.48, 0.115]}
            color={coat.fur}
          />
          <Part
            position={[0, 0.75, 0.27]}
            rotation={[0.6, 0, 0]}
            scale={[0.12, 0.24, 0.12]}
            color={coat.tailTip}
          />
        </group>
        <group ref={legs}>
          {[-1, 1].flatMap((side) =>
            [-1, 1].map((front) => (
              <group key={`${side}-${front}`} position={[side * 0.27, 0.55, front * 0.37]}>
                <Part position={[0, -0.2, 0]} scale={[0.115, 0.28, 0.115]} color={coat.fur} />
                <Part position={[0, -0.43, -0.04]} scale={[0.16, 0.1, 0.2]} color={coat.paws} />
              </group>
            )),
          )}
        </group>
      </group>
    </group>
  );
}

export function PawModel({ color = '#f6c768' }: { color?: string }) {
  return (
    <group rotation={[0.1, 0, 0]}>
      <Part scale={[0.25, 0.23, 0.12]} color={color} />
      {[-0.27, -0.1, 0.1, 0.27].map((x, i) => (
        <Part
          key={i}
          position={[x, 0.27 + (i === 1 || i === 2 ? 0.1 : 0), 0]}
          scale={[0.1, 0.12, 0.09]}
          color={color}
        />
      ))}
    </group>
  );
}
export function MilkModel() {
  return (
    <group>
      <Part shape="cylinder" args={[0.25, 0.29, 0.58]} color="#fffaf0" />
      <Part shape="cylinder" args={[0.14, 0.21, 0.18]} position={[0, 0.38, 0]} color="#fffaf0" />
      <Part shape="cylinder" args={[0.15, 0.15, 0.11]} position={[0, 0.51, 0]} color="#75b9a8" />
      <Part shape="cylinder" args={[0.255, 0.27, 0.23]} position={[0, -0.02, 0]} color="#89c7bb" />
      <Part shape="box" args={[0.15, 0.13, 0.015]} position={[0, -0.01, 0.275]} color="#fffaf0" />
    </group>
  );
}
