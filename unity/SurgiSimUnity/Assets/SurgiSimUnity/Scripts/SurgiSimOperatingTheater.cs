using System.Collections.Generic;
using UnityEngine;

namespace SurgiSim.UnityVisualization
{
    public sealed class SurgiSimOperatingTheater : MonoBehaviour
    {
        private readonly string[] stepTitles =
        {
            "Patient positioning and sterile field",
            "Optical port insertion",
            "Expose Calot triangle",
            "Clip and divide cystic structures",
            "Dissect gall bladder from liver bed",
            "Specimen extraction and closure"
        };

        private readonly string[] stepCues =
        {
            "OT lights focused, monitors attached, sterile drape checked.",
            "Umbilical trocar enters and pneumoperitoneum expands abdomen.",
            "Camera identifies liver, gall bladder, cystic duct and danger zone.",
            "Clip applier secures cystic duct and artery before division.",
            "Hook cautery separates gall bladder from the liver bed with smoke.",
            "Specimen bag extracts gall bladder, hemostasis and closure confirmed."
        };

        private readonly List<GameObject> clips = new();
        private readonly List<GameObject> charringMarks = new();
        private Material skinMaterial;
        private Material wetTissueMaterial;
        private Material liverMaterial;
        private Material gallbladderMaterial;
        private Material drapeMaterial;
        private Material metalMaterial;
        private Material bloodMaterial;
        private Material glassMaterial;
        private Material mattePlasticMaterial;
        private Mesh abdomenMesh;
        private Vector3[] abdomenBaseVertices;
        private GameObject abdomenSurface;
        private GameObject patientTorso;
        private GameObject gallbladder;
        private GameObject bloodPool;
        private GameObject specimenBag;
        private GameObject leftTool;
        private GameObject rightTool;
        private GameObject laparoscopyFeedTarget;
        private ParticleSystem smokeSystem;
        private ParticleSystem dropletSystem;
        private Light cauteryGlow;
        private Camera firstPersonCamera;
        private float replayTimer;
        private int currentStep;

        public bool AutoPlay = true;
        public float SecondsPerStep = 3.3f;

        private void Start()
        {
            QualitySettings.antiAliasing = 8;
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.78f, 0.93f, 0.96f);
            RenderSettings.ambientEquatorColor = new Color(0.28f, 0.38f, 0.42f);
            RenderSettings.ambientGroundColor = new Color(0.05f, 0.07f, 0.08f);
            RenderSettings.fog = true;
            RenderSettings.fogColor = new Color(0.78f, 0.91f, 0.93f);
            RenderSettings.fogDensity = 0.012f;

            CreateMaterials();
            BuildRoom();
            BuildOperatingTable();
            BuildPatientAndAnatomy();
            BuildSurgicalDevices();
            BuildSurgicalLights();
            BuildFirstPersonTools();
            BuildVfx();
            BuildCamera();
            SetStep(0);
        }

        private void Update()
        {
            if (AutoPlay)
            {
                replayTimer += Time.deltaTime;
                SetStep(Mathf.Clamp(Mathf.FloorToInt(replayTimer / SecondsPerStep), 0, stepTitles.Length - 1));
            }

            AnimatePatient();
            AnimateSoftTissue();
            AnimateTools();
            AnimateMonitorFeed();
        }

        private void OnGUI()
        {
            GUI.depth = 0;
            var panel = new Rect(22, 22, 470, 152);
            GUI.color = new Color(0.02f, 0.05f, 0.07f, 0.86f);
            GUI.DrawTexture(panel, Texture2D.whiteTexture);
            GUI.color = Color.white;
            GUI.Label(new Rect(42, 38, 430, 24), "SurgiSim Unity OT - Laparoscopic Cholecystectomy");
            GUI.Label(new Rect(42, 66, 430, 24), $"Step {currentStep + 1}/6: {stepTitles[currentStep]}");
            GUI.Label(new Rect(42, 94, 430, 48), stepCues[currentStep]);

            if (GUI.Button(new Rect(42, 132, 82, 26), AutoPlay ? "Pause" : "Replay"))
            {
                AutoPlay = !AutoPlay;
                if (AutoPlay && currentStep >= stepTitles.Length - 1)
                {
                    replayTimer = 0;
                }
            }

            if (GUI.Button(new Rect(132, 132, 82, 26), "Reset"))
            {
                replayTimer = 0;
                AutoPlay = true;
                SetStep(0);
            }
        }

        private void CreateMaterials()
        {
            skinMaterial = PbrMaterial("Skin with subtle subsurface warmth", new Color(0.78f, 0.46f, 0.34f), 0.18f, 0.42f, MakeNoiseTexture(new Color(0.58f, 0.29f, 0.22f), new Color(0.96f, 0.66f, 0.5f), 256, 11));
            wetTissueMaterial = PbrMaterial("Wet fibrous tissue", new Color(0.72f, 0.16f, 0.12f), 0.02f, 0.12f, MakeNoiseTexture(new Color(0.35f, 0.04f, 0.04f), new Color(0.92f, 0.3f, 0.24f), 256, 17));
            liverMaterial = PbrMaterial("Wet liver parenchyma", new Color(0.38f, 0.13f, 0.07f), 0.02f, 0.18f, MakeNoiseTexture(new Color(0.23f, 0.06f, 0.03f), new Color(0.68f, 0.24f, 0.12f), 256, 23));
            gallbladderMaterial = PbrMaterial("Glistening gall bladder", new Color(0.26f, 0.62f, 0.18f), 0.0f, 0.08f, MakeNoiseTexture(new Color(0.1f, 0.36f, 0.08f), new Color(0.68f, 1f, 0.46f), 256, 29));
            drapeMaterial = PbrMaterial("Textile surgical drape", new Color(0.04f, 0.62f, 0.68f), 0.0f, 0.72f, MakeDrapeTexture());
            metalMaterial = PbrMaterial("Brushed surgical steel", new Color(0.75f, 0.82f, 0.86f), 1f, 0.18f, null);
            bloodMaterial = PbrMaterial("Glossy blood", new Color(0.48f, 0.01f, 0.05f), 0.0f, 0.03f, null);
            glassMaterial = TransparentMaterial("Transparent fluid/glass", new Color(0.72f, 0.96f, 1f, 0.34f), 0.0f, 0.05f);
            mattePlasticMaterial = PbrMaterial("Matte medical plastic", new Color(0.72f, 0.78f, 0.82f), 0.0f, 0.34f, null);
        }

        private void BuildRoom()
        {
            CreateBox("Reflective tiled floor", new Vector3(0, -0.05f, 0), new Vector3(8.4f, 0.08f, 6.2f), PbrMaterial("Floor tiles", new Color(0.12f, 0.18f, 0.2f), 0.0f, 0.28f, MakeDrapeTexture()));
            CreateBox("Back sterile wall", new Vector3(0, 1.55f, -3.08f), new Vector3(8.4f, 3.2f, 0.12f), PbrMaterial("Satin white OT wall", new Color(0.78f, 0.86f, 0.88f), 0.0f, 0.45f, null));
            CreateBox("Left wall", new Vector3(-4.2f, 1.55f, 0), new Vector3(0.12f, 3.2f, 6.2f), PbrMaterial("Left OT wall", new Color(0.72f, 0.8f, 0.82f), 0.0f, 0.5f, null));
            CreateBox("Right wall", new Vector3(4.2f, 1.55f, 0), new Vector3(0.12f, 3.2f, 6.2f), PbrMaterial("Right OT wall", new Color(0.72f, 0.8f, 0.82f), 0.0f, 0.5f, null));

            for (var i = -7; i <= 7; i++)
            {
                CreateBox("Floor grout line", new Vector3(i * 0.55f, 0.002f, 0), new Vector3(0.01f, 0.012f, 6.2f), mattePlasticMaterial);
                CreateBox("Floor grout line", new Vector3(0, 0.004f, i * 0.55f), new Vector3(8.4f, 0.012f, 0.01f), mattePlasticMaterial);
            }
        }

        private void BuildOperatingTable()
        {
            CreateBox("Hydraulic operating table base", new Vector3(0, 0.28f, 0), new Vector3(1.2f, 0.28f, 2.5f), metalMaterial);
            CreateBox("Operating table mattress", new Vector3(0, 0.58f, 0), new Vector3(1.85f, 0.18f, 3.45f), PbrMaterial("Cushioned table pad", new Color(0.08f, 0.48f, 0.52f), 0.0f, 0.28f, null));
            CreateBox("Sterile lower drape", new Vector3(0, 0.76f, 0.62f), new Vector3(2.5f, 0.04f, 2.8f), drapeMaterial);
        }

        private void BuildPatientAndAnatomy()
        {
            patientTorso = CreateEllipsoid("Breathing patient torso", new Vector3(0, 1.04f, 0.08f), new Vector3(0.72f, 0.45f, 1.1f), skinMaterial);
            CreateEllipsoid("Patient head", new Vector3(0, 1.16f, -1.3f), new Vector3(0.34f, 0.28f, 0.34f), skinMaterial);
            CreateEllipsoid("Left arm secured", new Vector3(-0.78f, 0.93f, -0.05f), new Vector3(0.14f, 0.14f, 0.72f), skinMaterial).transform.rotation = Quaternion.Euler(0, 0, 11f);
            CreateEllipsoid("Right arm secured", new Vector3(0.78f, 0.93f, -0.05f), new Vector3(0.14f, 0.14f, 0.72f), skinMaterial).transform.rotation = Quaternion.Euler(0, 0, -11f);

            CreateBox("Fenestrated sterile drape", new Vector3(0, 1.31f, 0.08f), new Vector3(2.7f, 0.025f, 2.65f), drapeMaterial);
            CreateTorusProxy("Abdominal surgical opening", new Vector3(0, 1.345f, 0.07f), new Vector3(0.88f, 0.04f, 0.62f), drapeMaterial);
            abdomenSurface = BuildAbdomenMesh();

            CreateEllipsoid("Liver model", new Vector3(-0.1f, 1.55f, -0.23f), new Vector3(0.42f, 0.22f, 0.28f), liverMaterial).transform.rotation = Quaternion.Euler(0, 0, -8f);
            gallbladder = CreateEllipsoid("Gall bladder target", new Vector3(0.26f, 1.57f, -0.2f), new Vector3(0.12f, 0.24f, 0.1f), gallbladderMaterial);
            gallbladder.transform.rotation = Quaternion.Euler(0, 0, -24f);
            CreateCylinderBetween("Cystic duct", new Vector3(0.18f, 1.53f, -0.06f), new Vector3(0.45f, 1.51f, 0.14f), 0.018f, wetTissueMaterial);

            foreach (var port in new[] { new Vector3(-0.38f, 1.38f, 0.28f), new Vector3(0.42f, 1.38f, 0.18f), new Vector3(0.03f, 1.38f, 0.58f) })
            {
                CreateTorusProxy("Metal trocar port", port, new Vector3(0.18f, 0.025f, 0.18f), metalMaterial);
            }
        }

        private void BuildSurgicalDevices()
        {
            BuildDeviceCart("Anesthesia workstation", new Vector3(-2.55f, 0.78f, 1.2f), "VENT\nMAC 0.9", new Color(0.1f, 0.55f, 0.75f));
            BuildDeviceCart("Insufflator tower", new Vector3(2.45f, 0.88f, 0.72f), "CO2\n12 mmHg", new Color(0.1f, 0.7f, 0.78f));
            BuildDeviceCart("Electrosurgical unit", new Vector3(-2.55f, 0.88f, -0.45f), "CUT 30\nCOAG 25", new Color(0.95f, 0.47f, 0.15f));
            BuildDeviceCart("Laparoscopic video tower", new Vector3(1.78f, 1.32f, -1.9f), "4K LAP FEED", new Color(0.02f, 0.22f, 0.28f));
            laparoscopyFeedTarget = CreateEllipsoid("Laparoscopic monitor gall bladder feed", new Vector3(1.74f, 1.45f, -2.15f), new Vector3(0.12f, 0.22f, 0.02f), gallbladderMaterial);
            CreateBox("Surgical tray", new Vector3(-1.8f, 0.92f, 0.45f), new Vector3(1.25f, 0.08f, 0.72f), metalMaterial);
        }

        private void BuildSurgicalLights()
        {
            foreach (var x in new[] { -1.1f, 1.1f })
            {
                var head = CreateEllipsoid("Focused surgical light head", new Vector3(x, 3.02f, 0.18f), new Vector3(0.72f, 0.16f, 0.72f), metalMaterial);
                head.transform.rotation = Quaternion.Euler(10f, 0, x < 0 ? 10f : -10f);
                var lightObject = new GameObject("High intensity surgical spotlight");
                lightObject.transform.position = new Vector3(x, 2.84f, 0.16f);
                lightObject.transform.rotation = Quaternion.LookRotation(new Vector3(-x * 0.1f, -1f, -0.08f));
                var spot = lightObject.AddComponent<Light>();
                spot.type = LightType.Spot;
                spot.intensity = 1800f;
                spot.range = 5.4f;
                spot.spotAngle = 46f;
                spot.innerSpotAngle = 18f;
                spot.shadows = LightShadows.Soft;
                spot.shadowStrength = 0.72f;
                spot.color = new Color(0.94f, 1f, 1f);
            }
        }

        private void BuildFirstPersonTools()
        {
            leftTool = CreateTool("Left grasper", new Vector3(-0.62f, 1.3f, 1.18f), new Vector3(-0.2f, 1.44f, 0.18f), metalMaterial);
            rightTool = CreateTool("Clip applier / hook cautery", new Vector3(0.62f, 1.3f, 1.18f), new Vector3(0.18f, 1.45f, 0.08f), metalMaterial);
            CreateEllipsoid("Left gloved hand", new Vector3(-0.74f, 1.14f, 1.35f), new Vector3(0.16f, 0.12f, 0.22f), PbrMaterial("Nitrile glove", new Color(0.04f, 0.5f, 0.55f), 0, 0.28f, null));
            CreateEllipsoid("Right gloved hand", new Vector3(0.74f, 1.14f, 1.35f), new Vector3(0.16f, 0.12f, 0.22f), PbrMaterial("Nitrile glove right", new Color(0.04f, 0.5f, 0.55f), 0, 0.28f, null));
        }

        private void BuildVfx()
        {
            bloodPool = CreateEllipsoid("Glossy blood pool", new Vector3(0.22f, 1.395f, 0.03f), new Vector3(0.01f, 0.12f, 0.19f), bloodMaterial);
            bloodPool.transform.rotation = Quaternion.Euler(90f, 0, 0);

            specimenBag = CreateEllipsoid("Transparent specimen bag", new Vector3(0.36f, 1.51f, 0.34f), new Vector3(0.22f, 0.14f, 0.06f), glassMaterial);

            var smokeObject = new GameObject("Cautery smoke particles");
            smokeObject.transform.position = new Vector3(0.15f, 1.64f, -0.07f);
            smokeSystem = smokeObject.AddComponent<ParticleSystem>();
            var main = smokeSystem.main;
            main.startColor = new Color(0.82f, 0.82f, 0.76f, 0.25f);
            main.startSize = 0.08f;
            main.startLifetime = 1.4f;
            main.simulationSpace = ParticleSystemSimulationSpace.World;
            var emission = smokeSystem.emission;
            emission.rateOverTime = 0;
            var shape = smokeSystem.shape;
            shape.shapeType = ParticleSystemShapeType.Sphere;
            shape.radius = 0.07f;
            var velocity = smokeSystem.velocityOverLifetime;
            velocity.enabled = true;
            velocity.y = 0.28f;
            smokeSystem.Stop();

            var dropletObject = new GameObject("Blood micro droplets");
            dropletObject.transform.position = new Vector3(0.18f, 1.45f, 0.02f);
            dropletSystem = dropletObject.AddComponent<ParticleSystem>();
            var bloodMain = dropletSystem.main;
            bloodMain.startColor = new Color(0.42f, 0.01f, 0.04f, 0.92f);
            bloodMain.startSize = 0.026f;
            bloodMain.startLifetime = 0.8f;
            var bloodEmission = dropletSystem.emission;
            bloodEmission.rateOverTime = 0;
            dropletSystem.Stop();

            var glowObject = new GameObject("Cautery contact glow");
            glowObject.transform.position = new Vector3(0.12f, 1.57f, -0.05f);
            cauteryGlow = glowObject.AddComponent<Light>();
            cauteryGlow.type = LightType.Point;
            cauteryGlow.color = new Color(1f, 0.45f, 0.12f);
            cauteryGlow.intensity = 0;
            cauteryGlow.range = 0.55f;
        }

        private void BuildCamera()
        {
            var cameraObject = new GameObject("First-person surgeon camera");
            cameraObject.transform.position = new Vector3(0, 1.72f, 2.72f);
            cameraObject.transform.rotation = Quaternion.Euler(18f, 180f, 0);
            firstPersonCamera = cameraObject.AddComponent<Camera>();
            firstPersonCamera.fieldOfView = 58f;
            firstPersonCamera.nearClipPlane = 0.04f;
            firstPersonCamera.farClipPlane = 60f;
            firstPersonCamera.allowHDR = true;
            firstPersonCamera.allowMSAA = true;
            cameraObject.AddComponent<AudioListener>();
        }

        private void SetStep(int step)
        {
            if (step == currentStep && clips.Count > 0)
            {
                return;
            }

            currentStep = step;
            gallbladder.transform.localScale = step >= 5 ? new Vector3(0.08f, 0.16f, 0.07f) : new Vector3(0.12f, 0.24f, 0.1f);
            bloodPool.SetActive(step >= 2);
            bloodPool.transform.localScale = Vector3.one * Mathf.Lerp(0.45f, 1.2f, step / 5f);
            specimenBag.SetActive(step >= 5);

            foreach (var clip in clips)
            {
                Destroy(clip);
            }
            clips.Clear();

            if (step >= 3)
            {
                clips.Add(CreateBox("Gold cystic duct clip", new Vector3(0.21f, 1.56f, -0.02f), new Vector3(0.13f, 0.025f, 0.035f), PbrMaterial("Gold clip", new Color(1f, 0.78f, 0.18f), 1f, 0.16f, null)));
                clips.Add(CreateBox("Gold cystic artery clip", new Vector3(0.32f, 1.55f, 0.04f), new Vector3(0.13f, 0.025f, 0.035f), PbrMaterial("Gold clip 2", new Color(1f, 0.78f, 0.18f), 1f, 0.16f, null)));
            }

            foreach (var mark in charringMarks)
            {
                mark.SetActive(step >= 4);
            }

            var smokeEmission = smokeSystem.emission;
            smokeEmission.rateOverTime = step >= 4 ? 28f : 0;
            if (step >= 4 && !smokeSystem.isPlaying) smokeSystem.Play();
            if (step < 4) smokeSystem.Stop();

            var dropletEmission = dropletSystem.emission;
            dropletEmission.rateOverTime = step >= 2 && step <= 4 ? 6f : 0;
            if (step >= 2 && step <= 4 && !dropletSystem.isPlaying) dropletSystem.Play();
            if (step < 2 || step > 4) dropletSystem.Stop();
        }

        private void AnimatePatient()
        {
            var breath = 1f + Mathf.Sin(Time.time * 2.1f) * 0.025f;
            patientTorso.transform.localScale = new Vector3(0.72f, 0.45f * breath, 1.1f);
            if (firstPersonCamera != null)
            {
                firstPersonCamera.transform.LookAt(new Vector3(0, 1.42f, -0.05f));
            }
        }

        private void AnimateSoftTissue()
        {
            if (abdomenMesh == null || abdomenBaseVertices == null) return;

            var vertices = new Vector3[abdomenBaseVertices.Length];
            for (var i = 0; i < vertices.Length; i++)
            {
                var vertex = abdomenBaseVertices[i];
                var depression = 0f;
                depression += Pressure(vertex, new Vector2(0.03f, 0.24f), currentStep >= 1 ? 0.09f : 0.02f);
                depression += Pressure(vertex, new Vector2(0.26f, -0.02f), currentStep >= 2 ? 0.07f : 0.01f);
                depression += Pressure(vertex, new Vector2(-0.2f, -0.02f), currentStep >= 3 ? 0.05f : 0.01f);
                vertex.y -= depression;
                vertex.y += Mathf.Sin(Time.time * 2f + vertex.x * 4f) * 0.004f;
                vertices[i] = vertex;
            }

            abdomenMesh.vertices = vertices;
            abdomenMesh.RecalculateNormals();
        }

        private void AnimateTools()
        {
            var wave = Mathf.Sin(Time.time * 2.3f) * 0.025f;
            leftTool.transform.position = Vector3.Lerp(new Vector3(-0.62f, 1.3f, 1.18f), new Vector3(-0.28f, 1.5f, 0.02f), Mathf.Clamp01(currentStep / 4f)) + new Vector3(0, wave, 0);
            leftTool.transform.LookAt(new Vector3(-0.1f, 1.48f, -0.1f));

            var target = currentStep >= 4 ? new Vector3(0.14f, 1.58f, -0.06f) : new Vector3(0.2f, 1.48f, 0.08f);
            rightTool.transform.position = Vector3.Lerp(new Vector3(0.62f, 1.3f, 1.18f), target, Mathf.Clamp01(currentStep / 4f)) + new Vector3(0, -wave, 0);
            rightTool.transform.LookAt(target);
            cauteryGlow.intensity = currentStep >= 4 ? 2.8f + Mathf.Sin(Time.time * 15f) * 0.8f : 0f;
        }

        private void AnimateMonitorFeed()
        {
            if (laparoscopyFeedTarget == null) return;

            laparoscopyFeedTarget.transform.localScale = currentStep >= 5 ? new Vector3(0.08f, 0.14f, 0.02f) : new Vector3(0.12f, 0.22f, 0.02f);
            laparoscopyFeedTarget.transform.Rotate(Vector3.forward, Time.deltaTime * 14f);
        }

        private GameObject BuildAbdomenMesh()
        {
            var size = 1.18f;
            var subdivisions = 28;
            var vertices = new List<Vector3>();
            var uv = new List<Vector2>();
            var triangles = new List<int>();

            for (var z = 0; z <= subdivisions; z++)
            {
                for (var x = 0; x <= subdivisions; x++)
                {
                    var px = ((float)x / subdivisions - 0.5f) * size;
                    var pz = ((float)z / subdivisions - 0.5f) * 0.86f;
                    var dome = Mathf.Max(0, 0.1f * (1f - (px * px * 1.8f + pz * pz * 2.5f)));
                    vertices.Add(new Vector3(px, dome, pz));
                    uv.Add(new Vector2((float)x / subdivisions, (float)z / subdivisions));
                }
            }

            for (var z = 0; z < subdivisions; z++)
            {
                for (var x = 0; x < subdivisions; x++)
                {
                    var row = subdivisions + 1;
                    var a = z * row + x;
                    triangles.Add(a);
                    triangles.Add(a + row);
                    triangles.Add(a + 1);
                    triangles.Add(a + 1);
                    triangles.Add(a + row);
                    triangles.Add(a + row + 1);
                }
            }

            abdomenMesh = new Mesh { name = "Deformable abdomen proxy mesh" };
            abdomenMesh.SetVertices(vertices);
            abdomenMesh.SetUVs(0, uv);
            abdomenMesh.SetTriangles(triangles, 0);
            abdomenMesh.RecalculateNormals();
            abdomenBaseVertices = abdomenMesh.vertices;

            var abdomen = new GameObject("Deformable soft-tissue abdomen proxy");
            abdomen.transform.position = new Vector3(0, 1.38f, 0.08f);
            var filter = abdomen.AddComponent<MeshFilter>();
            filter.sharedMesh = abdomenMesh;
            var renderer = abdomen.AddComponent<MeshRenderer>();
            renderer.sharedMaterial = skinMaterial;
            return abdomen;
        }

        private void BuildDeviceCart(string name, Vector3 position, string screenText, Color glowColor)
        {
            CreateBox(name, position, new Vector3(0.62f, 1f, 0.42f), mattePlasticMaterial);
            var screen = CreateBox($"{name} screen", position + new Vector3(0, 0.08f, -0.225f), new Vector3(0.46f, 0.42f, 0.018f), PbrMaterial($"{name} screen glow", glowColor, 0, 0.12f, null));
            var label = new GameObject($"{name} label");
            label.transform.position = screen.transform.position + new Vector3(0, 0, -0.03f);
            label.transform.rotation = Quaternion.Euler(0, 180f, 0);
            var text = label.AddComponent<TextMesh>();
            text.text = screenText;
            text.fontSize = 42;
            text.characterSize = 0.018f;
            text.anchor = TextAnchor.MiddleCenter;
            text.alignment = TextAlignment.Center;
            text.color = Color.white;
        }

        private GameObject CreateTool(string name, Vector3 handle, Vector3 tip, Material material)
        {
            var root = new GameObject(name);
            CreateCylinderBetween($"{name} shaft", handle, tip, 0.02f, material).transform.SetParent(root.transform, true);
            CreateEllipsoid($"{name} handle", handle, new Vector3(0.14f, 0.08f, 0.08f), mattePlasticMaterial).transform.SetParent(root.transform, true);
            CreateEllipsoid($"{name} jaws", tip, new Vector3(0.045f, 0.018f, 0.08f), material).transform.SetParent(root.transform, true);
            root.transform.position = handle;
            return root;
        }

        private GameObject CreateBox(string name, Vector3 position, Vector3 scale, Material material)
        {
            var gameObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
            gameObject.name = name;
            gameObject.transform.position = position;
            gameObject.transform.localScale = scale;
            gameObject.GetComponent<Renderer>().sharedMaterial = material;
            return gameObject;
        }

        private GameObject CreateEllipsoid(string name, Vector3 position, Vector3 scale, Material material)
        {
            var gameObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            gameObject.name = name;
            gameObject.transform.position = position;
            gameObject.transform.localScale = scale;
            gameObject.GetComponent<Renderer>().sharedMaterial = material;
            return gameObject;
        }

        private GameObject CreateCylinderBetween(string name, Vector3 start, Vector3 end, float radius, Material material)
        {
            var midpoint = (start + end) * 0.5f;
            var length = Vector3.Distance(start, end);
            var cylinder = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            cylinder.name = name;
            cylinder.transform.position = midpoint;
            cylinder.transform.localScale = new Vector3(radius * 2f, length * 0.5f, radius * 2f);
            cylinder.transform.rotation = Quaternion.FromToRotation(Vector3.up, end - start);
            cylinder.GetComponent<Renderer>().sharedMaterial = material;
            return cylinder;
        }

        private GameObject CreateTorusProxy(string name, Vector3 position, Vector3 scale, Material material)
        {
            var root = new GameObject(name);
            const int segments = 48;
            for (var i = 0; i < segments; i++)
            {
                var a = (Mathf.PI * 2f * i) / segments;
                var b = (Mathf.PI * 2f * (i + 1)) / segments;
                var start = position + new Vector3(Mathf.Cos(a) * scale.x, 0, Mathf.Sin(a) * scale.z);
                var end = position + new Vector3(Mathf.Cos(b) * scale.x, 0, Mathf.Sin(b) * scale.z);
                CreateCylinderBetween($"{name} segment", start, end, scale.y, material).transform.SetParent(root.transform, true);
            }
            return root;
        }

        private Material PbrMaterial(string name, Color color, float metallic, float smoothness, Texture2D texture)
        {
            var shader = Shader.Find("Standard");
            var material = new Material(shader) { name = name, color = color };
            material.SetFloat("_Metallic", metallic);
            material.SetFloat("_Glossiness", 1f - smoothness);
            if (texture != null)
            {
                material.mainTexture = texture;
            }
            return material;
        }

        private Material TransparentMaterial(string name, Color color, float metallic, float smoothness)
        {
            var material = PbrMaterial(name, color, metallic, smoothness, null);
            material.SetFloat("_Mode", 3);
            material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            material.SetInt("_ZWrite", 0);
            material.DisableKeyword("_ALPHATEST_ON");
            material.EnableKeyword("_ALPHABLEND_ON");
            material.renderQueue = 3000;
            return material;
        }

        private Texture2D MakeNoiseTexture(Color low, Color high, int size, int seed)
        {
            var texture = new Texture2D(size, size, TextureFormat.RGBA32, true);
            for (var y = 0; y < size; y++)
            {
                for (var x = 0; x < size; x++)
                {
                    var n = Mathf.PerlinNoise((x + seed) * 0.045f, (y - seed) * 0.045f);
                    var fine = Mathf.PerlinNoise((x - seed) * 0.18f, (y + seed) * 0.18f) * 0.18f;
                    texture.SetPixel(x, y, Color.Lerp(low, high, Mathf.Clamp01(n + fine)));
                }
            }
            texture.Apply();
            texture.wrapMode = TextureWrapMode.Repeat;
            texture.filterMode = FilterMode.Trilinear;
            return texture;
        }

        private Texture2D MakeDrapeTexture()
        {
            const int size = 256;
            var texture = new Texture2D(size, size, TextureFormat.RGBA32, true);
            var low = new Color(0.02f, 0.42f, 0.46f);
            var high = new Color(0.08f, 0.78f, 0.82f);
            for (var y = 0; y < size; y++)
            {
                for (var x = 0; x < size; x++)
                {
                    var weave = ((x % 16) < 2 || (y % 18) < 2) ? 0.16f : 0f;
                    var n = Mathf.PerlinNoise(x * 0.055f, y * 0.055f);
                    texture.SetPixel(x, y, Color.Lerp(low, high, Mathf.Clamp01(n + weave)));
                }
            }
            texture.Apply();
            texture.wrapMode = TextureWrapMode.Repeat;
            texture.filterMode = FilterMode.Trilinear;
            return texture;
        }

        private static float Pressure(Vector3 vertex, Vector2 center, float strength)
        {
            var distance = Vector2.Distance(new Vector2(vertex.x, vertex.z), center);
            return Mathf.Exp(-(distance * distance) / 0.025f) * strength;
        }
    }
}
