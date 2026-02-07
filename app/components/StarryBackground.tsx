"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function RotatingStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function StarryBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none bg-black">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <RotatingStars />
      </Canvas>
      {/* Overlay to ensure text legibility if needed, or just for mood */}
      <div className="absolute inset-0 bg-transparent pointer-events-none" />
    </div>
  );
}
