import{S as b,C as $,T as L,U as C,V as D,p as j,G as S,N as T,l as p,m as E,q as v,o as M}from"./iframe-bdiQT3di.js";import{g as q,i as w,h as A}from"./create-runtime-stories-CnfPsNpB.js";import{a as _,s as F}from"./mode-toggle-CFeT7B_O.js";import"./preload-helper-PPVm8Dsz.js";function h(i,f,o){b(()=>{var e=$(()=>f(i,o?.())||{});if(o&&e?.update){var s=!1,n={};L(()=>{var r=o();C(r),s&&D(n,r)&&(n=r,e.update(r))}),s=!0}if(e?.destroy)return()=>e.destroy()})}const G={title:"App/ModeToggle",component:_,parameters:{layout:"centered"}},{Story:k}=A();var N=v('<div class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"><!></div>'),O=v('<div class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"><!></div>'),R=v("<!> <!>",1);function y(i,f){j(f,!1);function o(a){typeof document>"u"||(document.documentElement.classList.toggle("dark",a==="dark"),document.documentElement.style.colorScheme=a,F(a))}function e(a,d){return o(d),{update(c){o(c)}}}w();var s=R(),n=S(s);k(n,{name:"Light",args:{forcedMode:"light"},template:(d,c)=>{let l=()=>c?.().forcedMode;var t=N(),m=M(t);_(m,{}),h(t,(g,u)=>e?.(g,u),l),p(d,t)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div
	use:forceMode={forcedMode}
	class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
>
	<ModeToggle />
</div>`}}});var r=T(n,2);k(r,{name:"Dark",args:{forcedMode:"dark"},template:(d,c)=>{let l=()=>c?.().forcedMode;var t=O(),m=M(t);_(m,{}),h(t,(g,u)=>e?.(g,u),l),p(d,t)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div
	use:forceMode={forcedMode}
	class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
>
	<ModeToggle />
</div>`}}}),p(i,s),E()}y.__docgen={data:[],name:"mode-toggle.stories.svelte"};const x=q(y,G),H=["Light","Dark"],I={...x.Light,tags:["svelte-csf-v5"]},J={...x.Dark,tags:["svelte-csf-v5"]};export{J as Dark,I as Light,H as __namedExportsOrder,G as default};
