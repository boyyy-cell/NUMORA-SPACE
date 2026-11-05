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
  Flame
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
const GATE_INTERVAL = 320; // Jarak antar gerbang soal (meter)

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

  // --- STATE TANTANGAN SOAL ---
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionResult, setQuestionResult] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [streakCount, setStreakCount] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState([]);
  const [gameOverSummary, setGameOverSummary] = useState(null);

  // --- REFS INTERNAL ENGINE TIGA DIMENSI ---
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
    gateMesh: null,
    sceneryItems: [],
    currentLane: 1, // 0 = Kiri, 1 = Tengah, 2 = Kanan
    targetLaneX: 0,
    charY: 0,
    jumpVelocity: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: BASE_SPEED,
    lastTime: 0,
    animId: null,
    distanceTravelled: 0,
    nextGateDistance: GATE_INTERVAL,
    activeGateInWorld: null,
    nextSpawnDistance: 25,
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
      e.isSliding = false; // Batalkan slide jika sedang slide
      sounds.playJump();
    }
  }, []);

  const triggerSlide = useCallback(() => {
    const e = engineRef.current;
    if (!e.isSliding) {
      e.isSliding = true;
      e.slideTimer = SLIDE_DURATION;
      // Jika di udara, percepat jatuh
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
        // Tombol 1/2/3/4 atau A/B/C/D saat menjawab soal
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

    if (elapsed > 600) return; // Terlalu lambat untuk swipe

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) moveRight();
        else moveLeft();
      } else {
        // Vertical swipe
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

    // Headband / Topi (Muted Terracotta)
    const bandGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.1, 20);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xD58B68 });
    const headband = new THREE.Mesh(bandGeo, bandMat);
    headband.position.y = 1.82;
    charGroup.add(headband);

    // Tangan Kiri & Kanan (Pivot di pundak)
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

    // Kaki Kiri & Kanan (Pivot di pinggul)
    const legGeo = new THREE.BoxGeometry(0.24, 0.7, 0.24);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x28332C }); // Celana Charcoal

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.22, 0.35, 0);
    leftLeg.castShadow = true;
    charGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.22, 0.35, 0);
    rightLeg.castShadow = true;
    charGroup.add(rightLeg);

    // Bayangan di tanah (Subtle Shadow Blob)
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1A231D, opacity: 0.35, transparent: true });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    scene.add(shadowMesh);

    scene.add(charGroup);

    // 7. Elemen Alam Lingkungan (Pilar & Pohon Geometris di Sisi Lintasan)
    const sceneryItems = [];
    for (let z = -100; z <= 20; z += 14) {
      [-5.5, 5.5].forEach((sideX) => {
        const pillarGeo = new THREE.CylinderGeometry(0.22, 0.3, 3.2, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xA7BCA8, roughness: 0.6 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(sideX, 1.6, z);

        // Lampu kristal atas
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
      gateMesh: null,
      currentLane: 1,
      targetLaneX: 0,
      charY: 0,
      jumpVelocity: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      speed: BASE_SPEED,
      lastTime: performance.now(),
      distanceTravelled: 0,
      nextGateDistance: GATE_INTERVAL,
      nextSpawnDistance: 25,
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
      // Peti kayu/penghalang penuh (Harus pindah jalur)
      const geo = new THREE.BoxGeometry(1.4, 1.3, 1.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xD58B68, // Terracotta
        roughness: 0.7,
      });
      const crate = new THREE.Mesh(geo, mat);
      crate.position.set(laneX, 0.65, zPos);
      crate.castShadow = true;
      crate.userData = { type: 'crate', lane: chosenLane, minY: 0, maxY: 1.4, radius: 0.7 };
      scene.add(crate);
      return crate;
    } else if (chosenType === 'low_hurdle') {
      // Rintangan rendah (Harus lompat)
      const group = new THREE.Group();
      const barGeo = new THREE.BoxGeometry(1.6, 0.22, 0.2);
      const barMat = new THREE.MeshStandardMaterial({ color: 0x9B2C2C, roughness: 0.4 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 0.45, 0);
      group.add(bar);

      // Kaki penyangga
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
      // Rintangan tinggi / palang gantung (Harus merunduk / slide)
      const group = new THREE.Group();
      const topBarGeo = new THREE.BoxGeometry(1.7, 0.7, 0.25);
      const topBarMat = new THREE.MeshStandardMaterial({ color: 0x355B45, roughness: 0.4 });
      const topBar = new THREE.Mesh(topBarGeo, topBarMat);
      topBar.position.set(0, 1.65, 0);
      group.add(topBar);

      // Tiang sisi
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
      color: 0xF59E0B, // Emas berkilau
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

  const spawnAlgebraGate = (scene, zPos) => {
    const group = new THREE.Group();

    // Portal Gerbang Aljabar Megah
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x355B45,
      metalness: 0.3,
      roughness: 0.4,
    });

    // Tiang kiri & kanan
    [-3.2, 3.2].forEach((x) => {
      const colGeo = new THREE.BoxGeometry(0.65, 4.5, 0.65);
      const col = new THREE.Mesh(colGeo, archMat);
      col.position.set(x, 2.25, 0);
      group.add(col);
    });

    // Balok atas
    const topGeo = new THREE.BoxGeometry(7.1, 0.8, 0.8);
    const topBar = new THREE.Mesh(topGeo, archMat);
    topBar.position.set(0, 4.3, 0);
    group.add(topBar);

    // Banner Luminous Tengah
    const bannerGeo = new THREE.PlaneGeometry(4.8, 1.4);
    const bannerMat = new THREE.MeshBasicMaterial({
      color: 0xA7BCA8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 3.2, 0);
    group.add(banner);

    // Tirai energi melintang (Glowing Portal)
    const portalGeo = new THREE.PlaneGeometry(6.0, 3.4);
    const portalMat = new THREE.MeshBasicMaterial({
      color: 0x355B45,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(0, 1.7, 0);
    group.add(portal);

    group.position.set(0, 0, zPos);
    group.userData = { triggered: false };
    scene.add(group);
    return group;
  };

  // --- GAME LOOP UTAMA (ANIMATION FRAME) ---
  useEffect(() => {
    const e = engineRef.current;
    if (!e.renderer) return;

    let animRunning = true;

    const gameLoop = (currentTime) => {
      if (!animRunning) return;
      e.animId = requestAnimationFrame(gameLoop);

      // Hitung delta waktu
      const dt = Math.min((currentTime - (e.lastTime || currentTime)) / 1000, 0.08);
      e.lastTime = currentTime;

      // HANYA UPDATE FISIKA JIKA STATE PLAYING
      if (gameState === 'playing') {
        // 1. Naikkan Jarak & Kecepatan bertahap
        e.distanceTravelled += e.speed * dt;
        const currentMeters = Math.floor(e.distanceTravelled);
        setDistance(currentMeters);
        setScore((prev) => prev + Math.round(e.speed * dt * comboMultiplier * 1.5));

        // Kecepatan bertambah sedikit demi sedikit
        e.speed = Math.min(BASE_SPEED + e.distanceTravelled * 0.008, 26.0);

        // 2. Transisi Jalur (Smooth Horizontal Lerp)
        e.charGroup.position.x += (e.targetLaneX - e.charGroup.position.x) * (14.0 * dt);

        // Kemiringan badan saat berbelok (Banking tilt)
        const tiltX = (e.targetLaneX - e.charGroup.position.x) * -0.25;
        e.charGroup.rotation.z = tiltX;

        // 3. Fisika Lompat (Jump & Gravity)
        if (e.isJumping) {
          e.charY += e.jumpVelocity * dt;
          e.jumpVelocity += GRAVITY * dt;
          if (e.charY <= 0) {
            e.charY = 0;
            e.jumpVelocity = 0;
            e.isJumping = false;
          }
        }

        // 4. Fisika Merunduk (Slide / Crouch)
        if (e.isSliding) {
          e.slideTimer -= dt;
          // Squash karakter ke bawah
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

        // Bayangan di tanah mengikuti posisi karakter
        if (e.shadowMesh) {
          e.shadowMesh.position.x = e.charGroup.position.x;
          // Bayangan mengecil jika melompat tinggi
          const shadowScale = Math.max(0.3, 1.0 - e.charY * 0.28);
          e.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
        }

        // 5. Animasi Ayunan Anggota Tubuh (Running Cycle)
        const runCycle = currentTime * 0.012 * (e.speed / BASE_SPEED);
        if (!e.isJumping && !e.isSliding) {
          if (e.leftArm) e.leftArm.rotation.x = Math.sin(runCycle) * 0.85;
          if (e.rightArm) e.rightArm.rotation.x = -Math.sin(runCycle) * 0.85;
          if (e.leftLeg) e.leftLeg.rotation.x = -Math.sin(runCycle) * 0.95;
          if (e.rightLeg) e.rightLeg.rotation.x = Math.sin(runCycle) * 0.95;
          // Goyangan pinggul halus
          e.charGroup.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.08;
        } else if (e.isJumping) {
          // Pose melompat (tangan ke atas, kaki menekuk)
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
          // Jangan spawn obstacle tepat sebelum Gerbang Aljabar
          const distToGate = e.nextGateDistance - e.distanceTravelled;
          if (distToGate > 35 || distToGate < -20) {
            const spawnZ = -80;
            // Spawn obstacle
            const obs = spawnObstacle(e.scene, spawnZ);
            e.obstacles.push(obs);

            // Spawn rentetan koin di jalur lain
            const coinLane = (obs.userData.lane + 1) % 3;
            for (let c = 0; c < 3; c++) {
              const coin = spawnCoin(e.scene, coinLane, spawnZ + (c * 3.8) - 6);
              e.coinsList.push(coin);
            }
          }
          e.nextSpawnDistance = e.distanceTravelled + 24 + Math.random() * 12;
        }

        // 8. Spawning Gerbang Aljabar (Algebra Gate)
        if (e.distanceTravelled >= e.nextGateDistance && !e.activeGateInWorld) {
          const gate = spawnAlgebraGate(e.scene, -85);
          e.activeGateInWorld = gate;
          e.nextGateDistance = e.distanceTravelled + GATE_INTERVAL;
        }

        // 9. Update & Deteksi Tabrakan Obstacles
        for (let i = e.obstacles.length - 1; i >= 0; i--) {
          const obs = e.obstacles[i];
          obs.position.z += e.speed * dt;

          // Deteksi tabrakan dengan karakter (Z di sekitar karakter ~0)
          if (Math.abs(obs.position.z) < 1.2 && obs.userData.lane === e.currentLane) {
            let hit = false;
            const u = obs.userData;

            if (u.type === 'crate') {
              // Crate selalu menabrak jika di jalur yang sama
              hit = true;
            } else if (u.type === 'low_hurdle') {
              // Menabrak jika karakter tidak melompat cukup tinggi
              if (e.charY < 0.8) {
                hit = true;
              }
            } else if (u.type === 'high_barrier') {
              // Menabrak jika karakter berdiri atau melompat (harus merunduk)
              if (!e.isSliding) {
                hit = true;
              }
            }

            if (hit) {
              sounds.playWrong();
              e.scene.remove(obs);
              e.obstacles.splice(i, 1);

              // Kurangi nyawa
              setLives((prev) => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  triggerGameOver('Karakter tersandung rintangan!');
                }
                return newLives;
              });

              // Reset combo
              setComboMultiplier(1);
              setStreakCount(0);
              continue;
            }
          }

          // Hapus obstacle yang sudah lewat jauh di belakang
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

          // Deteksi ambil koin
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

        // 11. Deteksi Tiba di Gerbang Aljabar
        if (e.activeGateInWorld) {
          const gate = e.activeGateInWorld;
          gate.position.z += e.speed * dt;

          // Saat gerbang mendekat di z = -3.5, picu tantangan soal!
          if (!gate.userData.triggered && gate.position.z >= -4.5) {
            gate.userData.triggered = true;
            triggerAlgebraChallenge();
          }

          if (gate.position.z > 14) {
            e.scene.remove(gate);
            e.activeGateInWorld = null;
          }
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

  // --- PENANGANAN JAWABAN SOAL ---
  const handleOptionClick = (idx) => {
    if (questionResult !== null || !currentQuestion) return;
    const chosen = currentQuestion.options[idx];
    setSelectedAnswer(chosen);

    setSessionAnswered((prev) => prev + 1);

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

      // Tambah skor besar
      const bonusScore = Math.round(150 * newMultiplier);
      setScore((prev) => prev + bonusScore);

      // Resume permainan setelah 1 detik animasi kemenangan
      setTimeout(() => {
        setGameState('playing');
        setCurrentQuestion(null);
        setQuestionResult(null);
      }, 1100);
    } else {
      // JAWABAN SALAH!
      sounds.playWrong();
      setQuestionResult('wrong');
      setComboMultiplier(1);
      setStreakCount(0);

      // Catat kesalahan untuk evaluasi belajar
      setSessionMistakes((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          chosen,
          correct: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
        },
      ]);

      // Kurangi 1 nyawa
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
    e.distanceTravelled = 0;
    e.nextGateDistance = GATE_INTERVAL;
    e.nextSpawnDistance = 25;
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
          {/* Tombol Arah Jalur (Kiri - Kanan) */}
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

          {/* Tombol Aksi (Lompat - Merunduk) */}
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

      {/* --- OVERLAY TANTANGAN GERBANG ALJABAR (MODAL) --- */}
      {gameState === 'question' && currentQuestion && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-[#FFFFFF] border-2 border-[#355B45] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden">
            {/* Header Gerbang & Timer */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#355B45]/10 text-[#355B45] text-xs font-bold uppercase tracking-wider">
                  Gerbang Aljabar • {currentQuestion.level}
                </span>
                <span className="text-xs text-[#707A70] font-medium hidden sm:inline">
                  {currentQuestion.topic}
                </span>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F5EF] border border-[#E1E5DC]">
                <Zap className={`w-4 h-4 ${questionTimer <= 3 ? 'text-red-500 animate-bounce' : 'text-[#D58B68]'}`} />
                <span className={`text-sm font-black ${questionTimer <= 3 ? 'text-red-600' : 'text-[#28332C]'}`}>
                  {questionTimer}s
                </span>
              </div>
            </div>

            {/* Pertanyaan Soal */}
            <div className="text-center py-2 mb-4">
              <p className="text-base sm:text-lg font-bold text-[#28332C] mb-2 leading-snug">
                {currentQuestion.question}
              </p>
              {currentQuestion.katex && (
                <div className="inline-block px-4 py-2 bg-[#F6F5EF] rounded-xl border border-[#E1E5DC] text-lg font-mono text-[#355B45]">
                  <MathView math={currentQuestion.katex} />
                </div>
              )}
            </div>

            {/* Pilihan Ganda (A, B, C, D) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentQuestion.options.map((option, idx) => {
                const label = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let btnStyle = 'bg-[#F6F5EF] border-[#E1E5DC] text-[#28332C] hover:bg-[#A7BCA8]/20 hover:border-[#355B45]';

                if (questionResult !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-100 border-rose-400 text-rose-800 font-bold';
                  } else {
                    btnStyle = 'bg-gray-100 border-gray-200 text-gray-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={questionResult !== null}
                    onClick={() => handleOptionClick(idx)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 text-left font-semibold transition-all ${btnStyle}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white/80 border border-current text-xs font-bold flex items-center justify-center">
                        {label}
                      </span>
                      <span className="text-sm sm:text-base font-mono">{option}</span>
                    </span>
                    {questionResult !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {questionResult !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Umpan Balik Socratic NORA Jika Salah / Waktu Habis */}
            {(questionResult === 'wrong' || questionResult === 'timeout') && (
              <div className="p-4 rounded-2xl bg-[#F6F5EF] border border-[#D58B68]/30 mb-4 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#D58B68] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    N
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#D58B68] uppercase tracking-wider mb-1">
                      {questionResult === 'timeout' ? 'Waktu Habis!' : 'Kurang Tepat, Perhatikan Polanya:'}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#28332C] leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleContinueAfterWrong}
                    className="px-4 py-2 bg-[#355B45] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#28332C] transition shadow-sm"
                  >
                    Lanjutkan Lari →
                  </button>
                </div>
              </div>
            )}

            {/* Status Pesan Jika Benar */}
            {questionResult === 'correct' && (
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm sm:text-base animate-bounce py-2">
                <Sparkles className="w-5 h-5" />
                <span>Luar Biasa! Gerbang Terbuka (+{Math.round(150 * comboMultiplier)} Poin)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- OVERLAY MENU AWAL (START SCREEN) --- */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-[#F6F5EF]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
          <div className="max-w-md w-full text-center">
            {/* Title & Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A7BCA8]/20 border border-[#A7BCA8] text-[#355B45] text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NUMORA SPACE v1.6</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#28332C] tracking-tight mb-2">
              NUMORA <span className="text-[#355B45]">RUN</span>
            </h1>

            <p className="text-sm text-[#707A70] mb-6 leading-relaxed">
              Endless Runner Matematika — Hindari rintangan, kumpulkan koin, dan tembus gerbang persamaan aljabar!
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

