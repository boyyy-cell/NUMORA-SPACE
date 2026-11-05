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
    scene.background = new THREE.Color(0x19151F); // Midnight Plum Base

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Ambient & Accent Lights
    const ambientLight = new THREE.AmbientLight(0xF5EFE5, 0.85);
    scene.add(ambientLight);

    const orchidLight = new THREE.PointLight(0xB69AD9, 2.2, 12);
    orchidLight.position.set(-2, 4, 3);
    scene.add(orchidLight);

    const apricotLight = new THREE.PointLight(0xF0A77E, 2.0, 12);
    apricotLight.position.set(2, 3, 2);
    scene.add(apricotLight);

    // Balance Base Pillar (Deep Aubergine + Muted Lavender)
    const baseGeo = new THREE.CylinderGeometry(0.65, 0.85, 0.22, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x28222F, metalness: 0.5, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.5;
    scene.add(baseMesh);

    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.4, 24);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xC8B9C9, metalness: 0.7, roughness: 0.2 });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.y = 0.2;
    scene.add(pillarMesh);

    const fulcrumGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const fulcrumMat = new THREE.MeshStandardMaterial({ color: 0xB69AD9, roughness: 0.15 });
    const fulcrum = new THREE.Mesh(fulcrumGeo, fulcrumMat);
    fulcrum.position.y = 0.9;
    scene.add(fulcrum);

    // Balance Beam (Ivory White)
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 0.9, 0);
    scene.add(beamGroup);

    const beamGeo = new THREE.BoxGeometry(3.2, 0.08, 0.1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xF5EFE5, metalness: 0.4, roughness: 0.2 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beamGroup.add(beam);

    // Left Pan Assembly (Soft Orchid)
    const panGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.05, 32);
    const leftPanMat = new THREE.MeshStandardMaterial({ color: 0xB69AD9, metalness: 0.4, roughness: 0.3 });
    const leftPan = new THREE.Mesh(panGeo, leftPanMat);
    leftPan.position.set(-1.4, -0.6, 0);
    beamGroup.add(leftPan);

    const stringMat = new THREE.LineBasicMaterial({ color: 0xC8B9C9, transparent: true, opacity: 0.65 });
    const leftStringPoints = [new THREE.Vector3(-1.4, 0, 0), new THREE.Vector3(-1.4, -0.6, 0)];
    const leftStringGeo = new THREE.BufferGeometry().setFromPoints(leftStringPoints);
    const leftString = new THREE.Line(leftStringGeo, stringMat);
    beamGroup.add(leftString);

    // Right Pan Assembly (Warm Apricot)
    const rightPanMat = new THREE.MeshStandardMaterial({ color: 0xF0A77E, metalness: 0.4, roughness: 0.3 });
    const rightPan = new THREE.Mesh(panGeo, rightPanMat);
    rightPan.position.set(1.4, -0.6, 0);
    beamGroup.add(rightPan);

    const rightStringPoints = [new THREE.Vector3(1.4, 0, 0), new THREE.Vector3(1.4, -0.6, 0)];
    const rightStringGeo = new THREE.BufferGeometry().setFromPoints(rightStringPoints);
    const rightString = new THREE.Line(rightStringGeo, stringMat);
    beamGroup.add(rightString);

    // Weight cubes
    const leftCubeGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const leftCubeMat = new THREE.MeshStandardMaterial({ color: 0xB69AD9, roughness: 0.2 });
    const leftCube = new THREE.Mesh(leftCubeGeo, leftCubeMat);
    leftCube.position.set(-1.4, -0.45, 0);
    beamGroup.add(leftCube);

    const rightCubeGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const rightCubeMat = new THREE.MeshStandardMaterial({ color: 0xF0A77E, roughness: 0.2 });
    const rightCube = new THREE.Mesh(rightCubeGeo, rightCubeMat);
    rightCube.position.set(1.4, -0.45, 0);
    beamGroup.add(rightCube);

    let animationFrameId;
    let targetRotation = 0;

    const diff = leftWeight - rightWeight;
    if (diff === 0) {
      targetRotation = 0; // perfectly horizontal
    } else {
      targetRotation = Math.max(-0.25, Math.min(0.25, -diff * 0.04));
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      beamGroup.rotation.z += (targetRotation - beamGroup.rotation.z) * 0.08;
      scene.rotation.y = Math.sin(Date.now() * 0.0008) * 0.07;
      renderer.render(scene, camera);
    };
    animate();

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
    <div className="relative w-full rounded-2xl overflow-hidden bg-plum border border-lavender/15 flex flex-col items-center">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-orchid bg-aubergine/80 px-2 py-0.5 rounded border border-orchid/25">
          3D Balance Scale
        </span>
        {leftWeight === rightWeight ? (
          <span className="text-[10px] font-bold text-sage bg-sage/20 px-2 py-0.5 rounded border border-sage/40 animate-pulse">
            EQUILIBRIUM (SEIMBANG)
          </span>
        ) : (
          <span className="text-[10px] font-bold text-apricot bg-apricot/20 px-2 py-0.5 rounded border border-apricot/30">
            {leftWeight > rightWeight ? 'Ruas Kiri Lebih Berat' : 'Ruas Kanan Lebih Berat'}
          </span>
        )}
      </div>

      <div ref={mountRef} className="w-full h-[240px]" />

      <div className="w-full px-4 py-2 bg-aubergine/80 border-t border-lavender/10 flex items-center justify-between text-xs text-lavender">
        <div>Ruas Kiri: <strong className="text-orchid font-mono">{leftWeight}</strong></div>
        <div className="text-[11px] font-mono text-ivory">{leftWeight === rightWeight ? 'ax + b = c' : 'ax + b ≠ c'}</div>
        <div>Ruas Kanan: <strong className="text-apricot font-mono">{rightWeight}</strong></div>
      </div>
    </div>
  );
}
