import{E as e,S as n,A as a,a as t,V as s,H as o,b as r,G as i,c,W as d}from"./vendor.11c590a9.js";window.addEventListener("DOMContentLoaded",(async()=>{const l=document.getElementById("renderCanvas");if(l){const w=new e(l,!0,{}),u=new n(w);u.enablePhysics(null,new a);new t("camera",-Math.PI/2,Math.PI/2,2,s.Zero(),u,!0).attachControl(),new o("light1",new s(0,1,0),u).intensity=1;const b=new r("anchor",u);b.scaling=new s(.1,.1,.1);const p=new i(u),h=new c("button");p.addControl(h),h.linkToTransformNode(b),h.text="button",h.position.z=2,h.scaling=new s(1,1,2),h.onPointerClickObservable.add((()=>{h.text+="!"}));const m=await u.createDefaultXRExperienceAsync({uiOptions:{sessionMode:"immersive-ar",referenceSpaceType:"unbounded"}});m.baseExperience.featuresManager.enableFeature(d.HAND_TRACKING,"latest",{xrInput:m.input,jointMeshes:{enablePhysics:!0}}),w.runRenderLoop((()=>{u.render()})),window.addEventListener("resize",(()=>{w.resize()}))}}));
