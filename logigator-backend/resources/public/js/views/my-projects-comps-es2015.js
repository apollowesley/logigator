"use strict";function projectComponentList(){const t=document.querySelector(".view-my-projects-comps").getAttribute("data-type"),e=document.querySelector(".view-my-projects-comps__popup-container"),o=document.querySelector(".view-my-projects-comps__list"),c=document.querySelectorAll(".view-my-projects-comps__page-button"),n=[0,0,0,0,0,0,0];let i,a;function r(){const t=document.querySelector(".partial-project-comp-list"),e=Number(Bem.data(t,"total-pages"));let o,i;a=Number(Bem.data(t,"current-page")),n[0]=a>0?0:void 0,n[1]=a>0?a-1:void 0,n[2]=void 0,n[3]=void 0,n[4]=void 0,0===a?(o=0,i=e>3?3:e-1):a===e-1?(o=Math.max(e-3,0),i=e-1):(o=a-1,i=a+1);for(let t=o,e=2;t<=i;t++,e++)n[e]=t;n[5]=a<e-1?a+1:void 0,n[6]=a<e-1?e-1:void 0,c.forEach((t,e)=>{e<=1||e>=5?t.disabled=void 0===n[e]:(Bem.setState(t,"hidden",void 0===n[e]),Bem.setState(t,"active",n[e]===a),t.innerHTML=n[e]+1)})}async function p(e,c){const n={page:e};void 0!==c&&""!==c&&(n.search=c);const i=new URLSearchParams(n).toString(),a=await fetch("/my/".concat(t,"/page?").concat(i));o.innerHTML=await a.text();const p=[location.protocol,"//",location.host,location.pathname].join("");window.history.pushState({},"",p+"?"+i),r(),s()}function s(){o.querySelectorAll(".partial-project-comp-list__icon-info").forEach(o=>{o.addEventListener("click",()=>{const c=o.parentElement.getAttribute("data-id");openDynamicPopup("/my/".concat(t,"/info/").concat(c),e)})}),o.querySelectorAll(".partial-project-comp-list__icon-edit").forEach(o=>{o.addEventListener("click",()=>{const c=o.parentElement.getAttribute("data-id");openDynamicPopup("/my/".concat(t,"/edit-popup/").concat(c),e)})}),o.querySelectorAll(".partial-project-comp-list__icon-new").forEach(o=>{o.addEventListener("click",()=>{openDynamicPopup("/my/".concat(t,"/create-popup"),e)})})}r(),c.forEach((t,e)=>{t.addEventListener("click",()=>{void 0===n[e]||Bem.hasState(t,"active")||p(n[e],i)})}),function(){const t=document.getElementById("view-my-projects-comps__search"),e=debounceFunction(()=>{i=t.value,p(0,i)},400);t.addEventListener("input",e)}(),s()}projectComponentList();
//# sourceMappingURL=my-projects-comps-es2015.js.map
