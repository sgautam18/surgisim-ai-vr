# Photorealism Asset Pipeline

This prototype now renders a procedural PBR proxy, but true medical realism requires licensed, high-fidelity assets. Do not commit marketplace files unless the license allows redistribution.

## Model Slots

Place production GLB assets in these paths:

- `public/models/anatomy/patient-abdomen.glb`
- `public/models/anatomy/skin-fat-fascia-liver-gallbladder.glb`
- `public/models/tools/laparoscopy-toolkit.glb`
- `public/models/ot/surgical-theater-equipment.glb`

Recommended searches for licensed assets:

- `photorealistic human anatomy abdomen GLB`
- `PBR laparoscopic surgical instruments GLB`
- `PBR operating theater equipment GLB`
- `medical gallbladder liver anatomy 3D model`
- `surgical drape fabric PBR texture`

## Texture Slots

Use 2K or 4K maps where possible:

- `public/textures/skin/albedo.png`
- `public/textures/skin/normal.png`
- `public/textures/skin/roughness.png`
- `public/textures/tissue/albedo.png`
- `public/textures/tissue/normal.png`
- `public/textures/tissue/roughness.png`
- `public/textures/drape/albedo.png`
- `public/textures/drape/normal.png`
- `public/textures/drape/roughness.png`
- `public/textures/metal/roughness.png`

## Realism Requirements

- Use GLB/GLTF with real-world scale in meters.
- Prefer PBR materials with albedo, normal, roughness, metallic, and AO maps.
- Use separate meshes for skin, fat, fascia, liver, gall bladder, cystic duct, cystic artery, and common bile duct.
- Keep deformable meshes low enough for VR. Use high detail for desktop, decimated LODs for headset builds.
- Use collision shells that are simpler than render meshes.

## Engine Path

The browser build is useful for demos, dashboards, and WebXR preview. For surgical-grade visual fidelity:

- Unreal Engine 5: best path for Lumen, Nanite, cinematic lighting, and high-end VR visual quality.
- Unity HDRP: strong path for medical training if you need C# workflows and XR toolkit integration.
- Browser/WebXR: best for distribution and collaborative teaching, but needs careful optimization.
