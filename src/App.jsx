import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer, OrbitControls, PerspectiveCamera, SoftShadows, Text } from '@react-three/drei';
import { Bloom, EffectComposer, SSAO, Vignette } from '@react-three/postprocessing';
import {
  Activity,
  BadgeCheck,
  Bluetooth,
  Bot,
  Brain,
  CheckCircle2,
  ChartNoAxesCombined,
  CircleAlert,
  ClipboardCheck,
  Cpu,
  Crosshair,
  Eye,
  FileHeart,
  Gauge,
  Hand,
  Headphones,
  HeartPulse,
  Hospital,
  ImageUp,
  Layers3,
  Mic,
  Pause,
  MonitorCog,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
  Scissors,
  ShieldCheck,
  Siren,
  Stethoscope,
  Syringe,
  Users,
  Video,
  Waves,
  Zap,
} from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import * as THREE from 'three';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './App.css';

const procedures = [
  { id: 'lap-chole', name: 'Laparoscopic Cholecystectomy', specialty: 'General Surgery', difficulty: 78 },
  { id: 'aneurysm', name: 'Aneurysm Clipping', specialty: 'Neurosurgery', difficulty: 93 },
  { id: 'cabg', name: 'Coronary Bypass', specialty: 'Cardiac Surgery', difficulty: 96 },
  { id: 'fracture', name: 'Femur Fracture Fixation', specialty: 'Orthopedics', difficulty: 72 },
  { id: 'airway', name: 'Emergency Airway', specialty: 'Trauma', difficulty: 84 },
];

const instruments = [
  { name: 'Scalpel 10', status: 'sterile', precision: 94 },
  { name: 'Bipolar cautery', status: 'armed', precision: 88 },
  { name: 'Laparoscope', status: 'tracking', precision: 97 },
  { name: 'Needle driver', status: 'ready', precision: 91 },
  { name: 'Clip applier', status: 'loaded', precision: 90 },
  { name: 'Suction irrigator', status: 'primed', precision: 86 },
];

const scenarios = [
  { label: 'Sudden arterial bleed', impact: 'Blood loss rising', severity: 91 },
  { label: 'Oxygen supply fault', impact: 'SpO2 falling', severity: 76 },
  { label: 'Allergic reaction', impact: 'BP crash risk', severity: 83 },
  { label: 'Cardiac arrest', impact: 'CPR protocol', severity: 98 },
];

const analytics = [
  { name: 'Incision', score: 91 },
  { name: 'Hemostasis', score: 84 },
  { name: 'Workflow', score: 88 },
  { name: 'Tooling', score: 93 },
  { name: 'Stress', score: 79 },
];

const vitalsTrace = [
  { t: '00:00', hr: 72, spo2: 99, bp: 118 },
  { t: '04:00', hr: 76, spo2: 98, bp: 116 },
  { t: '08:00', hr: 88, spo2: 97, bp: 109 },
  { t: '12:00', hr: 104, spo2: 94, bp: 96 },
  { t: '16:00', hr: 92, spo2: 96, bp: 104 },
  { t: '20:00', hr: 80, spo2: 98, bp: 114 },
];

const collaborators = [
  { role: 'Lead Surgeon', name: 'Dr. Rao', mode: 'VR headset', color: '#5cc8ff' },
  { role: 'Instructor', name: 'Prof. Lin', mode: 'Desktop mentor', color: '#ffd166' },
  { role: 'Scrub Nurse', name: 'AI Nurse', mode: 'Voice agent', color: '#87e8b0' },
];

const theaterDevices = [
  { name: 'Anesthesia workstation', state: 'MAC 0.9, ETCO2 live', icon: Syringe },
  { name: 'Ventilator', state: 'volume control synced', icon: Waves },
  { name: 'ECG and vitals monitor', state: '12-lead telemetry', icon: Activity },
  { name: 'Defibrillator', state: 'charged standby', icon: Zap },
  { name: 'Insufflator', state: '12 mmHg pneumoperitoneum', icon: Gauge },
  { name: 'Laparoscopic tower', state: '4K scope, white balanced', icon: Video },
  { name: 'Electrosurgical unit', state: 'cut 30 / coag 25', icon: Scissors },
  { name: 'Suction and irrigation', state: 'high flow ready', icon: Radio },
];

const gallbladderCase = [
  {
    title: 'Patient positioning and sterile field',
    action: 'Confirm supine patient, arms secured, monitors attached, antibiotic time-out complete.',
    pass: 'All critical devices checked before first incision.',
  },
  {
    title: 'Optical port insertion',
    action: 'Create umbilical access and maintain 12 mmHg pneumoperitoneum.',
    pass: 'Trocar angle stays within safe entry cone.',
  },
  {
    title: 'Expose Calot triangle',
    action: 'Retract fundus, identify cystic duct, cystic artery, and common bile duct danger zone.',
    pass: 'AI confirms critical view of safety before clipping.',
  },
  {
    title: 'Clip and divide cystic structures',
    action: 'Apply two proximal clips, one distal clip, then divide cystic duct and artery.',
    pass: 'No clip overlap with common bile duct heat map.',
  },
  {
    title: 'Dissect gall bladder from liver bed',
    action: 'Use hook cautery along subserosal plane with suction ready.',
    pass: 'Thermal spread remains below unsafe threshold.',
  },
  {
    title: 'Specimen extraction and closure',
    action: 'Bag specimen, inspect hemostasis, desufflate, and close fascia.',
    pass: 'Final sponge/instrument count and post-op report completed.',
  },
];

const recordingTimeline = [
  { stamp: '00:00', cue: 'OT time-out', metric: 'Sterile field verified' },
  { stamp: '00:18', cue: 'Camera entry', metric: '12 mmHg insufflation' },
  { stamp: '00:39', cue: 'Critical view', metric: 'CBD danger zone highlighted' },
  { stamp: '01:02', cue: 'Clip application', metric: 'Cystic duct secured' },
  { stamp: '01:28', cue: 'Liver-bed dissection', metric: 'Thermal spread controlled' },
  { stamp: '01:54', cue: 'Specimen extraction', metric: 'Hemostasis confirmed' },
];

const assetPipeline = [
  { slot: 'Human patient GLB', target: '/models/anatomy/patient-abdomen.glb', status: 'ready for licensed asset' },
  { slot: 'Layered abdomen', target: '/models/anatomy/skin-fat-fascia-liver-gallbladder.glb', status: 'deformable proxy active' },
  { slot: 'PBR surgical tools', target: '/models/tools/laparoscopy-toolkit.glb', status: 'metal shader active' },
  { slot: 'OT equipment', target: '/models/ot/surgical-theater-equipment.glb', status: 'proxy carts active' },
  { slot: 'Texture maps', target: '/textures/{albedo,normal,roughness,ao}/', status: 'procedural maps active' },
];

const anatomyScenes = [
  {
    id: 'gallbladder',
    name: 'Gall bladder operation field',
    body: 'Supine adult abdomen with liver bed, gall bladder, cystic duct, cystic artery, Calot triangle, stomach edge, duodenum, pancreas plane, and trocar map.',
    operation: 'Laparoscopic cholecystectomy',
    readiness: 'interactive replay active',
  },
  {
    id: 'heart',
    name: 'Open cardiac anatomy field',
    body: 'Thoracic access with sternum/rib landmarks, beating heart, left/right ventricles, atria, aorta, pulmonary vessels, coronary artery path, lungs, and pericardial space.',
    operation: 'Cardiac exposure and bypass planning',
    readiness: 'visual atlas active',
  },
  {
    id: 'abdomen',
    name: 'Full upper abdomen atlas',
    body: 'Layered stomach, lesser curvature, duodenum, pancreas, spleen, colon, liver segments, gall bladder, ducts, and nearby vessels for orientation before surgery.',
    operation: 'Upper GI and hepatobiliary orientation',
    readiness: 'multi-organ map active',
  },
];

const skinMarks = [
  [-0.2, 0.62, -0.38, 0.012],
  [0.18, 0.63, -0.28, 0.009],
  [-0.06, 0.64, 0.02, 0.01],
  [0.28, 0.62, 0.12, 0.008],
  [-0.32, 0.61, 0.18, 0.007],
  [0.08, 0.63, 0.32, 0.011],
];

const floorGrid = Array.from({ length: 13 }, (_, index) => (index - 6) * 0.55);

function createProceduralTexture(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const palette = {
    skin: ['#bf8069', '#d2a08b', '#8f5647'],
    tissue: ['#8b2f2d', '#d4685c', '#481414'],
    drape: ['#178a91', '#25a7ad', '#0d5d63'],
    liver: ['#5a2f19', '#7b3a22', '#2a120d'],
    floor: ['#17272f', '#223640', '#0f1a21'],
  }[kind] ?? ['#888', '#aaa', '#555'];

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 1800; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * (kind === 'drape' ? 1.8 : 3.2) + 0.4;
    ctx.globalAlpha = Math.random() * 0.18 + 0.05;
    ctx.fillStyle = Math.random() > 0.5 ? palette[1] : palette[2];
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (kind === 'drape' || kind === 'floor') {
    ctx.globalAlpha = kind === 'drape' ? 0.16 : 0.22;
    ctx.strokeStyle = palette[2];
    for (let x = 0; x < canvas.width; x += kind === 'drape' ? 14 : 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += kind === 'drape' ? 18 : 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'floor' ? 5 : 2, kind === 'floor' ? 5 : 2);
  texture.anisotropy = 8;
  return texture;
}

function seededUnit(index, salt = 1) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function useProceduralTexture(kind) {
  return useMemo(() => createProceduralTexture(kind), [kind]);
}

const useSimulation = create((set) => ({
  activeProcedure: procedures[0],
  emergency: scenarios[0],
  phase: gallbladderCase[0].title,
  caseStep: 0,
  bloodLoss: 115,
  timer: 18,
  voice: true,
  handTracking: true,
  haptics: true,
  replayActive: false,
  anatomyScene: anatomyScenes[0],
  setAnatomyScene: (anatomyScene) => set({ anatomyScene }),
  setProcedure: (activeProcedure) =>
    set({
      activeProcedure,
      phase: activeProcedure.id === 'lap-chole' ? gallbladderCase[0].title : activeProcedure.id === 'airway' ? 'Primary survey' : 'Exposure',
      caseStep: 0,
      bloodLoss: activeProcedure.difficulty,
      timer: 12,
      replayActive: false,
    }),
  setEmergency: (emergency) => set({ emergency, bloodLoss: Math.round(emergency.severity * 2.4) }),
  advanceCase: () =>
    set((state) => {
      const nextStep = Math.min(state.caseStep + 1, gallbladderCase.length - 1);
      return {
        caseStep: nextStep,
        phase: gallbladderCase[nextStep].title,
        timer: state.timer + 3,
        bloodLoss: Math.max(80, state.bloodLoss - 8),
      };
    }),
  resetCase: () => set({ caseStep: 0, phase: gallbladderCase[0].title, bloodLoss: 115, timer: 18 }),
  playReplay: () => set({ replayActive: true, caseStep: 0, phase: gallbladderCase[0].title, bloodLoss: 115, timer: 18 }),
  pauseReplay: () => set({ replayActive: false }),
  finishReplay: () => set({ replayActive: false }),
  toggleVoice: () => set((state) => ({ voice: !state.voice })),
  toggleTracking: () => set((state) => ({ handTracking: !state.handTracking })),
  toggleHaptics: () => set((state) => ({ haptics: !state.haptics })),
}));

function FirstPersonCamera() {
  const cameraRef = useRef();
  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0.86, -0.26);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.72, 3.15]} fov={58} />;
}

function SurgicalLights() {
  return (
    <group position={[0, 3.2, 0.2]}>
      {[[-1.25, 0, 0], [1.25, 0, 0]].map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]} rotation={[Math.PI / 5, 0, index ? -0.2 : 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.7, 0.9, 0.16, 48]} />
            <meshStandardMaterial color="#dfe9ef" metalness={0.55} roughness={0.23} />
          </mesh>
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.46, 0.54, 0.03, 48]} />
            <meshStandardMaterial emissive="#d7fcff" emissiveIntensity={1.8} color="#dffcff" />
          </mesh>
          <pointLight position={[0, -0.2, 0]} intensity={24} color="#e7fdff" distance={8} />
          <spotLight
            position={[0, -0.08, 0]}
            target-position={[0, -2.2, -0.2]}
            intensity={85}
            angle={0.45}
            penumbra={0.72}
            distance={7}
            color="#f6feff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        </group>
      ))}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[3.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#aab6bd" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

function RoomShell() {
  const floorTexture = useProceduralTexture('floor');

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.026, 0]}>
        <planeGeometry args={[8.2, 5.9]} />
        <meshStandardMaterial map={floorTexture} color="#d4f3f5" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh receiveShadow position={[0, 1.38, -2.85]}>
        <boxGeometry args={[8.2, 2.85, 0.08]} />
        <meshStandardMaterial color="#d4dde1" roughness={0.48} metalness={0.05} />
      </mesh>
      <mesh receiveShadow position={[-4.08, 1.38, 0]}>
        <boxGeometry args={[0.08, 2.85, 5.8]} />
        <meshStandardMaterial color="#c7d2d7" roughness={0.52} metalness={0.04} />
      </mesh>
      <mesh receiveShadow position={[4.08, 1.38, 0]}>
        <boxGeometry args={[0.08, 2.85, 5.8]} />
        <meshStandardMaterial color="#c7d2d7" roughness={0.52} metalness={0.04} />
      </mesh>
      <mesh receiveShadow position={[0, 2.84, 0]}>
        <boxGeometry args={[8.2, 0.08, 5.9]} />
        <meshStandardMaterial color="#edf3f5" roughness={0.44} metalness={0.08} />
      </mesh>
      {floorGrid.map((x) => (
        <mesh key={`floor-x-${x}`} position={[x, -0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.012, 5.9, 0.006]} />
          <meshStandardMaterial color="#2b3b43" roughness={0.8} />
        </mesh>
      ))}
      {floorGrid.map((z) => (
        <mesh key={`floor-z-${z}`} position={[0, -0.011, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <boxGeometry args={[0.012, 8.2, 0.006]} />
          <meshStandardMaterial color="#2b3b43" roughness={0.8} />
        </mesh>
      ))}
      <group position={[-2.65, 1.02, -2.76]}>
        {[0, 0.72, 1.44].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.58, 1.1, 0.12]} />
            <meshStandardMaterial color="#eef3f5" metalness={0.18} roughness={0.32} />
          </mesh>
        ))}
        <Text position={[0.72, 0.72, -0.09]} fontSize={0.055} color="#35535f" anchorX="center">
          sterile storage
        </Text>
      </group>
    </group>
  );
}

function SoftTissueLayer({ caseStep }) {
  const meshRef = useRef();
  const skinTexture = useProceduralTexture('skin');

  useFrame(({ clock }) => {
    const tissueGeometry = meshRef.current?.geometry;
    if (!tissueGeometry) return;

    const positions = tissueGeometry.attributes.position;
    const pressureCenters = [
      [0.02, -0.28, caseStep >= 1 ? 0.09 : 0.02],
      [0.23, -0.1, caseStep >= 2 ? 0.07 : 0.01],
      [-0.22, -0.02, caseStep >= 3 ? 0.055 : 0.01],
    ];

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      let z = Math.sin(clock.elapsedTime * 2.1 + x * 4) * 0.004;

      pressureCenters.forEach(([cx, cy, strength]) => {
        const distance = Math.hypot(x - cx, y - cy);
        z -= Math.exp(-(distance * distance) / 0.018) * strength;
      });

      positions.setZ(index, z);
    }

    positions.needsUpdate = true;
    tissueGeometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={[0, 0.625, 0.08]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1.08, 0.88, 42, 42]} />
      <meshPhysicalMaterial
        map={skinTexture}
        color="#d7a18c"
        roughness={0.44}
        clearcoat={0.22}
        clearcoatRoughness={0.48}
        sheen={0.18}
        transparent
        opacity={0.42}
      />
    </mesh>
  );
}

function BloodAndMoistureVfx({ bloodLoss, caseStep }) {
  const poolScale = Math.min(0.42, bloodLoss / 650);
  const visiblePool = caseStep >= 2 ? 1 : 0.45;

  return (
    <group>
      <mesh position={[0.2, 0.627, 0.02]} rotation={[-Math.PI / 2, 0, 0]} scale={[poolScale * visiblePool, poolScale * 0.55 * visiblePool, 1]}>
        <circleGeometry args={[0.42, 48]} />
        <meshPhysicalMaterial color="#6d0614" roughness={0.08} metalness={0.02} clearcoat={1} clearcoatRoughness={0.05} transparent opacity={0.5} />
      </mesh>
      {[[-0.04, -0.08], [0.08, -0.18], [0.27, -0.02], [0.17, 0.12]].map(([x, z], index) => (
        <mesh key={`${x}-${z}`} position={[x, 0.636 + index * 0.002, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + index * 0.25, 0.62, 1]}>
          <circleGeometry args={[0.035, 24]} />
          <meshPhysicalMaterial color="#8e1020" roughness={0.04} clearcoat={1} clearcoatRoughness={0.04} transparent opacity={caseStep >= 3 ? 0.42 : 0.18} />
        </mesh>
      ))}
    </group>
  );
}

function CauterySmoke({ caseStep }) {
  const particleRefs = useRef([]);
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        x: (seededUnit(index, 2) - 0.5) * 0.16,
        z: (seededUnit(index, 5) - 0.5) * 0.12,
        delay: index * 0.17,
        size: 0.025 + seededUnit(index, 8) * 0.04,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (caseStep < 4) return;
    particleRefs.current.forEach((particle, index) => {
      if (!particle) return;
      const config = particles[index];
      const life = (clock.elapsedTime * 0.42 + config.delay) % 1;
      particle.position.set(0.12 + config.x + life * 0.05, 0.86 + life * 0.46, -0.06 + config.z);
      particle.scale.setScalar(config.size * (1 + life * 2.4));
      particle.material.opacity = (1 - life) * 0.18;
    });
  });

  if (caseStep < 4) return null;

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh
          key={`${particle.x}-${particle.z}`}
          ref={(element) => {
            particleRefs.current[index] = element;
          }}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#d0d0c8" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function ProcedureStepEffects({ caseStep }) {
  return (
    <group>
      {caseStep >= 1 && (
        <>
          <mesh position={[0.03, 0.82, 0.42]} rotation={[1.25, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.18, 18]} />
            <meshStandardMaterial color="#dce6eb" metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0.03, 0.62, 0.46]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.012, 18, 54]} />
            <meshStandardMaterial color="#5cc8ff" emissive="#0c405a" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 0.82, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.6, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#c9fbff" transparent opacity={0.12} roughness={0.1} />
          </mesh>
        </>
      )}
      {caseStep >= 2 && (
        <>
          <mesh position={[-0.15, 0.96, -0.36]} rotation={[0.68, -0.08, -0.3]}>
            <cylinderGeometry args={[0.018, 0.018, 0.58, 18]} />
            <meshStandardMaterial color="#f0f5f7" metalness={0.86} roughness={0.16} />
          </mesh>
          <mesh position={[-0.34, 1.16, -0.52]} rotation={[0.38, -0.2, 0.7]}>
            <coneGeometry args={[0.08, 0.18, 24]} />
            <meshStandardMaterial color="#f0f5f7" metalness={0.7} roughness={0.22} />
          </mesh>
          <mesh position={[0.05, 0.75, -0.02]} rotation={[-Math.PI / 2, 0, 0.24]}>
            <ringGeometry args={[0.18, 0.22, 48]} />
            <meshStandardMaterial color="#ffcf5a" emissive="#3f2d04" emissiveIntensity={0.8} transparent opacity={0.74} side={2} />
          </mesh>
        </>
      )}
      {caseStep >= 3 && (
        <>
          {[
            [0.09, 0.73, -0.01],
            [0.15, 0.71, -0.03],
            [0.24, 0.72, -0.06],
          ].map(([x, y, z]) => (
            <mesh key={`clip-${x}`} position={[x, y, z]} rotation={[0.3, 0.2, 0.55]}>
              <boxGeometry args={[0.1, 0.025, 0.035]} />
              <meshStandardMaterial color="#f4d56a" metalness={0.82} roughness={0.18} />
            </mesh>
          ))}
          <mesh position={[0.2, 0.74, 0.01]}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshStandardMaterial color="#5cc8ff" emissive="#0a577c" emissiveIntensity={1.2} transparent opacity={0.82} />
          </mesh>
        </>
      )}
      {caseStep >= 4 && (
        <>
          {[-0.08, 0.01, 0.1, 0.19].map((x, index) => (
            <mesh key={`cautery-${x}`} position={[x, 0.8 + index * 0.006, -0.17 + index * 0.03]} rotation={[-Math.PI / 2, 0, 0.2]}>
              <ringGeometry args={[0.035, 0.046, 18]} />
              <meshStandardMaterial color="#ff9f43" emissive="#6f2c05" emissiveIntensity={1.2} transparent opacity={0.74} side={2} />
            </mesh>
          ))}
          <pointLight position={[0.12, 0.86, -0.06]} color="#ffae5a" intensity={2.2} distance={1.1} />
          <CauterySmoke caseStep={caseStep} />
        </>
      )}
      {caseStep >= 5 && (
        <>
          <mesh position={[0.23, 0.82, 0.28]} rotation={[0.25, 0.1, -0.25]}>
            <sphereGeometry args={[0.18, 32, 20]} />
            <meshStandardMaterial color="#d8eef1" transparent opacity={0.38} roughness={0.18} />
          </mesh>
          <mesh position={[0.21, 0.81, 0.28]} rotation={[0.2, 0.1, -0.3]}>
            <capsuleGeometry args={[0.06, 0.22, 8, 18]} />
            <meshStandardMaterial color="#4b8f35" roughness={0.52} />
          </mesh>
          {[[-0.32, 0.63, 0.22], [0.38, 0.63, 0.12], [0.03, 0.63, 0.46]].map(([x, y, z]) => (
            <mesh key={`closure-${x}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.16, 0.035, 0.008]} />
              <meshStandardMaterial color="#f3efe5" roughness={0.62} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function PatientModel({ bloodLoss, caseStep }) {
  const breathing = useRef();
  const skinTexture = useProceduralTexture('skin');
  const drapeTexture = useProceduralTexture('drape');
  const tissueTexture = useProceduralTexture('tissue');
  const liverTexture = useProceduralTexture('liver');

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.015;
    if (breathing.current) breathing.current.scale.set(1, 1, pulse);
  });

  const bleedScale = Math.min(0.8, bloodLoss / 430);

  return (
    <group position={[0, 0.78, 0]}>
      <mesh position={[0, 0.68, 0.18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.5, 0.88, 64]} />
        <meshStandardMaterial map={drapeTexture} color="#82e3e9" roughness={0.82} bumpMap={drapeTexture} bumpScale={0.018} side={2} />
      </mesh>
      <mesh position={[0, 0.675, 0.18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.4, 2.9]} />
        <meshStandardMaterial map={drapeTexture} color="#b0fbff" roughness={0.78} bumpMap={drapeTexture} bumpScale={0.014} transparent opacity={0.68} />
      </mesh>
      <mesh ref={breathing} position={[0, 0.12, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.46, 1.55, 12, 32]} />
        <meshPhysicalMaterial map={skinTexture} color="#d7a18c" roughness={0.46} clearcoat={0.16} clearcoatRoughness={0.58} sheen={0.22} />
      </mesh>
      <mesh position={[0, 0.2, -1.12]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial map={skinTexture} color="#d9aa92" roughness={0.48} clearcoat={0.12} clearcoatRoughness={0.54} sheen={0.22} />
      </mesh>
      <mesh position={[-0.11, 0.27, -1.39]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#2c1b17" roughness={0.8} />
      </mesh>
      <mesh position={[0.11, 0.27, -1.39]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#2c1b17" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.18, -1.43]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.075, 0.006, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#7a493b" roughness={0.72} />
      </mesh>
      {skinMarks.map(([x, y, z, size]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size, 14]} />
          <meshStandardMaterial color="#a66f5f" roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[-0.48, 0.1, -0.12]} rotation={[Math.PI / 2, 0, 0.25]} castShadow>
        <capsuleGeometry args={[0.1, 1.2, 8, 18]} />
        <meshPhysicalMaterial map={skinTexture} color="#d7a18c" roughness={0.5} clearcoat={0.12} clearcoatRoughness={0.58} />
      </mesh>
      <mesh position={[0.48, 0.1, -0.12]} rotation={[Math.PI / 2, 0, -0.25]} castShadow>
        <capsuleGeometry args={[0.1, 1.2, 8, 18]} />
        <meshPhysicalMaterial map={skinTexture} color="#d7a18c" roughness={0.5} clearcoat={0.12} clearcoatRoughness={0.58} />
      </mesh>
      <mesh position={[0, 0.62, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.42, 48]} />
        <meshStandardMaterial map={drapeTexture} color="#8bf2f0" roughness={0.7} side={2} />
      </mesh>
      <SoftTissueLayer caseStep={caseStep} />
      <mesh position={[-0.1, 0.68, -0.16]} rotation={[0.12, 0.25, -0.08]} castShadow>
        <sphereGeometry args={[0.23, 32, 24]} />
        <meshPhysicalMaterial map={liverTexture} color="#6e351e" roughness={0.24} clearcoat={0.7} clearcoatRoughness={0.16} />
      </mesh>
      <mesh position={[0.18, 0.71, -0.16]} rotation={[0.1, 0, -0.28]} castShadow>
        <capsuleGeometry args={[0.075, 0.32, 8, 20]} />
        <meshPhysicalMaterial map={tissueTexture} color="#4b8f35" roughness={0.18} clearcoat={0.85} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0.18, 0.71, -0.16]} rotation={[0.1, 0, -0.28]}>
        <capsuleGeometry args={[0.096, 0.36, 8, 20]} />
        <meshStandardMaterial color="#89ff69" emissive="#184c17" emissiveIntensity={0.6} transparent opacity={0.22} roughness={0.24} />
      </mesh>
      <mesh position={[0.1, 0.69, -0.01]} rotation={[1.35, 0.25, 0.35]}>
        <cylinderGeometry args={[0.012, 0.018, 0.34, 12]} />
        <meshStandardMaterial color="#d6c580" roughness={0.42} />
      </mesh>
      <mesh position={[0.18, 0.76, 0.02]} scale={[bleedScale, bleedScale, bleedScale]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhysicalMaterial color="#9f0d1e" roughness={0.05} metalness={0.02} clearcoat={1} clearcoatRoughness={0.04} />
      </mesh>
      <BloodAndMoistureVfx bloodLoss={bloodLoss} caseStep={caseStep} />
      <ProcedureStepEffects caseStep={caseStep} />
      {[[-0.32, 0.61, 0.22], [0.38, 0.61, 0.12], [0.03, 0.61, 0.46]].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.075, 0.012, 16, 42]} />
          <meshStandardMaterial color="#cfd8dd" metalness={0.55} roughness={0.25} />
        </mesh>
      ))}
      {[[-0.32, 0.61, 0.22], [0.38, 0.61, 0.12], [0.03, 0.61, 0.46]].map(([x, y, z]) => (
        <mesh key={`seal-${x}-${z}`} position={[x, y + 0.006, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.058, 24]} />
          <meshStandardMaterial color="#382018" roughness={0.78} transparent opacity={0.42} />
        </mesh>
      ))}
      <Text position={[0.05, 0.98, -0.28]} rotation={[-0.95, 0, 0]} fontSize={0.07} color="#e8fbff" anchorX="center">
        gall bladder target zone
      </Text>
    </group>
  );
}

function Instrument({ position, rotation, color, label }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.3 + position[0]) * 0.012;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.65, 0.045, 0.045]} />
        <meshStandardMaterial color={color} metalness={0.82} roughness={0.18} />
      </mesh>
      <mesh position={[0.38, 0, 0]}>
        <coneGeometry args={[0.05, 0.16, 20]} />
        <meshStandardMaterial color="#f3f6f8" metalness={0.9} roughness={0.18} />
      </mesh>
      <Html position={[0, 0.14, 0]} center className="scene-label">
        {label}
      </Html>
    </group>
  );
}

function MonitorBank({ emergency }) {
  return (
    <group position={[1.75, 1.6, -1.85]} rotation={[0, -0.42, 0]}>
      <mesh>
        <boxGeometry args={[1.25, 0.82, 0.08]} />
        <meshStandardMaterial color="#101923" metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.047]}>
        <planeGeometry args={[1.1, 0.65]} />
        <meshStandardMaterial color="#07141a" emissive="#0a2f30" emissiveIntensity={0.8} />
      </mesh>
      <Text position={[0, 0.18, -0.096]} fontSize={0.09} color="#7effd4" anchorX="center">
        HR 92  SpO2 96
      </Text>
      <Text position={[0, -0.03, -0.096]} fontSize={0.075} color="#ff6b7a" anchorX="center">
        {emergency.impact}
      </Text>
      <Text position={[0, -0.24, -0.096]} fontSize={0.055} color="#9ad8ff" anchorX="center">
        AI alert threshold active
      </Text>
    </group>
  );
}

function LaparoscopicDisplay({ caseStep }) {
  const clipVisible = caseStep >= 3;
  const thermalVisible = caseStep >= 4;
  const bagVisible = caseStep >= 5;

  return (
    <group position={[-1.72, 1.72, -1.92]} rotation={[0, 0.42, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.12, 0.78, 0.08]} />
        <meshStandardMaterial color="#111a21" metalness={0.34} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, -0.048]}>
        <planeGeometry args={[0.98, 0.62]} />
        <meshStandardMaterial color="#180f0a" emissive="#241006" emissiveIntensity={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[-0.18, 0.03, -0.086]} rotation={[0, 0, -0.25]}>
        <sphereGeometry args={[0.23, 32, 18]} />
        <meshStandardMaterial color="#7b3c1d" roughness={0.55} />
      </mesh>
      <mesh position={[0.14, -0.02, -0.09]} rotation={[0, 0, -0.42]}>
        <capsuleGeometry args={[0.07, 0.32, 8, 18]} />
        <meshStandardMaterial color="#4da23d" emissive="#12390d" emissiveIntensity={0.4} roughness={0.38} />
      </mesh>
      <mesh position={[0.17, -0.22, -0.095]} rotation={[1.2, 0, 0.2]}>
        <cylinderGeometry args={[0.01, 0.014, 0.42, 12]} />
        <meshStandardMaterial color="#e8d384" roughness={0.36} />
      </mesh>
      <mesh position={[0.31, 0.23, -0.1]}>
        <ringGeometry args={[0.04, 0.055, 24]} />
        <meshStandardMaterial color="#5cc8ff" emissive="#0d4661" emissiveIntensity={1.1} />
      </mesh>
      {clipVisible && (
        <>
          <mesh position={[0.06, -0.13, -0.102]} rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.1, 0.025, 0.03]} />
            <meshStandardMaterial color="#f4d56a" metalness={0.7} roughness={0.18} />
          </mesh>
          <mesh position={[0.18, -0.15, -0.102]} rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.1, 0.025, 0.03]} />
            <meshStandardMaterial color="#f4d56a" metalness={0.7} roughness={0.18} />
          </mesh>
        </>
      )}
      {thermalVisible && (
        <mesh position={[-0.05, 0.2, -0.105]} rotation={[0, 0, 0.1]}>
          <ringGeometry args={[0.05, 0.065, 22]} />
          <meshStandardMaterial color="#ff9f43" emissive="#6f2c05" emissiveIntensity={1.3} transparent opacity={0.76} />
        </mesh>
      )}
      {bagVisible && (
        <mesh position={[0.28, -0.02, -0.106]}>
          <circleGeometry args={[0.13, 32]} />
          <meshStandardMaterial color="#d8eef1" transparent opacity={0.3} />
        </mesh>
      )}
      <Text position={[0, -0.43, -0.1]} fontSize={0.045} color="#c8f7ff" anchorX="center">
        laparoscopic camera feed
      </Text>
    </group>
  );
}

function IvStand() {
  return (
    <group position={[3.12, 0.18, -0.92]} rotation={[0, -0.22, 0]}>
      <mesh castShadow position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.55, 18]} />
        <meshStandardMaterial color="#d6e0e5" metalness={0.82} roughness={0.18} />
      </mesh>
      <mesh position={[0, 1.58, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.52, 18]} />
        <meshStandardMaterial color="#d6e0e5" metalness={0.82} roughness={0.18} />
      </mesh>
      <mesh position={[-0.18, 1.28, 0]} castShadow>
        <boxGeometry args={[0.18, 0.34, 0.055]} />
        <meshPhysicalMaterial color="#d9fbff" transmission={0.28} transparent opacity={0.54} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.025, 28]} />
        <meshStandardMaterial color="#aebbc1" metalness={0.76} roughness={0.22} />
      </mesh>
      <Text position={[0, 1.78, 0]} fontSize={0.045} color="#e8fbff" anchorX="center">
        IV fluids
      </Text>
    </group>
  );
}

function SurgeonHands({ caseStep }) {
  const left = useRef();
  const right = useRef();
  useFrame(({ clock }) => {
    const movement = Math.sin(clock.elapsedTime * 1.8) * 0.025;
    if (left.current) left.current.rotation.z = 0.22 + movement;
    if (right.current) right.current.rotation.z = -0.2 - movement;
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={left} position={[-0.72, 0.55, 1.15]} rotation={[0.1, 0.18 + caseStep * 0.02, 0.24]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.52, 8, 18]} />
          <meshStandardMaterial color="#b97b64" roughness={0.62} />
        </mesh>
        <mesh position={[0.06, -0.11, 0.1]} rotation={[0.45, 0.15, -0.18]}>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#0a6b72" roughness={0.5} />
        </mesh>
        <Instrument position={[0.24, 0.02, -0.22]} rotation={[0, -0.4, -0.25]} color="#dce5ea" label={caseStep >= 5 ? 'specimen bag' : 'left grasper'} />
      </group>
      <group ref={right} position={[0.72, 0.54, 1.16]} rotation={[0.08, -0.16 - caseStep * 0.018, -0.2]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.52, 8, 18]} />
          <meshStandardMaterial color="#b97b64" roughness={0.62} />
        </mesh>
        <mesh position={[-0.06, -0.11, 0.1]} rotation={[0.45, -0.15, 0.18]}>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#0a6b72" roughness={0.5} />
        </mesh>
        <Instrument
          position={[-0.24, 0.02, -0.22]}
          rotation={[0, 0.36, 0.22]}
          color={caseStep >= 4 ? '#ff9f43' : '#f1d36c'}
          label={caseStep >= 4 ? 'hook cautery' : 'clip applier'}
        />
      </group>
      <mesh position={[0, 0.42, 0.35]} rotation={[1.23, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.72, 18]} />
        <meshStandardMaterial color="#e7eef2" metalness={0.9} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.22, 0.98]}>
        <torusGeometry args={[0.16, 0.015, 16, 48]} />
        <meshStandardMaterial color="#0b151b" metalness={0.4} roughness={0.38} />
      </mesh>
      <Html position={[0, 0.92, 1.05]} center className="scene-label pov-label">
        first-person surgeon view
      </Html>
    </group>
  );
}

function DeviceCart({ position, rotation, label, color }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.58, 0.8, 0.44]} />
        <meshStandardMaterial color="#b8c5cc" metalness={0.22} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.08, -0.23]}>
        <planeGeometry args={[0.44, 0.38]} />
        <meshStandardMaterial color="#07141a" emissive={color} emissiveIntensity={0.52} />
      </mesh>
      <Text position={[0, 0.08, -0.47]} fontSize={0.045} color="#dff8ff" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function HeartAnatomyAtlas({ visible }) {
  if (!visible) return null;

  return (
    <group position={[-0.08, 0.82, -0.1]} rotation={[-0.06, 0, 0]}>
      <mesh position={[0, 0.05, -0.07]} scale={[0.34, 0.42, 0.26]} castShadow>
        <sphereGeometry args={[1, 42, 32]} />
        <meshPhysicalMaterial color="#8f1628" roughness={0.18} clearcoat={0.85} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[-0.13, 0.15, -0.04]} scale={[0.19, 0.26, 0.18]} castShadow>
        <sphereGeometry args={[1, 36, 28]} />
        <meshPhysicalMaterial color="#b71f34" roughness={0.16} clearcoat={0.88} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0.14, 0.12, -0.02]} scale={[0.2, 0.28, 0.17]} castShadow>
        <sphereGeometry args={[1, 36, 28]} />
        <meshPhysicalMaterial color="#7d1022" roughness={0.2} clearcoat={0.82} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0.04, 0.42, -0.04]} rotation={[0.45, 0, 0.1]}>
        <torusGeometry args={[0.19, 0.035, 18, 72, Math.PI * 1.35]} />
        <meshStandardMaterial color="#d3484a" metalness={0.05} roughness={0.2} />
      </mesh>
      <mesh position={[-0.22, 0.2, -0.03]} rotation={[0.3, 0.2, -0.6]}>
        <cylinderGeometry args={[0.025, 0.038, 0.5, 18]} />
        <meshStandardMaterial color="#2b77c4" roughness={0.18} />
      </mesh>
      <mesh position={[0.22, 0.24, -0.02]} rotation={[0.25, -0.2, 0.5]}>
        <cylinderGeometry args={[0.03, 0.045, 0.58, 18]} />
        <meshStandardMaterial color="#d64242" roughness={0.16} />
      </mesh>
      {[[-0.28, -0.02, -0.08], [0.28, -0.02, -0.08]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} scale={[0.26, 0.42, 0.12]} rotation={[0.18, 0, index ? -0.25 : 0.25]} castShadow>
          <sphereGeometry args={[1, 28, 18]} />
          <meshPhysicalMaterial color="#b55564" transparent opacity={0.38} roughness={0.25} clearcoat={0.5} />
        </mesh>
      ))}
      {[-0.34, -0.17, 0, 0.17, 0.34].map((x) => (
        <mesh key={x} position={[x, 0.06, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.012, 12, 48, Math.PI]} />
          <meshStandardMaterial color="#f1eadf" roughness={0.42} />
        </mesh>
      ))}
      <Text position={[0, 0.72, -0.14]} fontSize={0.065} color="#f6fbff" anchorX="center">
        beating heart atlas
      </Text>
    </group>
  );
}

function AbdomenOrganAtlas({ visible }) {
  if (!visible) return null;

  return (
    <group position={[0, 0.76, 0.02]}>
      <mesh position={[-0.16, 0.04, -0.15]} rotation={[0.18, 0.15, -0.24]} scale={[0.42, 0.23, 0.26]} castShadow>
        <sphereGeometry args={[1, 42, 28]} />
        <meshPhysicalMaterial color="#8a3c2f" roughness={0.18} clearcoat={0.75} clearcoatRoughness={0.14} />
      </mesh>
      <mesh position={[0.08, 0.05, -0.17]} rotation={[0.08, 0, -0.18]} scale={[0.22, 0.11, 0.36]} castShadow>
        <capsuleGeometry args={[1, 1.2, 12, 28]} />
        <meshPhysicalMaterial color="#a75a44" roughness={0.22} clearcoat={0.65} />
      </mesh>
      <mesh position={[0.3, 0.07, -0.08]} rotation={[0.18, 0.1, 0.45]} scale={[0.12, 0.28, 0.1]} castShadow>
        <capsuleGeometry args={[1, 1.2, 12, 28]} />
        <meshPhysicalMaterial color="#ca8c5b" roughness={0.34} clearcoat={0.4} />
      </mesh>
      <mesh position={[0.02, 0.0, 0.08]} rotation={[0.05, 0.2, 1.43]} scale={[0.1, 0.48, 0.08]} castShadow>
        <capsuleGeometry args={[1, 1.2, 12, 24]} />
        <meshPhysicalMaterial color="#d9b374" roughness={0.36} clearcoat={0.32} />
      </mesh>
      <mesh position={[0.34, 0.11, -0.28]} scale={[0.16, 0.18, 0.11]} castShadow>
        <sphereGeometry args={[1, 32, 22]} />
        <meshPhysicalMaterial color="#5d1d2f" roughness={0.2} clearcoat={0.7} />
      </mesh>
      <mesh position={[0.01, 0.12, -0.26]} rotation={[0.12, 0.25, -0.08]} scale={[0.32, 0.2, 0.21]} castShadow>
        <sphereGeometry args={[1, 42, 28]} />
        <meshPhysicalMaterial color="#5a2f19" roughness={0.22} clearcoat={0.72} clearcoatRoughness={0.14} />
      </mesh>
      <mesh position={[0.22, 0.16, -0.22]} rotation={[0.08, 0, -0.28]} scale={[0.08, 0.22, 0.08]} castShadow>
        <capsuleGeometry args={[1, 1.1, 10, 22]} />
        <meshPhysicalMaterial color="#4b8f35" roughness={0.16} clearcoat={0.88} clearcoatRoughness={0.08} />
      </mesh>
      <Text position={[0.02, 0.58, -0.25]} fontSize={0.065} color="#f6fbff" anchorX="center">
        stomach / liver / pancreas / spleen
      </Text>
    </group>
  );
}

function WebXRLaunchButton() {
  const { gl } = useThree();
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('Quest Browser HTTPS required');

  useEffect(() => {
    let mounted = true;
    navigator.xr?.isSessionSupported?.('immersive-vr')
      .then((isSupported) => {
        if (!mounted) return;
        setSupported(isSupported);
        setMessage(isSupported ? 'Enter Meta Quest VR' : 'Open on Quest Browser');
      })
      .catch(() => {
        if (mounted) setMessage('WebXR unavailable here');
      });

    return () => {
      mounted = false;
    };
  }, [gl]);

  const enterVr = async () => {
    if (!navigator.xr || !supported) return;

    const session = await navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
    });
    setActive(true);
    session.addEventListener('end', () => setActive(false), { once: true });
    await gl.xr.setSession(session);
  };

  return (
    <Html fullscreen className="webxr-overlay">
      <button type="button" className={active ? 'webxr-button active' : 'webxr-button'} onClick={enterVr} disabled={!supported}>
        <Headphones aria-hidden="true" />
        <span>{active ? 'Meta Quest VR active' : message}</span>
      </button>
    </Html>
  );
}

function OperatingTheaterScene() {
  const { anatomyScene, bloodLoss, caseStep, emergency, handTracking, haptics } = useSimulation();
  const isHeartScene = anatomyScene.id === 'heart';
  const isAbdomenScene = anatomyScene.id === 'abdomen';

  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.xr.enabled = true;
      }}
      data-testid="ot-canvas"
    >
      <Suspense fallback={null}>
        <FirstPersonCamera />
        <color attach="background" args={['#071016']} />
        <Environment resolution={128}>
          <Lightformer intensity={3.6} position={[0, 3.4, -2.4]} scale={[5, 1.2, 1]} />
          <Lightformer intensity={1.6} position={[-3, 1.8, 0.6]} scale={[1.2, 2.5, 1]} color="#dff8ff" />
          <Lightformer intensity={1.3} position={[3, 1.5, 1.8]} scale={[1.2, 2, 1]} color="#baf6ff" />
        </Environment>
        <SoftShadows size={18} samples={14} focus={0.42} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={2.8} castShadow />
        <RoomShell />
        <SurgicalLights />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[8, 7]} />
          <meshStandardMaterial color="#18242b" roughness={0.65} transparent opacity={0.36} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[1.72, 0.24, 3.25]} />
          <meshStandardMaterial color="#d8e3e7" metalness={0.28} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.64, 0]} castShadow>
          <boxGeometry args={[1.82, 0.08, 3.42]} />
          <meshStandardMaterial color="#2f8f96" roughness={0.42} />
        </mesh>
        <PatientModel bloodLoss={bloodLoss} caseStep={caseStep} />
        <HeartAnatomyAtlas visible={isHeartScene} />
        <AbdomenOrganAtlas visible={isAbdomenScene} />
        <SurgeonHands caseStep={caseStep} />

        <group position={[-1.95, 0.74, 0.45]}>
          <mesh>
            <boxGeometry args={[1.35, 0.08, 0.72]} />
            <meshStandardMaterial color="#cdd8dd" metalness={0.8} roughness={0.18} />
          </mesh>
          <Instrument position={[-0.34, 0.12, 0.08]} rotation={[0, 0.2, 0.1]} color="#cfd8df" label="scalpel" />
          <Instrument position={[0.28, 0.12, -0.12]} rotation={[0, -0.3, -0.05]} color="#bccbd2" label="cautery" />
        </group>

        <MonitorBank emergency={emergency} />
        <LaparoscopicDisplay caseStep={caseStep} />
        <IvStand />
        <DeviceCart position={[2.65, 1.05, 0.45]} rotation={[0, -0.75, 0]} label="insufflator 12 mmHg" color="#0f5364" />
        <DeviceCart position={[-2.65, 1.05, -0.35]} rotation={[0, 0.75, 0]} label="electrosurgical unit" color="#563719" />
        <DeviceCart position={[2.6, 0.9, 1.28]} rotation={[0, -0.9, 0]} label="defibrillator standby" color="#4a1820" />

        <group position={[-2.35, 1.35, 1.25]} rotation={[0, 0.45, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 1.1, 0.52]} />
            <meshStandardMaterial color="#b7c6cc" metalness={0.28} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.02, -0.28]}>
            <planeGeometry args={[0.68, 0.74]} />
            <meshStandardMaterial color="#0b1820" emissive="#113552" emissiveIntensity={0.5} />
          </mesh>
          <Text position={[0, 0.11, -0.57]} fontSize={0.06} color="#c5f4ff" anchorX="center">
            anesthesia
          </Text>
          <Text position={[0, -0.08, -0.57]} fontSize={0.052} color="#80ffaa" anchorX="center">
            ventilator synced
          </Text>
        </group>

        <group position={[0.95, 1.22, 1.75]}>
          <mesh>
            <torusGeometry args={[0.38, 0.018, 12, 72]} />
            <meshStandardMaterial color={handTracking ? '#5cc8ff' : '#5c6670'} emissive={handTracking ? '#123a50' : '#000'} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.32, -0.18, 0]}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshStandardMaterial color={haptics ? '#ffd166' : '#5c6670'} emissive={haptics ? '#47350d' : '#000'} emissiveIntensity={1.1} />
          </mesh>
          <Html position={[0, 0.48, 0]} center className="scene-label">
            hand tracking volume
          </Html>
        </group>

        <WebXRLaunchButton />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
        <EffectComposer multisampling={0}>
          <SSAO samples={16} radius={0.12} intensity={18} luminanceInfluence={0.42} />
          <Bloom intensity={0.22} luminanceThreshold={0.72} luminanceSmoothing={0.28} mipmapBlur />
          <Vignette offset={0.18} darkness={0.42} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

function StatusPill({ icon: Icon, label, active }) {
  return (
    <button className={active ? 'pill active' : 'pill'} type="button">
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function VitalsPanel() {
  const { bloodLoss, timer, phase } = useSimulation();
  const risk = bloodLoss > 200 ? 'critical' : bloodLoss > 140 ? 'watch' : 'stable';

  return (
    <section className="panel vitals-panel" aria-label="Live patient vitals">
      <div className="panel-heading">
        <HeartPulse aria-hidden="true" />
        <h2>Patient Twin</h2>
        <span className={`risk-dot ${risk}`}>{risk}</span>
      </div>
      <div className="patient-grid">
        <Metric label="Heart rate" value="92" unit="bpm" />
        <Metric label="SpO2" value="96" unit="%" />
        <Metric label="BP" value="104/68" unit="mmHg" />
        <Metric label="Blood loss" value={bloodLoss} unit="ml" />
      </div>
      <div className="trace">
        <ResponsiveContainer width="100%" height={126}>
          <AreaChart data={vitalsTrace} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="hrGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#ff6b7a" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ff6b7a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#26333b" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: '#73828d', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#73828d', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0c171d', border: '1px solid #26333b', color: '#dce8ef' }} />
            <Area dataKey="hr" stroke="#ff6b7a" fill="url(#hrGradient)" strokeWidth={2} />
            <Area dataKey="spo2" stroke="#5cc8ff" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="phase-row">
        <span>{phase}</span>
        <strong>{timer}:42</strong>
      </div>
    </section>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{unit}</em>
    </div>
  );
}

function ProcedureLibrary() {
  const { activeProcedure, setProcedure } = useSimulation();

  return (
    <section className="panel" aria-label="Surgery library">
      <div className="panel-heading">
        <Layers3 aria-hidden="true" />
        <h2>Surgery Library</h2>
      </div>
      <div className="procedure-list">
        {procedures.map((procedure) => (
          <button
            className={procedure.id === activeProcedure.id ? 'procedure active' : 'procedure'}
            key={procedure.id}
            type="button"
            onClick={() => setProcedure(procedure)}
          >
            <span>
              <strong>{procedure.name}</strong>
              <em>{procedure.specialty}</em>
            </span>
            <b>{procedure.difficulty}</b>
          </button>
        ))}
      </div>
    </section>
  );
}

function AnatomyScenePanel() {
  const { anatomyScene, setAnatomyScene } = useSimulation();

  return (
    <section className="panel anatomy-panel" aria-label="Anatomy scene atlas">
      <div className="panel-heading">
        <HeartPulse aria-hidden="true" />
        <h2>Anatomy Visual Scenes</h2>
      </div>
      <div className="anatomy-list">
        {anatomyScenes.map((scene) => (
          <button
            className={scene.id === anatomyScene.id ? 'anatomy-card active' : 'anatomy-card'}
            key={scene.id}
            type="button"
            onClick={() => setAnatomyScene(scene)}
          >
            <strong>{scene.name}</strong>
            <span>{scene.body}</span>
            <em>{scene.operation}</em>
            <small>{scene.readiness}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function AiMentor() {
  const { activeProcedure, emergency, voice, toggleVoice } = useSimulation();

  const guidance = useMemo(
    () => [
      `Map critical anatomy before advancing in ${activeProcedure.name}.`,
      `Warning: ${emergency.impact}. Confirm suction and hemostasis plan.`,
      'Instrument angle drift is 4 degrees lateral. Re-center wrist axis.',
      'Sterile field intact. Nurse agent has loaded the next tray sequence.',
    ],
    [activeProcedure, emergency],
  );

  return (
    <section className="panel mentor-panel" aria-label="AI training assistant">
      <div className="panel-heading">
        <Bot aria-hidden="true" />
        <h2>AI Mentor</h2>
        <button className="icon-action" type="button" onClick={toggleVoice} aria-label="Toggle voice mentor">
          <Mic aria-hidden="true" />
        </button>
      </div>
      <div className="mentor-state">
        <Brain aria-hidden="true" />
        <span>{voice ? 'Voice narration active' : 'Text guidance only'}</span>
      </div>
      <ol className="guidance-list">
        {guidance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <button className="primary-action" type="button">
        <FileHeart aria-hidden="true" />
        Generate post-op report
      </button>
    </section>
  );
}

function EmergencyPanel() {
  const { emergency, setEmergency } = useSimulation();

  return (
    <section className="panel emergency-panel" aria-label="Emergency scenarios">
      <div className="panel-heading">
        <Siren aria-hidden="true" />
        <h2>Complications</h2>
      </div>
      {scenarios.map((scenario) => (
        <button
          className={scenario.label === emergency.label ? 'scenario active' : 'scenario'}
          key={scenario.label}
          type="button"
          onClick={() => setEmergency(scenario)}
        >
          <span>
            <strong>{scenario.label}</strong>
            <em>{scenario.impact}</em>
          </span>
          <b>{scenario.severity}</b>
        </button>
      ))}
    </section>
  );
}

function CapabilityGrid() {
  const { handTracking, haptics, voice, toggleTracking, toggleHaptics, toggleVoice } = useSimulation();
  const [webXr, setWebXr] = useState(false);

  useEffect(() => {
    let mounted = true;
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported?.('immersive-vr').then((supported) => mounted && setWebXr(supported));
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel" aria-label="VR and device support">
      <div className="panel-heading">
        <Headphones aria-hidden="true" />
        <h2>Immersive Stack</h2>
      </div>
      <div className="capability-grid">
        <button type="button" className={webXr ? 'capability active' : 'capability'}>
          <Eye aria-hidden="true" />
          <span>WebXR</span>
          <em>{webXr ? 'headset ready' : 'desktop preview'}</em>
        </button>
        <button type="button" className={handTracking ? 'capability active' : 'capability'} onClick={toggleTracking}>
          <Hand aria-hidden="true" />
          <span>Hand tracking</span>
          <em>gesture capture</em>
        </button>
        <button type="button" className={haptics ? 'capability active' : 'capability'} onClick={toggleHaptics}>
          <Bluetooth aria-hidden="true" />
          <span>Haptics</span>
          <em>device bridge</em>
        </button>
        <button type="button" className={voice ? 'capability active' : 'capability'} onClick={toggleVoice}>
          <Radio aria-hidden="true" />
          <span>Voice agent</span>
          <em>sterile control</em>
        </button>
      </div>
    </section>
  );
}

function CollaborationPanel() {
  return (
    <section className="panel" aria-label="Multiplayer collaboration">
      <div className="panel-heading">
        <Users aria-hidden="true" />
        <h2>Multiplayer OT</h2>
      </div>
      <div className="collab-list">
        {collaborators.map((person) => (
          <div className="collaborator" key={person.role}>
            <span style={{ background: person.color }} />
            <strong>{person.name}</strong>
            <em>{person.role}</em>
            <small>{person.mode}</small>
          </div>
        ))}
      </div>
      <div className="annotation-row">
        <Video aria-hidden="true" />
        <span>Replay buffer: 20:42 with instructor annotations</span>
      </div>
    </section>
  );
}

function AnalyticsPanel() {
  return (
    <section className="panel analytics-panel" aria-label="Performance analytics">
      <div className="panel-heading">
        <ChartNoAxesCombined aria-hidden="true" />
        <h2>Competency Analytics</h2>
        <span className="score">88</span>
      </div>
      <ResponsiveContainer width="100%" height={152}>
        <BarChart data={analytics} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid stroke="#26333b" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#73828d', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#73828d', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#0c171d', border: '1px solid #26333b', color: '#dce8ef' }} />
          <Bar dataKey="score" fill="#5cc8ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="assessment-row">
        <ClipboardCheck aria-hidden="true" />
        <span>Certification report ready after 3 validated runs</span>
      </div>
    </section>
  );
}

function PlanningPanel() {
  return (
    <section className="panel planning-panel" aria-label="Medical imaging and digital twin planning">
      <div className="panel-heading">
        <ScanLine aria-hidden="true" />
        <h2>Imaging Planner</h2>
      </div>
      <div className="scan-preview">
        <span />
        <span />
        <span />
        <strong>CT/MRI DICOM volume</strong>
        <em>3D twin reconstruction queued</em>
      </div>
      <div className="feature-row">
        <BadgeCheck aria-hidden="true" />
        <span>Patient anatomy variation generated from scan metadata</span>
      </div>
      <div className="feature-row">
        <MonitorCog aria-hidden="true" />
        <span>Robotic and laparoscopic camera routes simulated</span>
      </div>
    </section>
  );
}

function AssetPipelinePanel() {
  return (
    <section className="panel asset-panel" aria-label="Photoreal asset pipeline">
      <div className="panel-heading">
        <ImageUp aria-hidden="true" />
        <h2>Photoreal Asset Pipeline</h2>
      </div>
      <div className="asset-list">
        {assetPipeline.map((asset) => (
          <div className="asset-row" key={asset.slot}>
            <strong>{asset.slot}</strong>
            <span>{asset.target}</span>
            <em>{asset.status}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function InstrumentPanel() {
  return (
    <section className="panel" aria-label="Instrument interaction">
      <div className="panel-heading">
        <Stethoscope aria-hidden="true" />
        <h2>Instrument Tray</h2>
      </div>
      <div className="instrument-list">
        {instruments.map((instrument) => (
          <div className="instrument-row" key={instrument.name}>
            <span>
              <strong>{instrument.name}</strong>
              <em>{instrument.status}</em>
            </span>
            <b>{instrument.precision}%</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function DevicePanel() {
  return (
    <section className="panel device-panel" aria-label="Operation theater devices">
      <div className="panel-heading">
        <MonitorCog aria-hidden="true" />
        <h2>OT Device Console</h2>
      </div>
      <div className="device-list">
        {theaterDevices.map(({ name, state, icon: Icon }) => (
          <div className="device-row" key={name}>
            <Icon aria-hidden="true" />
            <span>
              <strong>{name}</strong>
              <em>{state}</em>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GallbladderTestCase() {
  const { caseStep, advanceCase, finishReplay, pauseReplay, playReplay, replayActive, resetCase } = useSimulation();
  const current = gallbladderCase[caseStep];
  const progress = Math.round(((caseStep + 1) / gallbladderCase.length) * 100);

  useEffect(() => {
    if (!replayActive) return undefined;

    const replayTimer = window.setTimeout(() => {
      if (caseStep >= gallbladderCase.length - 1) {
        finishReplay();
        return;
      }
      advanceCase();
    }, 2600);

    return () => window.clearTimeout(replayTimer);
  }, [advanceCase, caseStep, finishReplay, replayActive]);

  return (
    <section className="panel test-case-panel" aria-label="Gall bladder removal first-person test case">
      <div className="panel-heading">
        <Crosshair aria-hidden="true" />
        <h2>Test Case: Gall Bladder Removal</h2>
        <span className="score">{progress}%</span>
      </div>
      <div className="case-brief">
        <strong>First-person laparoscopic cholecystectomy</strong>
        <span>Patient: 42-year-old, acute cholecystitis risk model, stable under general anesthesia.</span>
      </div>
      <div className="case-current">
        <small>Current objective</small>
        <h3>{current.title}</h3>
        <p>{current.action}</p>
        <div className="pass-criteria">
          <CheckCircle2 aria-hidden="true" />
          <span>{current.pass}</span>
        </div>
      </div>
      <ol className="case-steps">
        {gallbladderCase.map((step, index) => (
          <li className={index < caseStep ? 'done' : index === caseStep ? 'active' : ''} key={step.title}>
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
          </li>
        ))}
      </ol>
      <div className="case-actions">
        <button type="button" className="primary-action" onClick={replayActive ? pauseReplay : playReplay}>
          {replayActive ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {replayActive ? 'Pause replay' : 'Play full replay'}
        </button>
        <button type="button" className="secondary-action" onClick={advanceCase}>
          Next
        </button>
        <button type="button" className="secondary-action" onClick={resetCase} aria-label="Reset gall bladder replay">
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div className="recording-strip" aria-label="Laparoscopy operation recording timeline">
        <div>
          <Video aria-hidden="true" />
          <strong>Operation recording</strong>
        </div>
        {recordingTimeline.map((item, index) => (
          <span className={index <= caseStep ? 'active' : ''} key={item.stamp}>
            <b>{item.stamp}</b>
            <em>{item.cue}</em>
            <small>{item.metric}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

function RecordingHud() {
  const { caseStep, replayActive } = useSimulation();
  const current = gallbladderCase[caseStep];
  const timeline = recordingTimeline[caseStep];

  return (
    <div className={replayActive ? 'recording-hud active' : 'recording-hud'} aria-label="Active recording overlay">
      <div>
        <span className="recording-dot" />
        <strong>{replayActive ? 'Recording playback' : 'Recording paused'}</strong>
      </div>
      <p>{current.title}</p>
      <small>
        {timeline.stamp} / {recordingTimeline[recordingTimeline.length - 1].stamp} - {timeline.metric}
      </small>
    </div>
  );
}

function App() {
  const { activeProcedure } = useSimulation();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Hospital aria-hidden="true" />
          <div>
            <strong>SurgiSim AI Theater</strong>
            <span>VR-compatible surgical simulation platform</span>
          </div>
        </div>
        <nav className="mode-strip" aria-label="Simulation modes">
          <StatusPill icon={MonitorCog} label="Desktop" active />
          <StatusPill icon={Headphones} label="VR" active />
          <StatusPill icon={Users} label="Multiplayer" active />
          <StatusPill icon={Cpu} label="AI Mentor" active />
        </nav>
      </header>

      <section className="command-band" aria-label="Simulation command summary">
        <div>
          <span>Active procedure</span>
          <strong>{activeProcedure.name}</strong>
        </div>
        <div>
          <span>Difficulty</span>
          <strong>{activeProcedure.difficulty}/100</strong>
        </div>
        <div>
          <span>Environment</span>
          <strong>Hybrid OT 3</strong>
        </div>
        <button className="launch-button" type="button">
          <Play aria-hidden="true" />
          Start validated run
        </button>
      </section>

      <div className="workspace">
        <aside className="left-rail">
          <GallbladderTestCase />
          <AnatomyScenePanel />
          <ProcedureLibrary />
          <CapabilityGrid />
          <InstrumentPanel />
          <DevicePanel />
        </aside>

        <section className="simulator-stage" aria-label="Immersive operating theater">
          <RecordingHud />
          <div className="stage-toolbar">
            <div>
              <Gauge aria-hidden="true" />
              <span>Real-time tissue, vitals, hand pose, and workflow model</span>
            </div>
            <div>
              <Waves aria-hidden="true" />
              <span>Spatial audio and haptic bus armed</span>
            </div>
          </div>
          <OperatingTheaterScene />
          <div className="stage-footer">
            <span><ShieldCheck aria-hidden="true" /> Sterile workflow active</span>
            <span><CircleAlert aria-hidden="true" /> Emergency injector live</span>
            <span><Activity aria-hidden="true" /> Patient twin breathing</span>
          </div>
        </section>

        <aside className="right-rail">
          <VitalsPanel />
          <AiMentor />
          <EmergencyPanel />
        </aside>
      </div>

      <section className="lower-grid" aria-label="Training operations">
        <CollaborationPanel />
        <PlanningPanel />
        <AnalyticsPanel />
        <AssetPipelinePanel />
      </section>
    </main>
  );
}

export default App;
