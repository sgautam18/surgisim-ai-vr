import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
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
  Layers3,
  Mic,
  MonitorCog,
  Play,
  Radio,
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

const skinMarks = [
  [-0.2, 0.62, -0.38, 0.012],
  [0.18, 0.63, -0.28, 0.009],
  [-0.06, 0.64, 0.02, 0.01],
  [0.28, 0.62, 0.12, 0.008],
  [-0.32, 0.61, 0.18, 0.007],
  [0.08, 0.63, 0.32, 0.011],
];

const floorGrid = Array.from({ length: 13 }, (_, index) => (index - 6) * 0.55);

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
  setProcedure: (activeProcedure) =>
    set({
      activeProcedure,
      phase: activeProcedure.id === 'lap-chole' ? gallbladderCase[0].title : activeProcedure.id === 'airway' ? 'Primary survey' : 'Exposure',
      caseStep: 0,
      bloodLoss: activeProcedure.difficulty,
      timer: 12,
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
  return (
    <group>
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

function PatientModel({ bloodLoss }) {
  const breathing = useRef();
  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.015;
    if (breathing.current) breathing.current.scale.set(1, 1, pulse);
  });

  const bleedScale = Math.min(0.8, bloodLoss / 430);

  return (
    <group position={[0, 0.78, 0]}>
      <mesh position={[0, 0.68, 0.18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.5, 0.88, 64]} />
        <meshStandardMaterial color="#137c84" roughness={0.5} side={2} />
      </mesh>
      <mesh position={[0, 0.675, 0.18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.4, 2.9]} />
        <meshStandardMaterial color="#1e8f98" roughness={0.58} transparent opacity={0.62} />
      </mesh>
      <mesh ref={breathing} position={[0, 0.12, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.46, 1.55, 12, 32]} />
        <meshStandardMaterial color="#c58d74" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.2, -1.12]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#c99982" roughness={0.68} />
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
        <meshStandardMaterial color="#c58d74" roughness={0.72} />
      </mesh>
      <mesh position={[0.48, 0.1, -0.12]} rotation={[Math.PI / 2, 0, -0.25]} castShadow>
        <capsuleGeometry args={[0.1, 1.2, 8, 18]} />
        <meshStandardMaterial color="#c58d74" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.62, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.42, 48]} />
        <meshStandardMaterial color="#1c938e" roughness={0.44} side={2} />
      </mesh>
      <mesh position={[-0.1, 0.68, -0.16]} rotation={[0.12, 0.25, -0.08]} castShadow>
        <sphereGeometry args={[0.23, 32, 24]} />
        <meshStandardMaterial color="#5a2f19" roughness={0.64} />
      </mesh>
      <mesh position={[0.18, 0.71, -0.16]} rotation={[0.1, 0, -0.28]} castShadow>
        <capsuleGeometry args={[0.075, 0.32, 8, 20]} />
        <meshStandardMaterial color="#4b8f35" roughness={0.48} />
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
        <meshStandardMaterial color="#9f0d1e" roughness={0.2} metalness={0.05} />
      </mesh>
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

function LaparoscopicDisplay() {
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

function SurgeonHands() {
  const left = useRef();
  const right = useRef();
  useFrame(({ clock }) => {
    const movement = Math.sin(clock.elapsedTime * 1.8) * 0.025;
    if (left.current) left.current.rotation.z = 0.22 + movement;
    if (right.current) right.current.rotation.z = -0.2 - movement;
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={left} position={[-0.72, 0.55, 1.15]} rotation={[0.1, 0.18, 0.24]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.52, 8, 18]} />
          <meshStandardMaterial color="#b97b64" roughness={0.62} />
        </mesh>
        <mesh position={[0.06, -0.11, 0.1]} rotation={[0.45, 0.15, -0.18]}>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#0a6b72" roughness={0.5} />
        </mesh>
        <Instrument position={[0.24, 0.02, -0.22]} rotation={[0, -0.4, -0.25]} color="#dce5ea" label="left grasper" />
      </group>
      <group ref={right} position={[0.72, 0.54, 1.16]} rotation={[0.08, -0.16, -0.2]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.52, 8, 18]} />
          <meshStandardMaterial color="#b97b64" roughness={0.62} />
        </mesh>
        <mesh position={[-0.06, -0.11, 0.1]} rotation={[0.45, -0.15, 0.18]}>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#0a6b72" roughness={0.5} />
        </mesh>
        <Instrument position={[-0.24, 0.02, -0.22]} rotation={[0, 0.36, 0.22]} color="#f1d36c" label="clip applier" />
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

function OperatingTheaterScene() {
  const { bloodLoss, emergency, handTracking, haptics } = useSimulation();

  return (
    <Canvas shadows dpr={[1, 1.7]} gl={{ antialias: true }} data-testid="ot-canvas">
      <Suspense fallback={null}>
        <FirstPersonCamera />
        <color attach="background" args={['#071016']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={2.8} castShadow />
        <RoomShell />
        <SurgicalLights />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[8, 7]} />
          <meshStandardMaterial color="#18242b" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[1.72, 0.24, 3.25]} />
          <meshStandardMaterial color="#d8e3e7" metalness={0.28} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.64, 0]} castShadow>
          <boxGeometry args={[1.82, 0.08, 3.42]} />
          <meshStandardMaterial color="#2f8f96" roughness={0.42} />
        </mesh>
        <PatientModel bloodLoss={bloodLoss} />
        <SurgeonHands />

        <group position={[-1.95, 0.74, 0.45]}>
          <mesh>
            <boxGeometry args={[1.35, 0.08, 0.72]} />
            <meshStandardMaterial color="#cdd8dd" metalness={0.8} roughness={0.18} />
          </mesh>
          <Instrument position={[-0.34, 0.12, 0.08]} rotation={[0, 0.2, 0.1]} color="#cfd8df" label="scalpel" />
          <Instrument position={[0.28, 0.12, -0.12]} rotation={[0, -0.3, -0.05]} color="#bccbd2" label="cautery" />
        </group>

        <MonitorBank emergency={emergency} />
        <LaparoscopicDisplay />
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

        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
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
  const { caseStep, advanceCase, resetCase } = useSimulation();
  const current = gallbladderCase[caseStep];
  const progress = Math.round(((caseStep + 1) / gallbladderCase.length) * 100);

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
        <button type="button" className="primary-action" onClick={advanceCase}>
          <Play aria-hidden="true" />
          Run next step
        </button>
        <button type="button" className="secondary-action" onClick={resetCase}>
          Reset
        </button>
      </div>
    </section>
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
          <ProcedureLibrary />
          <CapabilityGrid />
          <InstrumentPanel />
          <DevicePanel />
        </aside>

        <section className="simulator-stage" aria-label="Immersive operating theater">
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
      </section>
    </main>
  );
}

export default App;
