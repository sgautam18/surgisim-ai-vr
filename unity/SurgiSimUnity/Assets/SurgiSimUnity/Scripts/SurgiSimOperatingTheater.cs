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
        private readonly List<GameObject> anatomyRoots = new();
        private readonly string[] anatomyModes = { "Gall Bladder", "Heart", "Upper Abdomen" };
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
        private GameObject gallbladderRoot;
        private GameObject heartRoot;
        private GameObject abdomenAtlasRoot;
        private ParticleSystem smokeSystem;
        private ParticleSystem dropletSystem;
        private Light cauteryGlow;
        private Camera firstPersonCamera;
        private GameObject emergencyCameraObject;
        private float replayTimer;
        private int currentStep;
        private int anatomyMode;
        private bool initialized;
        private string startupError;
        private Shader runtimeShader;

        public bool AutoPlay = true;
        public float SecondsPerStep = 3.3f;

        private void Start()
        {
            BuildEmergencyCamera();

            try
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
                BuildHeartAnatomyMode();
                BuildUpperAbdomenMode();
                BuildSurgicalDevices();
                BuildSurgicalLights();
                BuildFirstPersonTools();
                BuildVfx();
                BuildCamera();
                SetStep(0);
                SetAnatomyMode(0);
                initialized = true;
            }
            catch (System.Exception exception)
            {
                startupError = exception.Message;
                Debug.LogException(exception);
            }
        }

        private void Update()
        {
            if (!initialized)
            {
                return;
            }

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
            if (!initialized)
            {
                var errorPanel = new Rect(22, 22, 520, 122);
                GUI.color = new Color(0.18f, 0.02f, 0.03f, 0.88f);
                GUI.DrawTexture(errorPanel, Texture2D.whiteTexture);
                GUI.color = Color.white;
                GUI.Label(new Rect(42, 42, 480, 26), "SurgiSim Unity OT is still initializing.");
                GUI.Label(new Rect(42, 72, 480, 44), startupError ?? "Preparing operating theater scene...");
                return;
            }

            var panel = new Rect(22, 22, 470, 152);
            GUI.color = new Color(0.02f, 0.05f, 0.07f, 0.86f);
            GUI.DrawTexture(panel, Texture2D.whiteTexture);
            GUI.color = Color.white;
            GUI.Label(new Rect(42, 38, 430, 24), "SurgiSim Unity OT - Laparoscopic Cholecystectomy");
            GUI.Label(new Rect(42, 66, 430, 24), $"Scene: {anatomyModes[anatomyMode]} | Step {currentStep + 1}/6: {stepTitles[currentStep]}");
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

            if (GUI.Button(new Rect(224, 132, 92, 26), "Gall"))
            {
                SetAnatomyMode(0);
            }

            if (GUI.Button(new Rect(324, 132, 82, 26), "Heart"))
            {
                SetAnatomyMode(1);
            }

            if (GUI.Button(new Rect(414, 132, 82, 26), "Abd"))
            {
                SetAnatomyMode(2);
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
            gallbladderRoot = new GameObject("Gall bladder procedure anatomy mode");
            anatomyRoots.Add(gallbladderRoot);

            patientTorso = CreateEllipsoid("Breathing patient torso", new Vector3(0, 1.04f, 0.08f), new Vector3(0.72f, 0.45f, 1.1f), skinMaterial);
            CreateEllipsoid("Patient head", new Vector3(0, 1.16f, -1.3f), new Vector3(0.34f, 0.28f, 0.34f), skinMaterial);
            CreateEllipsoid("Left arm secured", new Vector3(-0.78f, 0.93f, -0.05f), new Vector3(0.14f, 0.14f, 0.72f), skinMaterial).transform.rotation = Quaternion.Euler(0, 0, 11f);
            CreateEllipsoid("Right arm secured", new Vector3(0.78f, 0.93f, -0.05f), new Vector3(0.14f, 0.14f, 0.72f), skinMaterial).transform.rotation = Quaternion.Euler(0, 0, -11f);

            ParentTo(CreateBox("Fenestrated sterile drape", new Vector3(0, 1.31f, 0.08f), new Vector3(2.7f, 0.025f, 2.65f), drapeMaterial), gallbladderRoot);
            ParentTo(CreateTorusProxy("Abdominal surgical opening", new Vector3(0, 1.345f, 0.07f), new Vector3(0.88f, 0.04f, 0.62f), drapeMaterial), gallbladderRoot);
            abdomenSurface = BuildAbdomenMesh();
            ParentTo(abdomenSurface, gallbladderRoot);

            var liver = CreateEllipsoid("Liver model", new Vector3(-0.1f, 1.55f, -0.23f), new Vector3(0.42f, 0.22f, 0.28f), liverMaterial);
            liver.transform.rotation = Quaternion.Euler(0, 0, -8f);
            ParentTo(liver, gallbladderRoot);
            gallbladder = CreateEllipsoid("Gall bladder target", new Vector3(0.26f, 1.57f, -0.2f), new Vector3(0.12f, 0.24f, 0.1f), gallbladderMaterial);
            gallbladder.transform.rotation = Quaternion.Euler(0, 0, -24f);
            ParentTo(gallbladder, gallbladderRoot);
            ParentTo(CreateCylinderBetween("Cystic duct", new Vector3(0.18f, 1.53f, -0.06f), new Vector3(0.45f, 1.51f, 0.14f), 0.018f, wetTissueMaterial), gallbladderRoot);

            foreach (var port in new[] { new Vector3(-0.38f, 1.38f, 0.28f), new Vector3(0.42f, 1.38f, 0.18f), new Vector3(0.03f, 1.38f, 0.58f) })
            {
                ParentTo(CreateTorusProxy("Metal trocar port", port, new Vector3(0.18f, 0.025f, 0.18f), metalMaterial), gallbladderRoot);
            }
        }

        private void BuildHeartAnatomyMode()
        {
            heartRoot = new GameObject("Heart anatomy visual mode");
            anatomyRoots.Add(heartRoot);

            ParentTo(CreateBox("Open chest sterile drape", new Vector3(0, 1.31f, -0.28f), new Vector3(2.45f, 0.025f, 2.2f), drapeMaterial), heartRoot);
            ParentTo(CreateTorusProxy("Sternotomy opening", new Vector3(0, 1.36f, -0.3f), new Vector3(0.66f, 0.028f, 0.42f), wetTissueMaterial), heartRoot);

            for (var i = -3; i <= 3; i++)
            {
                var rib = CreateTorusProxy("Rib arc", new Vector3(i * 0.13f, 1.46f, -0.28f), new Vector3(0.5f, 0.01f, 0.18f), PbrMaterial("Bone ivory", new Color(0.86f, 0.82f, 0.72f), 0, 0.38f, null));
                rib.transform.rotation = Quaternion.Euler(0, 0, 90f);
                ParentTo(rib, heartRoot);
            }

            var heart = CreateEllipsoid("Beating heart full model", new Vector3(0, 1.58f, -0.28f), new Vector3(0.36f, 0.45f, 0.28f), PbrMaterial("Cardiac muscle wet", new Color(0.62f, 0.06f, 0.13f), 0, 0.1f, MakeNoiseTexture(new Color(0.3f, 0.02f, 0.05f), new Color(0.9f, 0.18f, 0.22f), 256, 41)));
            heart.transform.rotation = Quaternion.Euler(0, 0, -12f);
            ParentTo(heart, heartRoot);
            ParentTo(CreateEllipsoid("Left ventricle", new Vector3(-0.12f, 1.55f, -0.24f), new Vector3(0.22f, 0.32f, 0.18f), wetTissueMaterial), heartRoot);
            ParentTo(CreateEllipsoid("Right ventricle", new Vector3(0.15f, 1.53f, -0.25f), new Vector3(0.2f, 0.28f, 0.16f), PbrMaterial("Right ventricle", new Color(0.48f, 0.04f, 0.1f), 0, 0.12f, null)), heartRoot);
            ParentTo(CreateCylinderBetween("Aorta", new Vector3(0.02f, 1.86f, -0.29f), new Vector3(0.22f, 2.18f, -0.2f), 0.052f, PbrMaterial("Aorta red vessel", new Color(0.78f, 0.04f, 0.08f), 0, 0.12f, null)), heartRoot);
            ParentTo(CreateCylinderBetween("Pulmonary artery", new Vector3(-0.1f, 1.82f, -0.29f), new Vector3(-0.36f, 2.05f, -0.22f), 0.045f, PbrMaterial("Pulmonary blue vessel", new Color(0.1f, 0.32f, 0.72f), 0, 0.14f, null)), heartRoot);

            foreach (var offset in new[] { -0.18f, 0.02f, 0.2f })
            {
                ParentTo(CreateCylinderBetween("Coronary artery path", new Vector3(offset, 1.67f, -0.02f), new Vector3(offset + 0.11f, 1.42f, -0.06f), 0.012f, PbrMaterial("Coronary vessel", new Color(0.92f, 0.2f, 0.12f), 0, 0.18f, null)), heartRoot);
            }

            ParentTo(CreateEllipsoid("Left lung", new Vector3(-0.58f, 1.52f, -0.3f), new Vector3(0.22f, 0.48f, 0.18f), TransparentMaterial("Translucent lung left", new Color(0.82f, 0.36f, 0.42f, 0.38f), 0, 0.18f)), heartRoot);
            ParentTo(CreateEllipsoid("Right lung", new Vector3(0.58f, 1.52f, -0.3f), new Vector3(0.22f, 0.48f, 0.18f), TransparentMaterial("Translucent lung right", new Color(0.82f, 0.36f, 0.42f, 0.38f), 0, 0.18f)), heartRoot);
        }

        private void BuildUpperAbdomenMode()
        {
            abdomenAtlasRoot = new GameObject("Upper abdomen multi-organ visual mode");
            anatomyRoots.Add(abdomenAtlasRoot);

            ParentTo(CreateBox("Upper abdomen exposure drape", new Vector3(0, 1.31f, 0.08f), new Vector3(2.7f, 0.025f, 2.65f), drapeMaterial), abdomenAtlasRoot);
            ParentTo(CreateTorusProxy("Upper abdomen opening", new Vector3(0, 1.36f, 0.03f), new Vector3(0.92f, 0.03f, 0.68f), wetTissueMaterial), abdomenAtlasRoot);
            ParentTo(CreateEllipsoid("Complete stomach", new Vector3(-0.28f, 1.56f, -0.16f), new Vector3(0.42f, 0.24f, 0.27f), PbrMaterial("Stomach wall", new Color(0.72f, 0.26f, 0.2f), 0, 0.16f, MakeNoiseTexture(new Color(0.34f, 0.08f, 0.05f), new Color(0.92f, 0.42f, 0.3f), 256, 47))), abdomenAtlasRoot);
            ParentTo(CreateCylinderBetween("Esophagus", new Vector3(-0.34f, 1.7f, -0.34f), new Vector3(-0.32f, 1.98f, -0.48f), 0.04f, wetTissueMaterial), abdomenAtlasRoot);
            ParentTo(CreateCylinderBetween("Duodenum curve", new Vector3(0.05f, 1.54f, -0.1f), new Vector3(0.42f, 1.5f, 0.12f), 0.045f, PbrMaterial("Duodenum", new Color(0.85f, 0.52f, 0.31f), 0, 0.22f, null)), abdomenAtlasRoot);
            ParentTo(CreateEllipsoid("Pancreas", new Vector3(0.08f, 1.44f, 0.12f), new Vector3(0.42f, 0.1f, 0.08f), PbrMaterial("Pancreas", new Color(0.9f, 0.66f, 0.42f), 0, 0.32f, null)), abdomenAtlasRoot);
            ParentTo(CreateEllipsoid("Spleen", new Vector3(-0.66f, 1.57f, -0.12f), new Vector3(0.16f, 0.28f, 0.12f), PbrMaterial("Spleen", new Color(0.33f, 0.04f, 0.12f), 0, 0.14f, null)), abdomenAtlasRoot);
            ParentTo(CreateEllipsoid("Segmented liver", new Vector3(0.12f, 1.68f, -0.24f), new Vector3(0.56f, 0.26f, 0.28f), liverMaterial), abdomenAtlasRoot);
            ParentTo(CreateEllipsoid("Gall bladder under liver", new Vector3(0.46f, 1.57f, -0.17f), new Vector3(0.1f, 0.22f, 0.08f), gallbladderMaterial), abdomenAtlasRoot);
            ParentTo(CreateCylinderBetween("Common bile duct", new Vector3(0.42f, 1.53f, -0.08f), new Vector3(0.24f, 1.48f, 0.18f), 0.016f, PbrMaterial("Bile duct", new Color(0.82f, 0.72f, 0.36f), 0, 0.18f, null)), abdomenAtlasRoot);
            ParentTo(CreateTorusProxy("Transverse colon", new Vector3(0, 1.37f, 0.42f), new Vector3(0.72f, 0.035f, 0.14f), PbrMaterial("Colon", new Color(0.72f, 0.4f, 0.25f), 0, 0.34f, null)), abdomenAtlasRoot);
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
            if (emergencyCameraObject != null)
            {
                Destroy(emergencyCameraObject);
            }

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

        private void BuildEmergencyCamera()
        {
            if (Camera.main != null)
            {
                return;
            }

            emergencyCameraObject = new GameObject("SurgiSim startup fallback camera");
            emergencyCameraObject.transform.position = new Vector3(0, 1.6f, 3.4f);
            emergencyCameraObject.transform.rotation = Quaternion.Euler(16f, 180f, 0);
            var camera = emergencyCameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.02f, 0.05f, 0.07f);
            camera.fieldOfView = 58f;
            camera.nearClipPlane = 0.04f;
            camera.farClipPlane = 60f;
            emergencyCameraObject.AddComponent<AudioListener>();
        }

        private void SetStep(int step)
        {
            if (gallbladder == null || bloodPool == null || specimenBag == null || smokeSystem == null || dropletSystem == null)
            {
                return;
            }

            if (step == currentStep && clips.Count > 0)
            {
                return;
            }

            currentStep = step;
            var gallbladderMode = anatomyMode == 0;
            gallbladder.transform.localScale = step >= 5 ? new Vector3(0.08f, 0.16f, 0.07f) : new Vector3(0.12f, 0.24f, 0.1f);
            bloodPool.SetActive(gallbladderMode && step >= 2);
            bloodPool.transform.localScale = Vector3.one * Mathf.Lerp(0.45f, 1.2f, step / 5f);
            specimenBag.SetActive(gallbladderMode && step >= 5);

            foreach (var clip in clips)
            {
                Destroy(clip);
            }
            clips.Clear();

            if (step >= 3)
            {
                var ductClip = CreateBox("Gold cystic duct clip", new Vector3(0.21f, 1.56f, -0.02f), new Vector3(0.13f, 0.025f, 0.035f), PbrMaterial("Gold clip", new Color(1f, 0.78f, 0.18f), 1f, 0.16f, null));
                var arteryClip = CreateBox("Gold cystic artery clip", new Vector3(0.32f, 1.55f, 0.04f), new Vector3(0.13f, 0.025f, 0.035f), PbrMaterial("Gold clip 2", new Color(1f, 0.78f, 0.18f), 1f, 0.16f, null));
                ParentTo(ductClip, gallbladderRoot);
                ParentTo(arteryClip, gallbladderRoot);
                clips.Add(ductClip);
                clips.Add(arteryClip);
            }

            foreach (var mark in charringMarks)
            {
                mark.SetActive(step >= 4);
            }

            var smokeEmission = smokeSystem.emission;
            smokeEmission.rateOverTime = gallbladderMode && step >= 4 ? 28f : 0;
            if (gallbladderMode && step >= 4 && !smokeSystem.isPlaying) smokeSystem.Play();
            if (!gallbladderMode || step < 4) smokeSystem.Stop();

            var dropletEmission = dropletSystem.emission;
            dropletEmission.rateOverTime = gallbladderMode && step >= 2 && step <= 4 ? 6f : 0;
            if (gallbladderMode && step >= 2 && step <= 4 && !dropletSystem.isPlaying) dropletSystem.Play();
            if (!gallbladderMode || step < 2 || step > 4) dropletSystem.Stop();
        }

        private void SetAnatomyMode(int mode)
        {
            anatomyMode = Mathf.Clamp(mode, 0, anatomyRoots.Count - 1);

            for (var i = 0; i < anatomyRoots.Count; i++)
            {
                if (anatomyRoots[i] != null)
                {
                    anatomyRoots[i].SetActive(i == anatomyMode);
                }
            }

            var gallbladderMode = anatomyMode == 0;
            if (bloodPool != null) bloodPool.SetActive(gallbladderMode && currentStep >= 2);
            if (specimenBag != null) specimenBag.SetActive(gallbladderMode && currentStep >= 5);
            if (leftTool != null) leftTool.SetActive(gallbladderMode);
            if (rightTool != null) rightTool.SetActive(gallbladderMode);
            if (smokeSystem != null)
            {
                var emission = smokeSystem.emission;
                emission.rateOverTime = gallbladderMode && currentStep >= 4 ? 28f : 0f;
            }
            if (dropletSystem != null)
            {
                var emission = dropletSystem.emission;
                emission.rateOverTime = gallbladderMode && currentStep >= 2 && currentStep <= 4 ? 6f : 0f;
            }

            if (firstPersonCamera != null)
            {
                firstPersonCamera.transform.position = anatomyMode switch
                {
                    1 => new Vector3(0, 1.82f, 2.44f),
                    2 => new Vector3(0, 1.76f, 2.64f),
                    _ => new Vector3(0, 1.72f, 2.72f)
                };
            }
        }

        private void AnimatePatient()
        {
            if (patientTorso == null)
            {
                return;
            }

            var breath = 1f + Mathf.Sin(Time.time * 2.1f) * 0.025f;
            patientTorso.transform.localScale = new Vector3(0.72f, 0.45f * breath, 1.1f);
            if (firstPersonCamera != null)
            {
                var target = anatomyMode switch
                {
                    1 => new Vector3(0, 1.58f, -0.3f),
                    2 => new Vector3(0, 1.56f, -0.05f),
                    _ => new Vector3(0, 1.42f, -0.05f)
                };
                firstPersonCamera.transform.LookAt(target);
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
            if (leftTool == null || rightTool == null || cauteryGlow == null)
            {
                return;
            }

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
            var shader = ResolveRuntimeShader();
            var material = new Material(shader) { name = name };
            SetMaterialColor(material, color);
            SetMaterialFloat(material, "_Metallic", metallic);
            SetMaterialFloat(material, "_Smoothness", 1f - smoothness);
            SetMaterialFloat(material, "_Glossiness", 1f - smoothness);
            if (texture != null)
            {
                SetMaterialTexture(material, "_BaseMap", texture);
                SetMaterialTexture(material, "_MainTex", texture);
            }
            return material;
        }

        private Material TransparentMaterial(string name, Color color, float metallic, float smoothness)
        {
            var material = PbrMaterial(name, color, metallic, smoothness, null);
            SetMaterialFloat(material, "_Mode", 3);
            SetMaterialFloat(material, "_Surface", 1);
            SetMaterialInt(material, "_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            SetMaterialInt(material, "_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            SetMaterialInt(material, "_ZWrite", 0);
            material.DisableKeyword("_ALPHATEST_ON");
            material.EnableKeyword("_ALPHABLEND_ON");
            material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            material.renderQueue = 3000;
            return material;
        }

        private Shader ResolveRuntimeShader()
        {
            if (runtimeShader != null)
            {
                return runtimeShader;
            }

            foreach (var shaderName in new[]
            {
                "Universal Render Pipeline/Lit",
                "Universal Render Pipeline/Simple Lit",
                "Standard",
                "Unlit/Texture",
                "Unlit/Color",
                "Sprites/Default"
            })
            {
                runtimeShader = Shader.Find(shaderName);
                if (runtimeShader != null)
                {
                    return runtimeShader;
                }
            }

            var probe = GameObject.CreatePrimitive(PrimitiveType.Cube);
            probe.name = "Runtime shader probe";
            var renderer = probe.GetComponent<Renderer>();
            runtimeShader = renderer != null && renderer.sharedMaterial != null ? renderer.sharedMaterial.shader : null;
            Destroy(probe);

            if (runtimeShader == null)
            {
                throw new System.InvalidOperationException("No Unity runtime shader is available for generated operating theater materials.");
            }

            return runtimeShader;
        }

        private static void SetMaterialColor(Material material, Color color)
        {
            if (material.HasProperty("_BaseColor"))
            {
                material.SetColor("_BaseColor", color);
            }

            if (material.HasProperty("_Color"))
            {
                material.SetColor("_Color", color);
            }
        }

        private static void SetMaterialFloat(Material material, string property, float value)
        {
            if (material.HasProperty(property))
            {
                material.SetFloat(property, value);
            }
        }

        private static void SetMaterialInt(Material material, string property, int value)
        {
            if (material.HasProperty(property))
            {
                material.SetInt(property, value);
            }
        }

        private static void SetMaterialTexture(Material material, string property, Texture texture)
        {
            if (material.HasProperty(property))
            {
                material.SetTexture(property, texture);
            }
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

        private static void ParentTo(GameObject child, GameObject parent)
        {
            if (child != null && parent != null)
            {
                child.transform.SetParent(parent.transform, true);
            }
        }
    }
}
