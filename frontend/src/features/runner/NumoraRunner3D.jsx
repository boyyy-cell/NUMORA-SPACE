import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Heart, 
  Coins, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Zap,
  Flame,
  Maximize2
} from 'lucide-react';
import { getRandomQuestion } from './questionBank';
import { sounds } from './soundEffects';
import { getRunnerStats, saveRunnerSession, getRunnerHighScore } from './runnerStorage';
import MathView from '../../components/common/MathView';

// --- KONSTANTA GAMEPLAY ---
const LANE_X = [-2.2, 0, 2.2]; // 3 Jalur: Kiri, Tengah, Kanan
const GRAVITY = -26.0;
const JUMP_FORCE = 11.2;
const SLIDE_DURATION = 0.75; // detik
const BASE_SPEED = 14.0;
const GATE_INTERVAL = 320; // Jarak antar gerbang portal (meter)

export default function NumoraRunner3D({ onBackToDashboard }) {
  const containerRef = useRef(null);

  // --- STATE PERMAINAN ---
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'question' | 'paused' | 'gameover'
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // --- STATE TANTANGAN GERBANG PORTAL ---
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionResult, setQuestionResult] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [gateNumber, setGateNumber] = useState(1);
  const [streakCount, setStreakCount] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState([]);
  const [gameOverSummary, setGameOverSummary] = useState(null);

  // --- REFS INTERNAL THREE.JS ENGINE ---
  const engineRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    charGroup: null,
    charBody: null,
    charHead: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
    shadowMesh: null,
    obstacles: [],
    coinsList: [],
    activeGateInWorld: null,
    sceneryItems: [],
    currentLane: 1, // 0 = Kiri, 1 = Tengah, 2 = Kanan
    targetLaneX: 0,
    charY: 0,
    jumpVelocity: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: BASE_SPEED,
    normalTargetSpeed: BASE_SPEED,
    lastTime: 0,
    animId: null,
    distanceTravelled: 0,
    nextGateDistance: GATE_INTERVAL,
    nextSpawnDistance: 25,
    gateCounter: 0,
    isApproachingGate: false,
    // Camera default target positions
    cameraDefaultY: 3.6,
    cameraDefaultZ: 6.2,
  });

  // Touch control tracking
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Update high score saat level diganti
  useEffect(() => {
    setHighScore(getRunnerHighScore(selectedLevel));
  }, [selectedLevel]);

  // Audio mute handler
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // --- KONTROL PEMAIN (GERAKAN) ---
  const moveLeft = useCallback(() => {
    const e = engineRef.current;
    if (e.currentLane > 0) {
      e.currentLane -= 1;
      e.targetLaneX = LANE_X[e.currentLane];
      sounds.playSlide();
    }
  }, []);

  const moveRight = useCallback(() => {
    const e = engineRef.current;
    if (e.currentLane < 2) {
      e.currentLane += 1;
      e.targetLaneX = LANE_X[e.currentLane];
      sounds.playSlide();
    }
  }, []);

  const triggerJump = useCallback(() => {
    const e = engineRef.current;
    if (!e.isJumping) {
      e.isJumping = true;
      e.jumpVelocity = JUMP_FORCE;
      e.isSliding = false;
      sounds.playJump();
    }
  }, []);

  const triggerSlide = useCallback(() => {
    const e = engineRef.current;
    if (!e.isSliding) {
      e.isSliding = true;
      e.slideTimer = SLIDE_DURATION;
      if (e.isJumping) {
        e.jumpVelocity = -12.0;
      }
      sounds.playSlide();
    }
  }, []);

  // --- KEYBOARD LISTENERS ---
  useEffect(() => {
    const handleKeyDown = (ev) => {
      if (gameState === 'question') {
        if (['1', 'a', 'A'].includes(ev.key)) handleOptionClick(0);
        else if (['2', 'b', 'B'].includes(ev.key)) handleOptionClick(1);
        else if (['3', 'c', 'C'].includes(ev.key)) handleOptionClick(2);
        else if (['4', 'd', 'D'].includes(ev.key)) handleOptionClick(3);
        return;
      }

      if (gameState !== 'playing') {
        if (ev.key === 'p' || ev.key === 'P' || ev.key === 'Escape') {
          if (gameState === 'paused') setGameState('playing');
        }
        return;
      }

      switch (ev.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          ev.preventDefault();
          triggerJump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          ev.preventDefault();
          triggerSlide();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          setGameState('paused');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLeft, moveRight, triggerJump, triggerSlide]);

  // --- TOUCH SWIPE HANDLERS ---
  const handleTouchStart = (ev) => {
    const touch = ev.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (ev) => {
    if (gameState !== 'playing') return;
    const touch = ev.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    if (elapsed > 600) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        if (dx > 0) moveRight();
        else moveLeft();
      } else {
        if (dy < 0) triggerJump();
        else triggerSlide();
      }
    }
  };

  // --- INISIALISASI THREE.JS DUNIA 3D ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF6F5EF); // Warm Ivory
    scene.fog = new THREE.Fog(0xF6F5EF, 45, 95);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 200);
    camera.position.set(0, 3.6, 6.2);
    camera.lookAt(0, 1.2, -6.0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Pencahayaan (Lighting)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFF9E8, 1.15);
    dirLight.position.set(12, 22, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const hemisphereLight = new THREE.HemisphereLight(0xA7BCA8, 0x355B45, 0.4);
    scene.add(hemisphereLight);

    // 5. Lintasan Berlari (Track & Road)
    const roadWidth = 8.2;
    const roadLength = 140;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x28332C, // Charcoal track
      roughness: 0.8,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -0.01, -30);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Garis marka pemisah jalur
    [-1.1, 1.1].forEach((lineX) => {
      const lineGeo = new THREE.PlaneGeometry(0.12, roadLength);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xA7BCA8, opacity: 0.7, transparent: true });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(lineX, 0.01, -30);
      scene.add(lineMesh);
    });

    // Batas tepi lintasan (Curbs)
    [-4.1, 4.1].forEach((curbX) => {
      const curbGeo = new THREE.BoxGeometry(0.24, 0.35, roadLength);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0xD58B68, roughness: 0.6 });
      const curbMesh = new THREE.Mesh(curbGeo, curbMat);
      curbMesh.position.set(curbX, 0.15, -30);
      scene.add(curbMesh);
    });

    // Tanah sekitar (Surrounding sage ground)
    const groundGeo = new THREE.PlaneGeometry(120, roadLength);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xE8EDE6, roughness: 0.95 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -0.05, -30);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 6. Model Karakter Pelari (Stylized 3D Student Runner)
    const charGroup = new THREE.Group();
    charGroup.position.set(0, 0, 0);

    // Badan / Torso (Hoodie Forest Green)
    const bodyGeo = new THREE.BoxGeometry(0.75, 0.9, 0.45);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x355B45, roughness: 0.5 });
    const charBody = new THREE.Mesh(bodyGeo, bodyMat);
    charBody.position.y = 1.05;
    charBody.castShadow = true;
    charGroup.add(charBody);

    // Kepala (Warm Ivory / Beige)
    const headGeo = new THREE.SphereGeometry(0.32, 20, 20);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xF6F5EF, roughness: 0.35 });
    const charHead = new THREE.Mesh(headGeo, headMat);
    charHead.position.y = 1.75;
    charHead.castShadow = true;
    charGroup.add(charHead);

    // Headband (Muted Terracotta)
    const bandGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.1, 20);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xD58B68 });
    const headband = new THREE.Mesh(bandGeo, bandMat);
    headband.position.y = 1.82;
    charGroup.add(headband);

    // Tangan Kiri & Kanan
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x355B45 });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.48, 1.05, 0);
    leftArm.castShadow = true;
    charGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.48, 1.05, 0);
    rightArm.castShadow = true;
    charGroup.add(rightArm);

    // Kaki Kiri & Kanan
    const legGeo = new THREE.BoxGeometry(0.24, 0.7, 0.24);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x28332C });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.22, 0.35, 0);
    leftLeg.castShadow = true;
    charGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.22, 0.35, 0);
    rightLeg.castShadow = true;
    charGroup.add(rightLeg);

    // Bayangan di tanah
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1A231D, opacity: 0.35, transparent: true });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    scene.add(shadowMesh);

    scene.add(charGroup);

    // 7. Elemen Alam Lingkungan (Pilar & Lentera Sisi Lintasan)
    const sceneryItems = [];
    for (let z = -100; z <= 20; z += 14) {
      [-5.5, 5.5].forEach((sideX) => {
        const pillarGeo = new THREE.CylinderGeometry(0.22, 0.3, 3.2, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xA7BCA8, roughness: 0.6 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(sideX, 1.6, z);

        const topGeo = new THREE.OctahedronGeometry(0.4);
        const topMat = new THREE.MeshStandardMaterial({
          color: 0xD58B68,
          emissive: 0xD58B68,
          emissiveIntensity: 0.5,
        });
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.y = 1.8;
        pillar.add(topMesh);

        scene.add(pillar);
        sceneryItems.push(pillar);
      });
    }

    // Simpan ke engine ref
    engineRef.current = {
      ...engineRef.current,
      scene,
      camera,
      renderer,
      charGroup,
      charBody,
      charHead,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      shadowMesh,
      sceneryItems,
      obstacles: [],
      coinsList: [],
      activeGateInWorld: null,
      currentLane: 1,
      targetLaneX: 0,
      charY: 0,
      jumpVelocity: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      speed: BASE_SPEED,
      normalTargetSpeed: BASE_SPEED,
      lastTime: performance.now(),
      distanceTravelled: 0,
      nextGateDistance: GATE_INTERVAL,
      nextSpawnDistance: 25,
      gateCounter: 0,
      isApproachingGate: false,
    };

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !engineRef.current.renderer) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      engineRef.current.camera.aspect = nw / nh;
      engineRef.current.camera.updateProjectionMatrix();
      engineRef.current.renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (engineRef.current.animId) {
        cancelAnimationFrame(engineRef.current.animId);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --- PEMBUAT OBSTACLES & KOIN ---
  const spawnObstacle = (scene, zPos) => {
    const types = ['crate', 'low_hurdle', 'high_barrier'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const chosenLane = Math.floor(Math.random() * 3);
    const laneX = LANE_X[chosenLane];

    if (chosenType === 'crate') {
      const geo = new THREE.BoxGeometry(1.4, 1.3, 1.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xD58B68,
        roughness: 0.7,
      });
      const crate = new THREE.Mesh(geo, mat);
      crate.position.set(laneX, 0.65, zPos);
      crate.castShadow = true;
      crate.userData = { type: 'crate', lane: chosenLane, minY: 0, maxY: 1.4, radius: 0.7 };
      scene.add(crate);
      return crate;
    } else if (chosenType === 'low_hurdle') {
      const group = new THREE.Group();
      const barGeo = new THREE.BoxGeometry(1.6, 0.22, 0.2);
      const barMat = new THREE.MeshStandardMaterial({ color: 0x9B2C2C, roughness: 0.4 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 0.45, 0);
      group.add(bar);

      [-0.7, 0.7].forEach((legX) => {
        const legG = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
        const legM = new THREE.MeshStandardMaterial({ color: 0x28332C });
        const leg = new THREE.Mesh(legG, legM);
        leg.position.set(legX, 0.25, 0);
        group.add(leg);
      });

      group.position.set(laneX, 0, zPos);
      group.userData = { type: 'low_hurdle', lane: chosenLane, minY: 0, maxY: 0.7, radius: 0.8 };
      scene.add(group);
      return group;
    } else {
      const group = new THREE.Group();
      const topBarGeo = new THREE.BoxGeometry(1.7, 0.7, 0.25);
      const topBarMat = new THREE.MeshStandardMaterial({ color: 0x355B45, roughness: 0.4 });
      const topBar = new THREE.Mesh(topBarGeo, topBarMat);
      topBar.position.set(0, 1.65, 0);
      group.add(topBar);

      [-0.8, 0.8].forEach((poleX) => {
        const poleG = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8);
        const poleM = new THREE.MeshStandardMaterial({ color: 0xA7BCA8 });
        const pole = new THREE.Mesh(poleG, poleM);
        pole.position.set(poleX, 1.0, 0);
        group.add(pole);
      });

      group.position.set(laneX, 0, zPos);
      group.userData = { type: 'high_barrier', lane: chosenLane, minY: 0.9, maxY: 2.2, radius: 0.8 };
      scene.add(group);
      return group;
    }
  };

  const spawnCoin = (scene, lane, zPos, yPos = 0.5) => {
    const geo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xD97706,
      emissiveIntensity: 0.25,
    });
    const coin = new THREE.Mesh(geo, mat);
    coin.rotation.z = Math.PI / 2;
    coin.position.set(LANE_X[lane], yPos, zPos);
    coin.userData = { lane, collected: false };
    scene.add(coin);
    return coin;
  };

  // --- UPGRADED FUTURISTIC ALGEBRA PORTAL ---
  const spawnAlgebraPortal = (scene, zPos, gateNum = 1) => {
    const portalGroup = new THREE.Group();

    // 1. Pilar Pylon Kiri & Kanan (Futuristic Conduits)
    [-3.5, 3.5].forEach((px) => {
      // Tiang Utama
      const colG = new THREE.CylinderGeometry(0.38, 0.45, 5.2, 12);
      const colM = new THREE.MeshStandardMaterial({
        color: 0x28332C,
        metalness: 0.4,
        roughness: 0.5,
      });
      const col = new THREE.Mesh(colG, colM);
      col.position.set(px, 2.6, 0);
      portalGroup.add(col);

      // Jalur Cahaya Neon Emissive pada tiang
      const neonG = new THREE.BoxGeometry(0.12, 4.8, 0.12);
      const neonM = new THREE.MeshBasicMaterial({ color: 0xA7BCA8 });
      const neon = new THREE.Mesh(neonG, neonM);
      neon.position.set(px + (px > 0 ? -0.32 : 0.32), 2.6, 0.15);
      portalGroup.add(neon);

      // Kristal Pemancar di Puncak Tiang
      const emitterG = new THREE.OctahedronGeometry(0.45);
      const emitterM = new THREE.MeshStandardMaterial({
        color: 0xD58B68,
        emissive: 0xD58B68,
        emissiveIntensity: 0.8,
      });
      const emitter = new THREE.Mesh(emitterG, emitterM);
      emitter.position.set(px, 5.3, 0);
      portalGroup.add(emitter);
    });

    // 2. Lengkungan Mahkota Melingkar (Arch Crown)
    const archCurveGeo = new THREE.TorusGeometry(3.55, 0.28, 16, 32, Math.PI);
    const archCurveMat = new THREE.MeshStandardMaterial({
      color: 0x355B45,
      metalness: 0.5,
      roughness: 0.3,
    });
    const archCrown = new THREE.Mesh(archCurveGeo, archCrownMat => archCurveMat);
    archCrown.position.set(0, 2.6, 0);
    portalGroup.add(archCrown);

    // 3. Cincin Energi Konsentris Berputar (Concentric Energy Rings)
    // Cincin Luar
    const ringOuterGeo = new THREE.TorusGeometry(3.1, 0.08, 16, 48);
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0x355B45,
      wireframe: false,
    });
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
    ringOuter.position.set(0, 2.6, 0);
    portalGroup.add(ringOuter);

    // Cincin Dalam (Berputar arah berlawanan)
    const ringInnerGeo = new THREE.TorusGeometry(2.35, 0.06, 16, 40);
    const ringInnerMat = new THREE.MeshBasicMaterial({
      color: 0xA7BCA8,
    });
    const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
    ringInner.position.set(0, 2.6, 0);
    portalGroup.add(ringInner);

    // 4. Inti Pusaran Energi Luminous (Vortex Core Disc)
    const coreGeo = new THREE.CircleGeometry(2.28, 36);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x355B45,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });
    const coreDisc = new THREE.Mesh(coreGeo, coreMat);
    coreDisc.position.set(0, 2.6, 0);
    portalGroup.add(coreDisc);

    // 5. Partikel Matematika Mengapung & Mengorbit (Orbiting Math Glyphs)
    const orbitNodes = [];
    const nodeCount = 6;
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const nodeRadius = 3.3;
      const nodeGeo = new THREE.OctahedronGeometry(0.24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xF59E0B : 0xD58B68,
        emissive: i % 2 === 0 ? 0xD97706 : 0xD58B68,
        emissiveIntensity: 0.6,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(
        Math.cos(angle) * nodeRadius,
        2.6 + Math.sin(angle) * (nodeRadius * 0.8),
        Math.sin(angle * 2) * 0.3
      );
      portalGroup.add(nodeMesh);
      orbitNodes.push({ mesh: nodeMesh, baseAngle: angle, radius: nodeRadius });
    }

    // 6. Landasan Energi di Tanah (Ground Energy Threshold Rune)
    const groundRuneGeo = new THREE.RingGeometry(1.6, 2.8, 32);
    const groundRuneMat = new THREE.MeshBasicMaterial({
      color: 0xA7BCA8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const groundRune = new THREE.Mesh(groundRuneGeo, groundRuneMat);
    groundRune.rotation.x = -Math.PI / 2;
    groundRune.position.set(0, 0.03, 0);
    portalGroup.add(groundRune);

    portalGroup.position.set(0, 0, zPos);
    portalGroup.userData = {
      triggered: false,
      gateNumber: gateNum,
      ringOuter,
      ringInner,
      coreDisc,
      groundRune,
      orbitNodes,
      cleared: false,
    };

    scene.add(portalGroup);
    return portalGroup;
  };

  // --- GAME LOOP UTAMA (ANIMATION FRAME) ---
  useEffect(() => {
    const e = engineRef.current;
    if (!e.renderer) return;

    let animRunning = true;

    const gameLoop = (currentTime) => {
      if (!animRunning) return;
      e.animId = requestAnimationFrame(gameLoop);

      const dt = Math.min((currentTime - (e.lastTime || currentTime)) / 1000, 0.08);
      e.lastTime = currentTime;

      // UPDATE FISIKA HANYA SAAT PLAYING
      if (gameState === 'playing') {
        // 1. Jarak & Kecepatan
        e.distanceTravelled += e.speed * dt;
        const currentMeters = Math.floor(e.distanceTravelled);
        setDistance(currentMeters);
        setScore((prev) => prev + Math.round(e.speed * dt * comboMultiplier * 1.5));

        // Kecepatan normal meningkat bertahap
        e.normalTargetSpeed = Math.min(BASE_SPEED + e.distanceTravelled * 0.008, 26.0);

        // Jika tidak sedang mendekati portal, lerp kecepatan ke normal
        if (!e.isApproachingGate) {
          e.speed += (e.normalTargetSpeed - e.speed) * (4.0 * dt);
        }

        // 2. Transisi Jalur (Smooth Horizontal Lerp)
        e.charGroup.position.x += (e.targetLaneX - e.charGroup.position.x) * (14.0 * dt);
        const tiltX = (e.targetLaneX - e.charGroup.position.x) * -0.25;
        e.charGroup.rotation.z = tiltX;

        // 3. Fisika Lompat
        if (e.isJumping) {
          e.charY += e.jumpVelocity * dt;
          e.jumpVelocity += GRAVITY * dt;
          if (e.charY <= 0) {
            e.charY = 0;
            e.jumpVelocity = 0;
            e.isJumping = false;
          }
        }

        // 4. Fisika Merunduk
        if (e.isSliding) {
          e.slideTimer -= dt;
          e.charGroup.scale.set(1.15, 0.45, 1.15);
          e.charGroup.position.y = 0;
          if (e.slideTimer <= 0) {
            e.isSliding = false;
            e.charGroup.scale.set(1, 1, 1);
          }
        } else {
          e.charGroup.scale.set(1, 1, 1);
          e.charGroup.position.y = e.charY;
        }

        // Bayangan
        if (e.shadowMesh) {
          e.shadowMesh.position.x = e.charGroup.position.x;
          const shadowScale = Math.max(0.3, 1.0 - e.charY * 0.28);
          e.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
        }

        // 5. Animasi Lari Karakter
        const runCycle = currentTime * 0.012 * (Math.max(e.speed, 2.0) / BASE_SPEED);
        if (!e.isJumping && !e.isSliding) {
          if (e.leftArm) e.leftArm.rotation.x = Math.sin(runCycle) * 0.85;
          if (e.rightArm) e.rightArm.rotation.x = -Math.sin(runCycle) * 0.85;
          if (e.leftLeg) e.leftLeg.rotation.x = -Math.sin(runCycle) * 0.95;
          if (e.rightLeg) e.rightLeg.rotation.x = Math.sin(runCycle) * 0.95;
          e.charGroup.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.08;
        } else if (e.isJumping) {
          if (e.leftArm) e.leftArm.rotation.x = -1.8;
          if (e.rightArm) e.rightArm.rotation.x = -1.8;
          if (e.leftLeg) e.leftLeg.rotation.x = 0.5;
          if (e.rightLeg) e.rightLeg.rotation.x = 0.5;
        }

        // 6. Gerakan Lingkungan & Scenery Scrolling
        e.sceneryItems.forEach((item) => {
          item.position.z += e.speed * dt;
          if (item.position.z > 20) {
            item.position.z -= 120;
          }
        });

        // 7. Spawning Dinamis Obstacles & Koin
        if (e.distanceTravelled > e.nextSpawnDistance) {
          const distToGate = e.nextGateDistance - e.distanceTravelled;
          if (distToGate > 40 || distToGate < -20) {
            const spawnZ = -80;
            const obs = spawnObstacle(e.scene, spawnZ);
            e.obstacles.push(obs);

            const coinLane = (obs.userData.lane + 1) % 3;
            for (let c = 0; c < 3; c++) {
              const coin = spawnCoin(e.scene, coinLane, spawnZ + (c * 3.8) - 6);
              e.coinsList.push(coin);
            }
          }
          e.nextSpawnDistance = e.distanceTravelled + 24 + Math.random() * 12;
        }

        // 8. Spawning Gerbang Portal Aljabar Futuristik
        if (e.distanceTravelled >= e.nextGateDistance && !e.activeGateInWorld) {
          e.gateCounter += 1;
          const portal = spawnAlgebraPortal(e.scene, -85, e.gateCounter);
          e.activeGateInWorld = portal;
          e.nextGateDistance = e.distanceTravelled + GATE_INTERVAL;
          setGateNumber(e.gateCounter);
        }

        // 9. Update & Deteksi Tabrakan Obstacles
        for (let i = e.obstacles.length - 1; i >= 0; i--) {
          const obs = e.obstacles[i];
          obs.position.z += e.speed * dt;

          if (Math.abs(obs.position.z) < 1.2 && obs.userData.lane === e.currentLane) {
            let hit = false;
            const u = obs.userData;

            if (u.type === 'crate') {
              hit = true;
            } else if (u.type === 'low_hurdle') {
              if (e.charY < 0.8) hit = true;
            } else if (u.type === 'high_barrier') {
              if (!e.isSliding) hit = true;
            }

            if (hit) {
              sounds.playWrong();
              e.scene.remove(obs);
              e.obstacles.splice(i, 1);

              setLives((prev) => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  triggerGameOver('Karakter tersandung rintangan!');
                }
                return newLives;
              });

              setComboMultiplier(1);
              setStreakCount(0);
              continue;
            }
          }

          if (obs.position.z > 14) {
            e.scene.remove(obs);
            e.obstacles.splice(i, 1);
          }
        }

        // 10. Update & Pengambilan Koin
        for (let j = e.coinsList.length - 1; j >= 0; j--) {
          const coin = e.coinsList[j];
          coin.position.z += e.speed * dt;
          coin.rotation.y += 3.5 * dt;

          if (!coin.userData.collected && Math.abs(coin.position.z) < 1.1 && coin.userData.lane === e.currentLane) {
            coin.userData.collected = true;
            sounds.playCoin();
            setCoins((prev) => prev + 1);
            setScore((prev) => prev + 15 * comboMultiplier);
            e.scene.remove(coin);
            e.coinsList.splice(j, 1);
            continue;
          }

          if (coin.position.z > 14) {
            e.scene.remove(coin);
            e.coinsList.splice(j, 1);
          }
        }

        // 11. ANIMASI & DETEKSI PENDEKATAN GERBANG PORTAL ALJABAR
        if (e.activeGateInWorld) {
          const portal = e.activeGateInWorld;
          const u = portal.userData;
          portal.position.z += e.speed * dt;

          const isCleared = u.cleared;

          // Animasi Cincin Energi Portal Berputar
          if (u.ringOuter) {
            u.ringOuter.rotation.z += (e.isApproachingGate ? 6.5 : 2.2) * dt;
          }
          if (u.ringInner) {
            u.ringInner.rotation.z -= (e.isApproachingGate ? 8.2 : 2.8) * dt;
          }

          // Animasi Partikel Matematika Mengorbit
          if (u.orbitNodes) {
            u.orbitNodes.forEach((node, idx) => {
              const speedMult = e.isApproachingGate ? 4.0 : 1.5;
              const angle = node.baseAngle + (currentTime * 0.001 * speedMult);
              node.mesh.position.x = Math.cos(angle) * node.radius;
              node.mesh.position.y = 2.6 + Math.sin(angle) * (node.radius * 0.8);
              node.mesh.rotation.x += 2.0 * dt;
              node.mesh.rotation.y += 3.0 * dt;
            });
          }

          // Efek Denyut Inti Pusaran Energi (Vortex Pulse)
          if (u.coreDisc && !isCleared) {
            u.coreDisc.material.opacity = 0.32 + Math.sin(currentTime * 0.006) * 0.16;
            u.coreDisc.rotation.z += 1.2 * dt;
          }

          // FASE 1: Karakter mulai mendekati portal (Z di antara -26 dan -5.5)
          if (!u.triggered && portal.position.z >= -26 && portal.position.z < -4.8) {
            e.isApproachingGate = true;
            // Melambat secara halus (smooth deceleration)
            e.speed = THREE.MathUtils.lerp(e.speed, 2.2, 3.2 * dt);

            // Transisi Kamera Halus mendekat ke portal (Cinematic zoom in)
            e.camera.position.x += (e.charGroup.position.x * 0.3 - e.camera.position.x) * (3.0 * dt);
            e.camera.position.y += (2.9 - e.camera.position.y) * (3.0 * dt);
            e.camera.position.z += (4.8 - e.camera.position.z) * (3.0 * dt);
          }

          // FASE 2: Berhenti tepat di depan portal dan buka tantangan soal
          if (!u.triggered && portal.position.z >= -4.8) {
            u.triggered = true;
            e.speed = 0;
            triggerAlgebraChallenge();
          }

          // Hapus portal setelah lewat jauh di belakang
          if (portal.position.z > 14) {
            e.scene.remove(portal);
            e.activeGateInWorld = null;
            e.isApproachingGate = false;
          }
        } else {
          // Reset posisi kamera normal saat berlari bebas
          e.camera.position.x += (0 - e.camera.position.x) * (4.0 * dt);
          e.camera.position.y += (e.cameraDefaultY - e.camera.position.y) * (4.0 * dt);
          e.camera.position.z += (e.cameraDefaultZ - e.camera.position.z) * (4.0 * dt);
        }
      }

      // Render Three.js Scene
      e.renderer.render(e.scene, e.camera);
    };

    e.animId = requestAnimationFrame(gameLoop);

    return () => {
      animRunning = false;
      if (e.animId) cancelAnimationFrame(e.animId);
    };
  }, [gameState, comboMultiplier]);

  // --- TRIGGER TANTANGAN SOAL ---
  const triggerAlgebraChallenge = () => {
    sounds.playGateAlert();
    const q = getRandomQuestion(selectedLevel);
    setCurrentQuestion(q);
    setSelectedAnswer(null);
    setQuestionResult(null);
    setQuestionTimer(10);
    setGameState('question');
  };

  // --- TIMER SOAL ALJABAR ---
  useEffect(() => {
    if (gameState !== 'question' || questionResult !== null) return;

    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuestionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, questionResult]);

  // --- PENANGANAN JAWABAN SOAL & ANIMASI KELANJUTAN ---
  const handleOptionClick = (idx) => {
    if (questionResult !== null || !currentQuestion) return;
    const chosen = currentQuestion.options[idx];
    setSelectedAnswer(chosen);

    setSessionAnswered((prev) => prev + 1);

    const e = engineRef.current;
    const portal = e.activeGateInWorld;

    if (chosen === currentQuestion.correctAnswer) {
      // JAWABAN BENAR!
      sounds.playCorrect();
      setQuestionResult('correct');
      setSessionCorrect((prev) => prev + 1);

      // Tingkatkan combo streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      const newMultiplier = Math.min(1 + newStreak * 0.5, 3.5);
      setComboMultiplier(newMultiplier);

      const bonusScore = Math.round(150 * newMultiplier);
      setScore((prev) => prev + bonusScore);

      // ANIMASI PORTAL TERBUKA: Inti pusaran memancar hijau zamrud & membesar membuka celah
      if (portal && portal.userData.coreDisc) {
        portal.userData.cleared = true;
        portal.userData.coreDisc.material.color.setHex(0x10B981); // Emerald Green
        portal.userData.coreDisc.scale.set(1.5, 1.5, 1.5);
      }

      // Resume permainan secara otomatis setelah 1 detik animasi kemenangan
      setTimeout(() => {
        if (portal) {
          // Gerakkan portal melewati karakter
          portal.position.z = 2.0;
        }
        e.isApproachingGate = false;
        e.speed = e.normalTargetSpeed;
        setGameState('playing');
        setCurrentQuestion(null);
        setQuestionResult(null);
      }, 1000);
    } else {
      // JAWABAN SALAH!
      sounds.playWrong();
      setQuestionResult('wrong');
      setComboMultiplier(1);
      setStreakCount(0);

      if (portal && portal.userData.coreDisc) {
        portal.userData.coreDisc.material.color.setHex(0xD58B68); // Terracotta warning
      }

      setSessionMistakes((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          chosen,
          correct: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
        },
      ]);

      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            triggerGameOver('Kehabisan nyawa di Gerbang Aljabar!');
          }, 2400);
        }
        return newLives;
      });
    }
  };

  const handleQuestionTimeout = () => {
    sounds.playWrong();
    setQuestionResult('timeout');
    setComboMultiplier(1);
    setStreakCount(0);
    setSessionAnswered((prev) => prev + 1);

    const e = engineRef.current;
    const portal = e.activeGateInWorld;
    if (portal && portal.userData.coreDisc) {
      portal.userData.coreDisc.material.color.setHex(0xD58B68);
    }

    setSessionMistakes((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        chosen: 'Waktu Habis',
        correct: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
      },
    ]);

    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => {
          triggerGameOver('Waktu habis dan kehabisan nyawa!');
        }, 2400);
      }
      return newLives;
    });
  };

  // Lanjutkan setelah membaca umpan balik salah
  const handleContinueAfterWrong = () => {
    if (lives <= 0) {
      triggerGameOver('Kehabisan nyawa di Gerbang Aljabar!');
    } else {
      const e = engineRef.current;
      if (e.activeGateInWorld) {
        e.activeGateInWorld.position.z = 2.0;
      }
      e.isApproachingGate = false;
      e.speed = e.normalTargetSpeed;
      setGameState('playing');
      setCurrentQuestion(null);
      setQuestionResult(null);
    }
  };

  // --- GAME OVER ---
  const triggerGameOver = (reason) => {
    sounds.playGameOver();
    setGameState('gameover');

    const accuracy = sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;

    const saveResult = saveRunnerSession({
      level: selectedLevel,
      score,
      coins,
      distance,
      answered: sessionAnswered,
      correct: sessionCorrect,
      accuracy,
      mistakes: sessionMistakes,
    });

    setGameOverSummary({
      reason,
      score,
      coins,
      distance,
      answered: sessionAnswered,
      correct: sessionCorrect,
      accuracy,
      isNewHigh: saveResult?.isNewHigh || false,
      highScore: saveResult?.currentHighScore || score,
    });
  };

  // --- RESTART GAME ---
  const handleStartGame = (lvl = selectedLevel) => {
    setSelectedLevel(lvl);
    setScore(0);
    setCoins(0);
    setDistance(0);
    setLives(3);
    setComboMultiplier(1);
    setStreakCount(0);
    setGateNumber(1);
    setSessionAnswered(0);
    setSessionCorrect(0);
    setSessionMistakes([]);
    setCurrentQuestion(null);
    setQuestionResult(null);

    // Reset Engine State
    const e = engineRef.current;
    e.currentLane = 1;
    e.targetLaneX = 0;
    e.charY = 0;
    e.jumpVelocity = 0;
    e.isJumping = false;
    e.isSliding = false;
    e.speed = BASE_SPEED;
    e.normalTargetSpeed = BASE_SPEED;
    e.distanceTravelled = 0;
    e.nextGateDistance = GATE_INTERVAL;
    e.nextSpawnDistance = 25;
    e.gateCounter = 0;
    e.isApproachingGate = false;
    e.lastTime = performance.now();

    // Bersihkan rintangan lama
    e.obstacles.forEach((obs) => e.scene.remove(obs));
    e.obstacles = [];
    e.coinsList.forEach((c) => e.scene.remove(c));
    e.coinsList = [];
    if (e.activeGateInWorld) {
      e.scene.remove(e.activeGateInWorld);
      e.activeGateInWorld = null;
    }

    if (e.charGroup) {
      e.charGroup.position.set(0, 0, 0);
      e.charGroup.scale.set(1, 1, 1);
    }

    // Reset kamera
    e.camera.position.set(0, e.cameraDefaultY, e.cameraDefaultZ);
    e.camera.lookAt(0, 1.2, -6.0);

    setGameState('playing');
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-[#F6F5EF] border border-[#E1E5DC] shadow-sm select-none">
      {/* CANVAS THREE.JS CONTAINER */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* --- HUD HEADER SAAT BERMAIN --- */}
      {(gameState === 'playing' || gameState === 'paused' || gameState === 'question') && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          {/* Sisi Kiri: Nyawa & Combo */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#E1E5DC] shadow-sm pointer-events-auto">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-5 h-5 transition-transform ${
                    heartIndex <= lives
                      ? 'text-[#D58B68] fill-[#D58B68] scale-100'
                      : 'text-gray-300 scale-90'
                  }`}
                />
              ))}
            </div>

            {comboMultiplier > 1 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#355B45] text-white text-xs font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{comboMultiplier.toFixed(1)}x COMBO</span>
              </div>
            )}
          </div>

          {/* Tengah: Skor & Jarak */}
          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-5 py-2 rounded-xl border border-[#E1E5DC] shadow-sm">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-[#707A70] tracking-wider block">Skor</span>
              <span className="text-xl font-extrabold text-[#28332C]">{score.toLocaleString('id-ID')}</span>
            </div>
            <div className="w-[1px] h-6 bg-[#E1E5DC]" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-[#707A70] tracking-wider block">Jarak</span>
              <span className="text-sm font-bold text-[#355B45]">{distance} m</span>
            </div>
          </div>

          {/* Sisi Kanan: Koin, Audio, Pause */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E1E5DC] shadow-sm pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2 font-bold text-sm text-[#D97706]">
              <Coins className="w-4 h-4 fill-[#F59E0B]" />
              <span>{coins}</span>
            </div>

            <button
              onClick={handleToggleMute}
              className="p-1.5 text-[#707A70] hover:text-[#28332C] hover:bg-[#F6F5EF] rounded-lg transition"
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {gameState === 'playing' ? (
              <button
                onClick={() => setGameState('paused')}
                className="p-1.5 text-[#707A70] hover:text-[#28332C] hover:bg-[#F6F5EF] rounded-lg transition"
                title="Jeda (Pause)"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : gameState === 'paused' ? (
              <button
                onClick={() => setGameState('playing')}
                className="p-1.5 text-[#355B45] hover:bg-[#A7BCA8]/20 rounded-lg transition font-semibold"
                title="Lanjutkan"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* --- KONTROL VIRTUAL MOBILE (LAYAR SENTUH) --- */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none z-20 sm:hidden">
          <div className="flex gap-2 pointer-events-auto">
            <button
              onTouchStart={(e) => { e.preventDefault(); moveLeft(); }}
              onClick={moveLeft}
              className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E1E5DC] text-[#28332C] flex items-center justify-center active:bg-[#355B45] active:text-white shadow-md transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); moveRight(); }}
              onClick={moveRight}
              className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E1E5DC] text-[#28332C] flex items-center justify-center active:bg-[#355B45] active:text-white shadow-md transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button
              onTouchStart={(e) => { e.preventDefault(); triggerSlide(); }}
              onClick={triggerSlide}
              className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E1E5DC] text-[#28332C] flex items-center justify-center active:bg-[#D58B68] active:text-white shadow-md transition"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); triggerJump(); }}
              onClick={triggerJump}
              className="w-14 h-14 rounded-2xl bg-[#355B45] text-white flex items-center justify-center active:scale-95 shadow-md transition"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* --- UPGRADED NON-OBTRUSIVE ALGEBRA PORTAL CHALLENGE MODAL --- */}
      {gameState === 'question' && currentQuestion && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md border-2 border-[#355B45] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden transform transition-all animate-in zoom-in-95">
            {/* Header Gerbang Portal & Countdown Timer */}
            <div className="flex items-center justify-between mb-3 border-b border-[#E1E5DC] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#355B45] text-white flex items-center justify-center font-mono font-extrabold text-xs">
                  Ω
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#28332C]">
                      Algebra Portal #{gateNumber}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sage/20 text-[#355B45] uppercase">
                      {currentQuestion.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#707A70] block leading-tight">
                    {currentQuestion.topic}
                  </span>
                </div>
              </div>

              {/* Countdown Timer Bar/Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F5EF] border border-[#E1E5DC]">
                <Zap className={`w-3.5 h-3.5 ${questionTimer <= 3 ? 'text-red-500 animate-bounce' : 'text-[#D58B68]'}`} />
                <span className={`text-xs font-black ${questionTimer <= 3 ? 'text-red-600' : 'text-[#28332C]'}`}>
                  {questionTimer}s
                </span>
              </div>
            </div>

            {/* Timer Progress Indicator Line */}
            <div className="w-full h-1 bg-[#E1E5DC] rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-1000 ${
                  questionTimer <= 3 ? 'bg-red-500' : 'bg-[#355B45]'
                }`}
                style={{ width: `${(questionTimer / 10) * 100}%` }}
              />
            </div>

            {/* Pertanyaan Soal */}
            <div className="text-center py-1 mb-3">
              <p className="text-sm sm:text-base font-bold text-[#28332C] mb-2 leading-snug">
                {currentQuestion.question}
              </p>
              {currentQuestion.katex && (
                <div className="inline-block px-4 py-1.5 bg-[#F6F5EF] rounded-xl border border-[#E1E5DC] text-base font-mono text-[#355B45] shadow-2xs">
                  <MathView math={currentQuestion.katex} />
                </div>
              )}
            </div>

            {/* Pilihan Ganda (A, B, C, D) */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {currentQuestion.options.map((option, idx) => {
                const label = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let btnStyle = 'bg-[#F6F5EF] border-[#E1E5DC] text-[#28332C] hover:bg-[#A7BCA8]/20 hover:border-[#355B45]';

                if (questionResult !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold scale-[1.02] shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-100 border-rose-400 text-rose-800 font-bold';
                  } else {
                    btnStyle = 'bg-gray-100 border-gray-200 text-gray-400 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={questionResult !== null}
                    onClick={() => handleOptionClick(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 text-left font-semibold transition-all ${btnStyle}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white/80 border border-current text-[11px] font-bold flex items-center justify-center shrink-0">
                        {label}
                      </span>
                      <span className="text-xs sm:text-sm font-mono truncate">{option}</span>
                    </span>
                    {questionResult !== null && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {questionResult !== null && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Umpan Balik Socratic NORA Jika Salah / Waktu Habis */}
            {(questionResult === 'wrong' || questionResult === 'timeout') && (
              <div className="p-3.5 rounded-2xl bg-[#F6F5EF] border border-[#D58B68]/30 mb-2 animate-fade-in text-left">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#D58B68] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    N
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-[#D58B68] uppercase tracking-wider mb-0.5">
                      {questionResult === 'timeout' ? 'Waktu Habis!' : 'Ulasan Konsep NORA:'}
                    </h4>
                    <p className="text-xs text-[#28332C] leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex justify-end">
                  <button
                    onClick={handleContinueAfterWrong}
                    className="px-4 py-1.5 bg-[#355B45] text-white text-xs font-bold rounded-xl hover:bg-[#28332C] transition shadow-xs flex items-center gap-1"
                  >
                    <span>Lanjutkan Lari</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Status Pesan Jika Benar */}
            {questionResult === 'correct' && (
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm animate-bounce py-1">
                <Sparkles className="w-4 h-4" />
                <span>Portal Terbuka! Melesat Maju (+{Math.round(150 * comboMultiplier)} Poin)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- OVERLAY MENU AWAL (START SCREEN) --- */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-[#F6F5EF]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A7BCA8]/20 border border-[#A7BCA8] text-[#355B45] text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NUMORA SPACE v1.6</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#28332C] tracking-tight mb-2">
              NUMORA <span className="text-[#355B45]">RUN</span>
            </h1>

            <p className="text-sm text-[#707A70] mb-6 leading-relaxed">
              Endless Runner Matematika — Hindari rintangan, kumpulkan koin, dan tembus gerbang portal aljabar futuristik!
            </p>

            {/* Level Selector */}
            <div className="mb-6 bg-white p-3 rounded-2xl border border-[#E1E5DC] shadow-sm text-left">
              <span className="text-xs font-bold text-[#707A70] uppercase tracking-wider block mb-2 px-1">
                Pilih Tingkat Materi:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'beginner', name: 'Beginner', desc: 'Variabel & Suku' },
                  { id: 'intermediate', name: 'Intermediate', desc: 'Operasi Aljabar' },
                  { id: 'advanced', name: 'Advanced', desc: 'Substitusi Nilai' },
                  { id: 'expert', name: 'Expert', desc: 'Persamaan Neraca' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedLevel === lvl.id
                        ? 'border-[#355B45] bg-[#355B45]/5 text-[#355B45] font-bold shadow-xs'
                        : 'border-[#E1E5DC] text-[#707A70] hover:bg-[#F6F5EF]'
                    }`}
                  >
                    <div className="text-xs font-bold">{lvl.name}</div>
                    <div className="text-[10px] text-[#707A70] font-normal">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Highscore & Petunjuk Kontrol */}
            <div className="flex items-center justify-between text-xs text-[#707A70] mb-6 px-2">
              <span className="flex items-center gap-1.5 font-semibold text-[#28332C]">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                Rekor Terbaik: {highScore.toLocaleString('id-ID')}
              </span>
              <span className="hidden sm:inline">Kontrol: Tombol Panah / A-W-S-D</span>
            </div>

            {/* Tombol Play */}
            <button
              onClick={() => handleStartGame(selectedLevel)}
              className="w-full py-4 rounded-2xl bg-[#355B45] hover:bg-[#28332C] text-white font-extrabold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Mulai Berlari</span>
            </button>
          </div>
        </div>
      )}

      {/* --- OVERLAY GAME OVER SCREEN --- */}
      {gameState === 'gameover' && gameOverSummary && (
        <div className="absolute inset-0 bg-[#F6F5EF]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-fade-in">
          <div className="max-w-md w-full bg-white border border-[#E1E5DC] rounded-3xl p-6 sm:p-8 shadow-xl text-center">
            {gameOverSummary.isNewHigh ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#D97706] text-xs font-extrabold uppercase tracking-wider mb-2 animate-bounce">
                <Trophy className="w-4 h-4" />
                <span>Rekor Baru Tercapai!</span>
              </div>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-[#707A70] block mb-2">
                Permainan Berakhir
              </span>
            )}

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#28332C] mb-1">
              {gameOverSummary.score.toLocaleString('id-ID')} Poin
            </h2>
            <p className="text-xs text-[#707A70] mb-6">{gameOverSummary.reason}</p>

            {/* Statistik Lari */}
            <div className="grid grid-cols-3 gap-2 bg-[#F6F5EF] p-3 rounded-2xl border border-[#E1E5DC] mb-6">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#707A70] block">Jarak</span>
                <span className="text-sm font-extrabold text-[#28332C]">{gameOverSummary.distance} m</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#707A70] block">Koin</span>
                <span className="text-sm font-extrabold text-[#D97706]">{gameOverSummary.coins}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#707A70] block">Akurasi Soal</span>
                <span className="text-sm font-extrabold text-[#355B45]">
                  {gameOverSummary.answered > 0 ? `${gameOverSummary.accuracy}%` : '-'}
                </span>
              </div>
            </div>

            {/* Aksi Tombol */}
            <div className="flex gap-3">
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E1E5DC] text-[#28332C] hover:bg-[#F6F5EF] font-bold text-sm transition"
              >
                Menu Utama
              </button>
              <button
                onClick={() => handleStartGame(selectedLevel)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#355B45] hover:bg-[#28332C] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Main Lagi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY PAUSED SCREEN --- */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
          <div className="bg-white border border-[#E1E5DC] rounded-3xl p-6 sm:p-8 max-w-xs w-full text-center shadow-2xl">
            <h3 className="text-xl font-extrabold text-[#28332C] mb-2">Permainan Dijeda</h3>
            <p className="text-xs text-[#707A70] mb-6">Tarik napas sejenak sebelum menembus gerbang aljabar berikutnya.</p>

            <div className="space-y-2">
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-3 rounded-xl bg-[#355B45] text-white font-bold text-sm hover:bg-[#28332C] transition shadow-sm"
              >
                Lanjutkan Berlari
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="w-full py-3 rounded-xl border border-[#E1E5DC] text-[#707A70] hover:text-[#28332C] hover:bg-[#F6F5EF] font-semibold text-sm transition"
              >
                Keluar ke Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
