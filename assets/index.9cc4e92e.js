import{E as n,S as e,A as t,V as o,H as a,a as i,G as s,b as r,C as d}from"./vendor.eb4f7706.js";window.addEventListener("DOMContentLoaded",(async()=>{const c=document.getElementById("renderCanvas");if(c){const w=new n(c,!0,{}),l=new e(w),p=new t("camera",-Math.PI/2,Math.PI/2,1,o.Zero(),l,!0);p.attachControl(),p.minZ=.001,new a("light1",new o(1,1,0),l).intensity=1;const m=new i("anchor",l);m.scaling=new o(1,1,1),m.position=new o(0,0,0);const g=new s(l),u=new r("button");u.linkToTransformNode(m),g.addControl(u),u.text="Button",u.imageUrl="https://www.babylonjs-playground.com/textures/icons/Settings.png",u.position.z=2,u.scaling=new o(1,1,2),u.tooltipText="Holographic\nButton",u.backMaterial.albedoColor=new d(.12,.171,.55),u.pointerDownAnimation=()=>{u.scaling=new o(1,1,1.5)},u.pointerUpAnimation=()=>{u.scaling=new o(1,1,2)},u.onPointerClickObservable.add((()=>{u.text+="!"})),await l.createDefaultXRExperienceAsync({uiOptions:{sessionMode:"immersive-ar",referenceSpaceType:"unbounded"}}),w.runRenderLoop((()=>{l.render()})),window.addEventListener("resize",(()=>{w.resize()}))}}));
