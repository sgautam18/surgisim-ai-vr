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
