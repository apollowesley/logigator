"use strict";function projectComponentList(){const e=document.querySelector(".view-my-projects-comps").getAttribute("data-type"),t=document.querySelector(".view-my-projects-comps__popup-container"),o=document.querySelector(".view-my-projects-comps__list"),c=document.querySelectorAll(".view-my-projects-comps__page-button"),n=[0,0,0,0,0,0,0];let a,i;function r(){const e=document.querySelector(".partial-project-comp-list"),t=Number(Bem.data(e,"total-pages"));let o,a;i=Number(Bem.data(e,"current-page")),n[0]=i>0?0:void 0,n[1]=i>0?i-1:void 0,n[2]=void 0,n[3]=void 0,n[4]=void 0,0===i?(o=0,a=t>3?3:t-1):i===t-1?(o=Math.max(t-3,0),a=t-1):(o=i-1,a=i+1);for(let e=o,t=2;e<=a;e++,t++)n[t]=e;n[5]=i<t-1?i+1:void 0,n[6]=i<t-1?t-1:void 0,c.forEach((e,t)=>{t<=1||t>=5?e.disabled=void 0===n[t]:(Bem.setState(e,"hidden",void 0===n[t]),Bem.setState(e,"active",n[t]===i),e.innerHTML=n[t]+1)})}async function p(t,c){const n={page:t};void 0!==c&&""!==c&&(n.search=c);const a=new URLSearchParams(n).toString(),i=await fetch("/my/".concat(e,"/page?").concat(a));o.innerHTML=await i.text();const p=[location.protocol,"//",location.host,location.pathname].join("");window.history.pushState({},"",p+"?"+a),autoAdjustFontSize(o),r(),l()}function l(){o.querySelectorAll(".partial-project-comp-list__icon-info").forEach(o=>{o.addEventListener("click",()=>{const c=o.parentElement.getAttribute("data-id");openDynamicPopup("/my/".concat(e,"/info/").concat(c),t)})}),o.querySelectorAll(".partial-project-comp-list__icon-edit").forEach(o=>{o.addEventListener("click",()=>{const c=o.parentElement.getAttribute("data-id");openDynamicPopup("/my/".concat(e,"/edit-popup/").concat(c),t)})}),o.querySelectorAll(".partial-project-comp-list__icon-new").forEach(o=>{o.addEventListener("click",()=>{openDynamicPopup("/my/".concat(e,"/create-popup"),t)})}),o.querySelectorAll(".partial-project-comp-list__icon-delete").forEach(o=>{o.addEventListener("click",()=>{const c=o.parentElement.getAttribute("data-id");openDynamicPopup("/my/".concat(e,"/delete-popup/").concat(c),t)})}),o.querySelectorAll(".partial-project-comp-list__icon-share").forEach(o=>{o.addEventListener("click",()=>{const c=o.parentElement.getAttribute("data-id");openDynamicPopup("/my/".concat(e,"/share-popup/").concat(c),t)})})}r(),c.forEach((e,t)=>{e.addEventListener("click",()=>{void 0===n[t]||Bem.hasState(e,"active")||p(n[t],a)})}),function(){const e=document.getElementById("view-my-projects-comps__search"),t=debounceFunction(()=>{a=e.value,p(0,a)},400);e.addEventListener("input",t)}(),l()}projectComponentList(),window.viewProjectComponentSharePopup=function(e){const t=e.querySelector(".view-project-component-share-popup__link-copy");t.addEventListener("click",()=>{const e=this.document.createElement("textarea");e.value=Bem.data(t,"link"),this.document.body.appendChild(e),e.select(),this.document.execCommand("copy"),e.remove()})};
//# sourceMappingURL=my-projects-comps-es2015.js.map
