import {
  AbstractMesh,
  ArcRotateCamera,
  CannonJSPlugin,
  Color3,
  Engine,
  HemisphericLight,
  Mesh,
  Scene,
  Vector3,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  GUI3DManager,
  HolographicButton,
  TextBlock,
} from "@babylonjs/gui";
import "./style/style.scss";

window.addEventListener("DOMContentLoaded", async () => {
  const renderCanvas = <HTMLCanvasElement>(
    document.getElementById("renderCanvas")
  );

  if (renderCanvas) {
    const engine = new Engine(renderCanvas, true, {});
    const scene = new Scene(engine);

    scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2,
      0.5,
      Vector3.Zero(),
      scene,
      true
    );
    camera.attachControl();
    camera.minZ = 0.001;

    var light = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    light.intensity = 1.0;

    // 3d button settings

    const anchor = new AbstractMesh("anchor", scene);
    anchor.scaling = new Vector3(2, 2, 2);
    anchor.position = new Vector3(0, 0, 0);

    const manager = new GUI3DManager(scene);

    const button = new HolographicButton("button");
    button.linkToTransformNode(anchor);
    manager.addControl(button);
    button.text = "Button";
    button.imageUrl =
      "https://www.babylonjs-playground.com/textures/icons/Settings.png";
    button.position = new Vector3(0, 0, 1);
    button.scaling = new Vector3(0.15, 0.15, 0.3);
    button.tooltipText = "Holographic\nButton";
    button.backMaterial.albedoColor = new Color3(0.12, 0.171, 0.55);

    button.pointerDownAnimation = () => {
      button.scaling = new Vector3(0.15, 0.15, 0.15);
    };
    button.pointerUpAnimation = () => {
      button.scaling = new Vector3(0.15, 0.15, 0.3);
    };

    // 3d log text config

    const logPlane = Mesh.CreatePlane("logPlane", 2, scene);
    logPlane.position = new Vector3(0, 0.3, 1);
    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(logPlane, 1024, 1024);

    const logTextBlock = new TextBlock("logTextBlock", "no log");
    logTextBlock.color = "white";
    logTextBlock.text = "hogeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    advancedTexture.addControl(logTextBlock);

    const videoElement = <HTMLVideoElement>document.getElementById("video");
    videoElement.autoplay = true;
    const videoCanvas = <HTMLCanvasElement>(
      document.getElementById("videoCapture")
    );

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        videoElement.srcObject = stream;
        setTimeout(() => {
          videoCanvas.width = 1270;
          videoCanvas.height = 720;
          button.imageUrl = videoCanvas.toDataURL();
        }, 2000);
      });

    navigator.mediaDevices.enumerateDevices().then((infos) => {
      console.log(infos);
    });

    button.onPointerDownObservable.add(() => {
      videoCanvas.getContext("2d")!.drawImage(videoElement, 0, 0, 1270, 720);
      button.imageUrl = videoCanvas.toDataURL();
    });

    // webxr settings

    await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "unbounded",
      },
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });
  }
});
