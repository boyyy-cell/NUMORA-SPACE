import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AlgebraBalance3D({ leftWeight = 17, rightWeight = 17, isBalanced = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions: Expanded height for dominant hero presence
    const width = currentMount.clientWidth || 360;
    const height = 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF6F5EF); // Warm Ivory Base

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.25, 4.3);
    camera.lookAt(0, 0.45, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x355B45, 1.4);
    dirLight1.position.set(-3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xD58B68, 0.9);
    dirLight2.position.set(3, 4, 3);
    scene.add(dirLight2);

    // Balance Base Pillar (Charcoal & Sage)
    const baseGeo = new THREE.CylinderGeometry(0.8, 0.95, 0.22, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x28332C, metalness: 0.3, roughness: 0.4 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.55;
    scene.add(baseMesh);

    const pillarGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.45, 24);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xA7BCA8, metalness: 0.4, roughness: 0.3 });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.y = 0.18;
    scene.add(pillarMesh);

    const fulcrumGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const fulcrumMat = new THREE.MeshStandardMaterial({ color: 0x355B45, roughness: 0.2 });
    const fulcrum = new THREE.Mesh(fulcrumGeo, fulcrumMat);
    fulcrum.position.y = 0.9;
    scene.add(fulcrum);

    // Balance Beam (Forest Green)
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 0.9, 0);
    scene.add(beamGroup);

    const beamGeo = new THREE.BoxGeometry(3.4, 0.09, 0.1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x355B45, metalness: 0.3, roughness: 0.2 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beamGroup.add(beam);

    // Left Pan Assembly (Forest Green)
    const panGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 32);
    const leftPanMat = new THREE.MeshStandardMaterial({ color: 0x355B45, metalness: 0.3, roughness: 0.3 });
    const leftPan = new THREE.Mesh(panGeo, leftPanMat);
    leftPan.position.set(-1.5, -0.65, 0);
    beamGroup.add(leftPan);

    const stringMat = new THREE.LineBasicMaterial({ color: 0x707A70, transparent: true, opacity: 0.65 });
    const leftStringPoints = [new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(-1.5, -0.65, 0)];
    const leftStringGeo = new THREE.BufferGeometry().setFromPoints(leftStringPoints);
    const leftString = new THREE.Line(leftStringGeo, stringMat);
    beamGroup.add(leftString);

    // Right Pan Assembly (Muted Terracotta)
    const rightPanMat = new THREE.MeshStandardMaterial({ color: 0xD58B68, metalness: 0.3, roughness: 0.3 });
    const rightPan = new THREE.Mesh(panGeo, rightPanMat);
    rightPan.position.set(1.5, -0.65, 0);
    beamGroup.add(rightPan);

    const rightStringPoints = [new THREE.Vector3(1.5, 0, 0), new THREE.Vector3(1.5, -0.65, 0)];
    const rightStringGeo = new THREE.BufferGeometry().setFromPoints(rightStringPoints);
    const rightString = new THREE.Line(rightStringGeo, stringMat);
    beamGroup.add(rightString);

    // Weight cubes
    const leftCubeGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    const leftCubeMat = new THREE.MeshStandardMaterial({ color: 0x355B45, roughness: 0.2 });
    const leftCube = new THREE.Mesh(leftCubeGeo, leftCubeMat);
    leftCube.position.set(-1.5, -0.46, 0);
    beamGroup.add(leftCube);

    const rightCubeGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    const rightCubeMat = new THREE.MeshStandardMaterial({ color: 0xD58B68, roughness: 0.2 });
    const rightCube = new THREE.Mesh(rightCubeGeo, rightCubeMat);
    rightCube.position.set(1.5, -0.46, 0);
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
      scene.rotation.y = Math.sin(Date.now() * 0.0008) * 0.06;
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
    <div className="relative w-full rounded-2xl overflow-hidden bg-pure-white border border-border-clean shadow-card-clean flex flex-col items-center">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal bg-pure-white px-2.5 py-1 rounded-lg border border-border-clean shadow-subtle">
          Neraca 3D
        </span>
        {leftWeight === rightWeight ? (
          <span className="text-xs font-bold text-forest bg-sage/20 px-3 py-1 rounded-lg border border-sage/40">
            SEIMBANG (EQUILIBRIUM)
          </span>
        ) : (
          <span className="text-xs font-bold text-terracotta bg-terracotta/15 px-3 py-1 rounded-lg border border-terracotta/30">
            {leftWeight > rightWeight ? 'Ruas Kiri Lebih Berat' : 'Ruas Kanan Lebih Berat'}
          </span>
        )}
      </div>

      <div ref={mountRef} className="w-full h-[320px]" />

      <div className="w-full px-5 py-3 bg-ivory border-t border-border-clean flex items-center justify-between text-xs sm:text-sm text-secondary-text">
        <div>Ruas Kiri: <strong className="text-forest font-mono text-base">{leftWeight}</strong></div>
        <div className="font-mono text-charcoal font-bold text-xs sm:text-sm">
          {leftWeight === rightWeight ? 'Ruas Kiri = Ruas Kanan' : 'Ruas Kiri ≠ Ruas Kanan'}
        </div>
        <div>Ruas Kanan: <strong className="text-terracotta font-mono text-base">{rightWeight}</strong></div>
      </div>
    </div>
  );
}
