import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AlgebraBalance3D({ leftWeight = 17, rightWeight = 17, isBalanced = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 320;
    const height = 240;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1426); // Deep Navy Base

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x62d9f5, 2, 10);
    pointLight.position.set(2, 4, 3);
    scene.add(pointLight);

    const violetLight = new THREE.PointLight(0x8875f8, 1.5, 10);
    violetLight.position.set(-2, 3, 2);
    scene.add(violetLight);

    // Balance Base Pillar (Static)
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x16243a, metalness: 0.6, roughness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.5;
    scene.add(baseMesh);

    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.4, 24);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xa8b6ca, metalness: 0.8, roughness: 0.2 });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.y = 0.2;
    scene.add(pillarMesh);

    const fulcrumGeo = new THREE.SphereGeometry(0.15, 24, 24);
    const fulcrumMat = new THREE.MeshStandardMaterial({ color: 0x62d9f5, roughness: 0.1 });
    const fulcrum = new THREE.Mesh(fulcrumGeo, fulcrumMat);
    fulcrum.position.y = 0.9;
    scene.add(fulcrum);

    // Balance Beam (Rotatable Group)
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 0.9, 0);
    scene.add(beamGroup);

    const beamGeo = new THREE.BoxGeometry(3.2, 0.08, 0.1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xf3f6fc, metalness: 0.5, roughness: 0.2 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beamGroup.add(beam);

    // Left Pan Assembly
    const panGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 32);
    const leftPanMat = new THREE.MeshStandardMaterial({ color: 0x8875f8, metalness: 0.4, roughness: 0.3 });
    const leftPan = new THREE.Mesh(panGeo, leftPanMat);
    leftPan.position.set(-1.4, -0.6, 0);
    beamGroup.add(leftPan);

    // String left
    const stringMat = new THREE.LineBasicMaterial({ color: 0x62d9f5, transparent: true, opacity: 0.6 });
    const leftStringPoints = [new THREE.Vector3(-1.4, 0, 0), new THREE.Vector3(-1.4, -0.6, 0)];
    const leftStringGeo = new THREE.BufferGeometry().setFromPoints(leftStringPoints);
    const leftString = new THREE.Line(leftStringGeo, stringMat);
    beamGroup.add(leftString);

    // Right Pan Assembly
    const rightPanMat = new THREE.MeshStandardMaterial({ color: 0x54c9a4, metalness: 0.4, roughness: 0.3 });
    const rightPan = new THREE.Mesh(panGeo, rightPanMat);
    rightPan.position.set(1.4, -0.6, 0);
    beamGroup.add(rightPan);

    const rightStringPoints = [new THREE.Vector3(1.4, 0, 0), new THREE.Vector3(1.4, -0.6, 0)];
    const rightStringGeo = new THREE.BufferGeometry().setFromPoints(rightStringPoints);
    const rightString = new THREE.Line(rightStringGeo, stringMat);
    beamGroup.add(rightString);

    // Left visual weight cubes
    const leftCubeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const leftCubeMat = new THREE.MeshStandardMaterial({ color: 0x8875f8, roughness: 0.2 });
    const leftCube = new THREE.Mesh(leftCubeGeo, leftCubeMat);
    leftCube.position.set(-1.4, -0.45, 0);
    beamGroup.add(leftCube);

    // Right visual weight cubes
    const rightCubeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const rightCubeMat = new THREE.MeshStandardMaterial({ color: 0x54c9a4, roughness: 0.2 });
    const rightCube = new THREE.Mesh(rightCubeGeo, rightCubeMat);
    rightCube.position.set(1.4, -0.45, 0);
    beamGroup.add(rightCube);

    let animationFrameId;
    let targetRotation = 0;

    // Calculate rotation angle based on weight difference
    const diff = leftWeight - rightWeight;
    if (diff === 0) {
      targetRotation = 0; // perfectly horizontal
    } else {
      // Clamped rotation (-0.25 to 0.25 radians)
      targetRotation = Math.max(-0.25, Math.min(0.25, -diff * 0.04));
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // Smooth interpolation to target tilt
      beamGroup.rotation.z += (targetRotation - beamGroup.rotation.z) * 0.08;
      // Gentle idle sway
      scene.rotation.y = Math.sin(Date.now() * 0.0008) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [leftWeight, rightWeight]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-numora-bg border border-white/10 flex flex-col items-center">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-numora-cyan bg-numora-surface/80 px-2 py-0.5 rounded border border-numora-cyan/30">
          3D Mathematical Balance Scale
        </span>
        {leftWeight === rightWeight ? (
          <span className="text-[10px] font-bold text-numora-success bg-numora-success/15 px-2 py-0.5 rounded border border-numora-success/30 animate-pulse">
            EQUILIBRIUM (SEIMBANG)
          </span>
        ) : (
          <span className="text-[10px] font-bold text-numora-warning bg-numora-warning/15 px-2 py-0.5 rounded border border-numora-warning/30">
            {leftWeight > rightWeight ? 'Ruas Kiri Lebih Berat' : 'Ruas Kanan Lebih Berat'}
          </span>
        )}
      </div>

      <div ref={mountRef} className="w-full h-[240px]" />

      <div className="w-full px-4 py-2 bg-numora-surface/70 border-t border-white/5 flex items-center justify-between text-xs text-numora-muted">
        <div>Ruas Kiri: <strong className="text-numora-violet font-mono">{leftWeight}</strong></div>
        <div className="text-[11px] font-mono text-numora-cyan">{leftWeight === rightWeight ? 'ax + b = c' : 'ax + b ≠ c'}</div>
        <div>Ruas Kanan: <strong className="text-numora-success font-mono">{rightWeight}</strong></div>
      </div>
    </div>
  );
}
