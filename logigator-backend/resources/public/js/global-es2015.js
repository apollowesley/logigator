"use strict";function siteHeaderPartial(e){const t=e.querySelector(".partial-settings-dropdown"),n=Bem.element(e,"dropdown-background");let a=!1;Bem.element(e,"dropdown-trigger").addEventListener("click",()=>{a=!a,Bem.setState(t,"open",a),Bem.setState(n,"shown",a)}),n.addEventListener("click",()=>{a=!1,Bem.setState(t,"open",a),Bem.setState(n,"shown",a)}),Bem.element(e,"burger-menu").addEventListener("click",()=>setBurgerMenuState())}function popupPartial(e){let t=Bem.hasState(e,"open");const n=Bem.data(e,"triggers");if(n){n.split("::").forEach(n=>{document.querySelector(n).addEventListener("click",()=>{t||(Bem.setState(e,"open",!0),t=!0)})})}Bem.elements(e,"close").forEach(n=>{n.addEventListener("click",()=>{Bem.setState(e,"open",!1),t=!1})})}function burgerMenuBackgroundElement(e){e.addEventListener("click",()=>setBurgerMenuState(!1))}window.Bem={bemClass(e){if(1===e.classList.length)return e.classList[0];for(let t=0;t<e.classList.length;t++)if(!e.classList[t].includes("--"))return e.classList[t]},element(e,t){const n=Bem.bemClass(e);return e.querySelector(".".concat(n,"__").concat(t))},elements(e,t){const n=Bem.bemClass(e);return e.querySelectorAll(".".concat(n,"__").concat(t))},setState(e,t,n){n?e.classList.add("is-".concat(t)):e.classList.remove("is-".concat(t))},hasState:(e,t)=>e.classList.contains("is-".concat(t)),toggleState(e,t){e.classList.toggle("is-".concat(t))},hasModifier(e,t){const n=Bem.bemClass(e);return e.classList.contains("".concat(n,"--").concat(t))},data:(e,t)=>e.getAttribute("data-".concat(t)),hasData:(e,t)=>e.hasAttribute("data-".concat(t))},window.setBurgerMenuState=function(e){const t=document.querySelector(".partial-burger-menu"),n=document.querySelector(".partial-burger-menu__background");void 0!==e?(Bem.setState(t,"open",e),Bem.setState(n,"open",e)):(e=!Bem.hasState(t,"open"),Bem.setState(t,"open",e),Bem.setState(n,"open",e))},window.debounceFunction=function(e,t){let n;return function(){const a=this,s=arguments,c=function(){n=null,e.apply(a,s)};clearTimeout(n),n=setTimeout(c,t)}},siteHeaderPartial(document.querySelector(".partial-site-header")),document.querySelectorAll(".partial-popup").forEach(e=>popupPartial(e)),burgerMenuBackgroundElement(document.querySelector(".partial-burger-menu__background"));
//# sourceMappingURL=global-es2015.js.map
