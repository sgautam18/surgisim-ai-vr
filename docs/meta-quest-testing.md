# Meta Quest Testing

The fastest headset test path is the web build on GitHub Pages.

## Quest Browser

1. Build and publish the browser app to the `gh-pages` branch.
2. In GitHub, open **Settings > Pages** for `sgautam18/surgisim-ai-vr`.
3. If GitHub asks for a source, set it to **Deploy from a branch**, branch `gh-pages`, folder `/`.
5. On Meta Quest, open Quest Browser.
6. Go to:

```text
https://sgautam18.github.io/surgisim-ai-vr/
```

7. Press **Enter Meta Quest VR** inside the simulator stage.

WebXR requires HTTPS, so GitHub Pages is the right place to test the browser VR version.

## Native Unity Quest Build

Unity Android support is installed locally. The next production path is:

- add OpenXR and XR Interaction Toolkit packages
- switch build target to Android
- enable Quest controller/hand profiles
- add an XR Origin rig
- build an `.apk`
- install to Quest with Meta Quest Developer Hub or `adb`

The current Unity project already contains the visual simulator architecture; the browser deployment is the first headset test, and the Android/OpenXR build is the next native performance pass.
