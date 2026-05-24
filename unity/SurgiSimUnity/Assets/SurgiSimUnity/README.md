# SurgiSim Unity Visualization

Open `Assets/SurgiSimUnity/Scenes/SurgiSimOperatingTheater.unity` in Unity 6000.4.8f1 or newer.

This Unity scene is a higher-fidelity visualization path for the browser prototype. It procedurally creates:

- first-person surgeon camera
- operating theater room, table, surgical lights, device towers, and video monitor
- patient subject with sterile draping
- imported Z-Anatomy anatomy layers for visceral organs, cardiovascular anatomy, skeleton, muscles, nerves, lymphoid organs, joints, body regions, and reference landmarks
- visible laparoscopic gall bladder target anatomy with a Z-Anatomy visceral overlay
- open-body visual layers for skin, fat, muscle, peritoneum, sternotomy, rib/sternum exposure, and retractor placement
- soft-tissue abdomen deformation proxy
- animated grasper, clip applier, cautery, clips, specimen bag
- blood pooling, micro droplets, cautery glow, and smoke particles
- replay HUD for the six-step laparoscopic cholecystectomy flow

Use `SurgiSim > Build Operating Theater Scene` if the scene ever needs to be regenerated.

Z-Anatomy assets:

- FBX files live under `Assets/SurgiSimUnity/Resources/ZAnatomy/FBX` so runtime builds can load them with `Resources.Load`.
- The scene has four visual modes: gall bladder, heart, upper abdomen, and full Z-Anatomy atlas.
- Z-Anatomy-derived assets are CC BY-SA 4.0. Keep `ThirdPartyNotices.md` with any distribution.

Production visual upgrade slots:

- Add URP/HDRP materials and real texture maps.
- Replace primitive tools with PBR surgical instrument models.
- Add XR Interaction Toolkit/OpenXR when targeting Quest, Vive, Vision Pro, or other headsets.
