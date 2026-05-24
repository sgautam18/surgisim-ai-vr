using System.IO;
using SurgiSim.UnityVisualization;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace SurgiSim.UnityVisualization.Editor
{
    public static class SurgiSimSceneBuilder
    {
        [MenuItem("SurgiSim/Build Operating Theater Scene")]
        public static void BuildOperatingTheaterScene()
        {
            ConfigureZAnatomyImporters();

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "SurgiSimOperatingTheater";

            var runtime = new GameObject("SurgiSim OT Runtime");
            runtime.AddComponent<SurgiSimOperatingTheater>();

            Directory.CreateDirectory("Assets/SurgiSimUnity/Scenes");
            EditorSceneManager.SaveScene(scene, "Assets/SurgiSimUnity/Scenes/SurgiSimOperatingTheater.unity");

            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene("Assets/SurgiSimUnity/Scenes/SurgiSimOperatingTheater.unity", true)
            };

            Debug.Log("SurgiSim Unity operating theater scene generated.");
        }

        private static void ConfigureZAnatomyImporters()
        {
            const string root = "Assets/SurgiSimUnity/Resources/ZAnatomy/FBX";
            if (!Directory.Exists(root))
            {
                return;
            }

            foreach (var assetGuid in AssetDatabase.FindAssets("t:Model", new[] { root }))
            {
                var path = AssetDatabase.GUIDToAssetPath(assetGuid);
                if (AssetImporter.GetAtPath(path) is not ModelImporter importer)
                {
                    continue;
                }

                importer.importAnimation = false;
                importer.importBlendShapes = false;
                importer.importCameras = false;
                importer.importLights = false;
                importer.meshCompression = ModelImporterMeshCompression.Medium;
                importer.optimizeMeshPolygons = true;
                importer.optimizeMeshVertices = true;
                importer.materialImportMode = ModelImporterMaterialImportMode.ImportStandard;
                importer.SaveAndReimport();
            }
        }

        [MenuItem("SurgiSim/Build macOS Demo App")]
        public static void BuildMacDemoApp()
        {
            BuildOperatingTheaterScene();

            Directory.CreateDirectory("Builds");
            EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Standalone, BuildTarget.StandaloneOSX);

            var report = BuildPipeline.BuildPlayer(
                new[] { "Assets/SurgiSimUnity/Scenes/SurgiSimOperatingTheater.unity" },
                "Builds/SurgiSimUnityOT.app",
                BuildTarget.StandaloneOSX,
                BuildOptions.None);

            Debug.Log($"SurgiSim macOS demo build completed with result: {report.summary.result}");
        }
    }
}
