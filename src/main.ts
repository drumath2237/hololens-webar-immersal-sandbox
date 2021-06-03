import {
  AbstractMesh,
  CannonJSPlugin,
  Color3,
  DeviceOrientationCamera,
  Engine,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene,
  SceneLoader,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  GUI3DManager,
  HolographicButton,
  TextBlock,
} from "@babylonjs/gui";
import "./style/style.scss";

import CameraIntrinsics from "./types/hololens-camera";
import * as ImmersalAPI from "./types/immersal-api";

import roomModelURL from "/models/room.babylon?url";

window.addEventListener("DOMContentLoaded", async () => {
  const renderCanvas = <HTMLCanvasElement>(
    document.getElementById("renderCanvas")
  );

  if (renderCanvas) {
    const engine = new Engine(renderCanvas, true, {});
    const scene = new Scene(engine);

    scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());

    // const camera = new ArcRotateCamera(
    //   "camera",
    //   -Math.PI / 2,
    //   Math.PI / 2,
    //   0.5,
    //   Vector3.Zero(),
    //   scene,
    //   true
    // );
    // camera.attachControl();
    // camera.minZ = 0.001;

    const camera = new DeviceOrientationCamera(
      "dev-ori",
      Vector3.Zero(),
      scene
    );
    camera.minZ = 0.01;

    var light = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    light.intensity = 0.5;

    // ==========================================
    // glb model import
    // ==========================================

    let rootMesh = Mesh.CreateBox("rootBox", 1);
    rootMesh.isVisible = false;
    rootMesh.position = Vector3.Zero();
    rootMesh.rotation = Quaternion.Identity().toEulerAngles();

    SceneLoader.AppendAsync(
      roomModelURL.replace("room.babylon", ""),
      "room.babylon",
      scene
    ).then((loadedScene) => {
      loadedScene.meshes.forEach((mesh) => {
        mesh.enablePointerMoveEvents = false;
        if (mesh.name === "__root__") {
          mesh.setParent(rootMesh);
        }
        if (mesh.material) {
          mesh.material.backFaceCulling = false;
        }
      });
    });

    // ==========================================
    // 3d button settings
    // ==========================================

    const anchor = new AbstractMesh("anchor", scene);
    anchor.scaling = new Vector3(2, 2, 2);
    anchor.position = new Vector3(1, -0.5, 0);

    const manager = new GUI3DManager(scene);

    const button = new HolographicButton("button");
    button.linkToTransformNode(anchor);
    manager.addControl(button);
    button.text = "Button";
    button.imageUrl =
      "https://www.babylonjs-playground.com/textures/icons/Settings.png";
    button.position = new Vector3(0, -0.5, 1);
    button.scaling = new Vector3(0.15, 0.15, 0.3);
    button.tooltipText = "Holographic\nButton";
    button.backMaterial.albedoColor = new Color3(0.12, 0.171, 0.55);

    button.pointerDownAnimation = () => {
      button.scaling = new Vector3(0.15, 0.15, 0.15);
    };
    button.pointerUpAnimation = () => {
      button.scaling = new Vector3(0.15, 0.15, 0.3);
    };

    // ==========================================
    // 3d log text config
    // ==========================================

    const logPlane = Mesh.CreatePlane("logPlane", 2, scene);
    logPlane.position = new Vector3(0.3, -0.3, 1);
    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(
      logPlane,
      1024,
      1024
    );

    const logTextBlock = new TextBlock("logTextBlock", "no log");
    logTextBlock.color = "white";
    logTextBlock.text = "log text";
    logTextBlock.resizeToFit = true;
    advancedTexture.addControl(logTextBlock);

    // ==========================================
    // webxr settings
    // ==========================================

    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "unbounded",
      },
    });

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
        videoCanvas.width = 1270;
        videoCanvas.height = 720;
      });

    // ==========================================
    // immersal rest api fetch
    // ==========================================
    const testCube = MeshBuilder.CreateBox("testCube", { size: 0.05 }, scene);
    const material = new StandardMaterial("mat", scene);
    material.diffuseColor = new Color3(2, 0, 0);
    material.backFaceCulling = true;
    testCube.material = material;
    testCube.scaling.z *= 2;
    // testCube.isVisible = false;

    testCube.onBeforeRenderObservable.add(() => {
      // const direction = xr.baseExperience.camera
      //   .getForwardRay()
      //   .direction.clone();
      // testCube.rotation.x = -direction.y;
      // testCube.rotation.y = direction.x;
      // const rot = xr.baseExperience.camera.rotationQuaternion.toEulerAngles();
      // logTextBlock.text = `${rot}`;
    });

    window.ondeviceorientation = (ev) => {
      if (ev.alpha && ev.beta && ev.gamma) {
        testCube.rotation = new Vector3(ev.alpha, ev.beta, ev.gamma);
      }
    };

    button.onPointerDownObservable.add(() => {
      videoCanvas.getContext("2d")!.drawImage(videoElement, 0, 0, 1270, 720);
      const imageURL = videoCanvas.toDataURL();

      button.imageUrl = imageURL;

      button.text += "!";
      const req: ImmersalAPI.ImmersalLocalizeRequest = {
        token: <string>process.env.IMMERSAL_TOKEN,
        fx: CameraIntrinsics.focalLength.x,
        fy: CameraIntrinsics.focalLength.y,
        ox: CameraIntrinsics.principalOffset.x,
        oy: CameraIntrinsics.principalOffset.y,
        b64: imageURL.replace("data:image/png;base64,", ""),
        mapIds: [{ id: Number(<string>process.env.MAP_ID) }],
      };

      const positionWhenRequest = xr.baseExperience.camera.globalPosition;
      const rotationWhenRequest = xr.baseExperience.camera.rotationQuaternion
        .toEulerAngles()
        .clone(); //cameraQuaternion.toEulerAngles();

      const cameraTransformMatrix = scene.activeCamera?.getWorldMatrix();
      if(!cameraTransformMatrix) return;

      let rotMatrixWhenRequest = new Matrix(); //.RotationYawPitchRoll(
      //   rotationWhenRequest.y,
      //   rotationWhenRequest.x,
      //   rotationWhenRequest.z
      // );
      Quaternion.FromEulerVector(rotationWhenRequest).toRotationMatrix(
        rotMatrixWhenRequest
      );

      {
        // ================ test with dummy data =================
        // const res = {
        //   error: "none",
        //   success: true,
        //   map: 1,
        //   px: -0.82981,
        //   py: 0.3349169,
        //   pz: -1.38664,
        //   r00: 0.33488,
        //   r01: -0.437701,
        //   r02: 0.834428,
        //   r10: 0.9195104,
        //   r11: -0.0041612,
        //   r12: -0.390856,
        //   r20: 0.205801,
        //   r21: 0.898157,
        //   r22: 0.388535,
        // };
        // const m = generateMatrixFromResponse(res);
        // if (m) {
        //   // testCube.position = new Vector3(res.px, res.py, res.pz); //.multiplyByFloats(0.1, 0.1, 0.1);
        //   // testCube.rotation = Quaternion.FromRotationMatrix(m)
        //   //   .conjugate()
        //   //   .toEulerAngles();
        //   // let rotQuaternion = Quaternion.Identity();
        //   // m.decompose(undefined, rotQuaternion, undefined);
        //   // const rotVec = rotQuaternion.conjugate().toEulerAngles(); //Quaternion.FromRotationMatrix(m).toEulerAngles();
        //   // rootMesh.rotation = new Vector3(rotVec.z, rotVec.y, rotVec.x)
        //   // rootMesh.rotate(new Vector3(0,0,1), Math.PI/2, Space.WORLD);
        //   // rootMesh.position = new Vector3(res.px, res.py, res.pz).negate();
        //   // rootMesh.setParent(testCube);
        //   // const cubeMatrix = testCube.getWorldMatrix();
        //   // // cubeMatrix.copyFrom(m.transpose());
        //   // cubeMatrix.multiplyToRef(m.transpose(), cubeMatrix);
        //   // const rootMeshMatrix = rootMesh.getPoseMatrix();
        //   // rootMeshMatrix.multiplyToRef(m.transpose().invert(), rootMeshMatrix);
        //   const scaleNagate = Matrix.FromValues(
        //     -1,0,0,0,
        //     0,-1,0,0,
        //     0,0,-1,0,
        //     0,0,0,1,
        //   );
        //   const transXY =Matrix.FromValues(
        //     0,1,0,0,
        //     -1,0,0,0,
        //     0,0,1,0,
        //     0,0,0,1
        //   );
        //   rootMesh.getDescendants().forEach((node)=>{
        //     const maaa = node.getWorldMatrix();
        //     // maaa.copyFrom(m.transpose().multiply(scaleNagate).invert());
        //     // maaa.toggleModelMatrixHandInPlace();
        //     maaa.multiplyToRef(m.transpose().invert().multiply(transXY), maaa);
        //     const maaMat = (<Mesh>node).material;
        //     if(maaMat){
        //       maaMat.backFaceCulling = false;
        //     }
        //   })
        // }
        // ================ test with dummy data =================
      }

      fetch(ImmersalAPI.immersalLocalizeURL, {
        method: "POST",
        body: JSON.stringify(req),
      })
        .then((res) => res.json())
        .then((data) => {
          let res = <ImmersalAPI.ImmersalLocalizeResponse>data;
          logTextBlock.text = JSON.stringify(res, null, "\t");

          const m = generateMatrixFromResponse(res);
          if (m) {
            const transXY = Matrix.FromValues(
              0,
              1,
              0,
              0,
              -1,
              0,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1
            );

            rootMesh.getDescendants().forEach((node) => {
              // const traNode = <TransformNode>node;
              // if (!traNode) return;

              const worldMatrix = node.getWorldMatrix();

              // traNode.setPivotPoint(Vector3.Zero(), Space.WORLD);

              // const transformMatrix = Matrix.Translation(
              //   positionWhenRequest.x,
              //   positionWhenRequest.y,
              //   positionWhenRequest.z
              // );

              // const negativeTransformMatrix = Matrix.Translation(
              //   -positionWhenRequest.x,
              //   -positionWhenRequest.y,
              //   0
              // );

              worldMatrix.multiplyToRef(
                m
                  .transpose()
                  .invert()
                  .multiply(transXY)
                  // カメラ基準の微調整(せこい)
                  .multiply(
                    Matrix.Translation(
                      0,0,-0.5
                    )
                  )
                  // .multiply(
                  //   Matrix.RotationX(Math.PI/24)
                  // )
                  // .multiply(
                  //   Matrix.RotationZ(
                  //     Math.PI/27
                  //   )
                  // )
                  // .multiply(
                  //   Matrix.RotationY(Math.PI/40)
                  // )
                  .multiply(
                    Matrix.RotationYawPitchRoll(
                      Math.PI/30, Math.PI/21, 0
                    )
                  )
                  .multiply(cameraTransformMatrix)
                  ,
                worldMatrix
              );

              // setTimeout(() => {
              //   setInterval(() => {
              //     const maa = Matrix.RotationY(Math.PI/12);
              //     worldMatrix.multiplyToRef(maa, worldMatrix);
              //   }, 1000);
              // }, 1000);

              // const maaa = node.getWorldMatrix();
              // maaa.multiplyToRef(
              //   m.transpose().invert().multiply(transXY),
              //   // .multiply(
              //   //   Matrix.Translation(
              //   //     positionWhenRequest.x,
              //   //     positionWhenRequest.y,
              //   //     positionWhenRequest.z
              //   //   )
              //   // )
              //   // .multiply(rotMatrixWhenRequest)
              //   maaa
              // );

              // logTextBlock.text = `${rotMatrixWhenRequest.m.join("\n")}`;

              // setTimeout(() => {
              //   setInterval(() => {
              //     traMaaaa.multiplyToRef(Matrix.RotationX(Math.PI / 12), traMaaaa);
              //   }, 1000);
              // }, 1000);
              // rotMatrixWhenRequest.multiplyToRef(
              //   maaa.multiply(m.transpose().invert().multiply(transXY)),
              //   maaa
              // );
            });
          }
        });
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });
  }
});

const generateMatrixFromResponse = (
  res: ImmersalAPI.ImmersalLocalizeResponse
) => {
  if (res.error === "none" && res.success && res.success === true) {
    if (
      res.r00 &&
      res.r01 &&
      res.r02 &&
      res.px &&
      res.px &&
      res.r10 &&
      res.r11 &&
      res.r12 &&
      res.py &&
      res.r20 &&
      res.r21 &&
      res.r22 &&
      res.pz
    ) {
      return Matrix.FromValues(
        res.r00,
        res.r01,
        res.r02,
        res.px,
        res.r10,
        res.r11,
        res.r12,
        res.py,
        res.r20,
        res.r21,
        res.r22,
        res.pz,
        0,
        0,
        0,
        1
      );
    }
  }
  return null;
};
