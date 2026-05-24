# SurgiSim Unity Visualization

Open `Assets/SurgiSimUnity/Scenes/SurgiSimOperatingTheater.unity` in Unity 6000.4.8f1 or newer.

This Unity scene is a higher-fidelity visualization path for the browser prototype. It procedurally creates:

- first-person surgeon camera
- operating theater room, table, surgical lights, device towers, and video monitor
- patient subject with sterile draping
- visible laparoscopic gall bladder target anatomy
- soft-tissue abdomen deformation proxy
- animated grasper, clip applier, cautery, clips, specimen bag
- blood pooling, micro droplets, cautery glow, and smoke particles
- replay HUD for the six-step laparoscopic cholecystectomy flow

Use `SurgiSim > Build Operating Theater Scene` if the scene ever needs to be regenerated.

Production visual upgrade slots:

- Replace procedural anatomy with licensed GLB/FBX anatomy models.
- Add URP/HDRP materials and real texture maps.
- Replace primitive tools with PBR surgical instrument models.
- Add XR Interaction Toolkit/OpenXR when targeting Quest, Vive, Vision Pro, or other headsets.
