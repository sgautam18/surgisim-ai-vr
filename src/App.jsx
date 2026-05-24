import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import {
  Activity,
  BadgeCheck,
  Bluetooth,
  Bot,
  Brain,
  ChartNoAxesCombined,
  CircleAlert,
  ClipboardCheck,
  Cpu,
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
  ShieldCheck,
  Siren,
  Stethoscope,
  Users,
  Video,
  Waves,
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

const useSimulation = create((set) => ({
  activeProcedure: procedures[0],
  emergency: scenarios[0],
  phase: 'Port placement',
  bloodLoss: 115,
  timer: 18,
  voice: true,
  handTracking: true,
  haptics: true,
  setProcedure: (activeProcedure) =>
    set({
      activeProcedure,
      phase: activeProcedure.id === 'airway' ? 'Primary survey' : 'Port placement',
      bloodLoss: activeProcedure.difficulty,
      timer: 12,
    }),
  setEmergency: (emergency) => set({ emergency, bloodLoss: Math.round(emergency.severity * 2.4) }),
  toggleVoice: () => set((state) => ({ voice: !state.voice })),
  toggleTracking: () => set((state) => ({ handTracking: !state.handTracking })),
  toggleHaptics: () => set((state) => ({ haptics: !state.haptics })),
}));

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

function PatientModel({ bloodLoss }) {
  const breathing = useRef();
  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.015;
    if (breathing.current) breathing.current.scale.set(1, pulse, 1);
  });

  const bleedScale = Math.min(0.8, bloodLoss / 430);

  return (
    <group position={[0, 0.78, 0]}>
      <mesh ref={breathing} position={[0, 0.12, 0]}>
        <capsuleGeometry args={[0.43, 1.35, 8, 24]} />
        <meshStandardMaterial color="#c58d74" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#c99982" roughness={0.68} />
      </mesh>
      <mesh position={[0.03, 0.28, -0.43]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.012, 16, 80, Math.PI * 1.3]} />
        <meshStandardMaterial color="#8d101c" roughness={0.35} />
      </mesh>
      <mesh position={[0.18, 0.2, -0.49]} scale={[bleedScale, bleedScale, bleedScale]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#9f0d1e" roughness={0.2} metalness={0.05} />
      </mesh>
      <Text position={[0, 0.64, -0.6]} rotation={[-Math.PI / 2.2, 0, 0]} fontSize={0.08} color="#e8fbff" anchorX="center">
        dynamic tissue layers
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
    <group position={[2.25, 1.65, -1.8]} rotation={[0, -0.55, 0]}>
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

function OperatingTheaterScene() {
  const { bloodLoss, emergency, handTracking, haptics } = useSimulation();

  return (
    <Canvas shadows dpr={[1, 1.7]} gl={{ antialias: true }} data-testid="ot-canvas">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[3.6, 2.4, 4.5]} fov={44} />
        <color attach="background" args={['#071016']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={2.8} castShadow />
        <SurgicalLights />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[8, 7]} />
          <meshStandardMaterial color="#18242b" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[1.45, 0.24, 2.6]} />
          <meshStandardMaterial color="#d8e3e7" metalness={0.28} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.64, 0]} castShadow>
          <boxGeometry args={[1.55, 0.08, 2.76]} />
          <meshStandardMaterial color="#2f8f96" roughness={0.42} />
        </mesh>
        <PatientModel bloodLoss={bloodLoss} />

        <group position={[-2.1, 0.74, -0.45]}>
          <mesh>
            <boxGeometry args={[1.35, 0.08, 0.72]} />
            <meshStandardMaterial color="#cdd8dd" metalness={0.8} roughness={0.18} />
          </mesh>
          <Instrument position={[-0.34, 0.12, 0.08]} rotation={[0, 0.2, 0.1]} color="#cfd8df" label="scalpel" />
          <Instrument position={[0.28, 0.12, -0.12]} rotation={[0, -0.3, -0.05]} color="#bccbd2" label="cautery" />
        </group>

        <MonitorBank emergency={emergency} />

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

        <OrbitControls enablePan={false} minDistance={3.2} maxDistance={6.2} maxPolarAngle={Math.PI / 2.1} />
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
          <ProcedureLibrary />
          <CapabilityGrid />
          <InstrumentPanel />
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
