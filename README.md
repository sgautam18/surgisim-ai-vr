# SurgiSim AI Theater

Next-generation AI-powered surgical simulation platform prototype for desktop web and VR-compatible operating theater training.

## What Is Included

- React application with a real-time Three.js operating theater scene
- Browser desktop workflow with responsive mobile layout
- WebXR readiness detection and VR capability panel
- Hand tracking, haptic bridge, voice mentor, and multiplayer status controls
- Procedure library for general, neuro, cardiac, orthopedic, and trauma surgery
- Dynamic patient twin vitals, blood loss, and complication controls
- AI mentor guidance, alerts, and post-op report action
- Instrument tray precision telemetry
- DICOM / CT / MRI planning panel for digital twin workflows
- Replay, collaboration, instructor annotation, and competency analytics modules
- Unity 6000 visualization project for a richer first-person OT scene

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Unity Visualization

The Unity project lives at `unity/SurgiSimUnity`.

Open it in Unity 6000.4.8f1 or newer, then open:

```text
Assets/SurgiSimUnity/Scenes/SurgiSimOperatingTheater.unity
```

The scene procedurally creates a first-person operating theater with surgical lights, patient subject, sterile drapes, laparoscopic gall bladder anatomy, animated grasper/clip applier/cautery tools, blood pooling, smoke particles, soft-tissue deformation, and a six-step laparoscopic cholecystectomy replay HUD.

A local macOS demo app can be generated from Unity via:

```text
SurgiSim > Build macOS Demo App
```

The local build output is ignored by git at `unity/SurgiSimUnity/Builds/SurgiSimUnityOT.app`.

## Build

```bash
npm run build
npm run lint
```

## Architecture Notes

- `src/App.jsx` contains the current prototype screens and 3D scene components.
- `zustand` holds simulation state for procedure, emergency, hand tracking, haptics, and voice state.
- `@react-three/fiber`, `@react-three/drei`, and `three` power the immersive operating theater.
- `recharts` renders vitals and competency analytics.

The prototype is structured so production modules can later split into:

- simulation physics engine
- anatomy and surgical procedure packs
- WebXR headset runtime
- haptic device bridge
- AI mentor service
- multiplayer session server
- DICOM reconstruction pipeline
- certification reporting service
