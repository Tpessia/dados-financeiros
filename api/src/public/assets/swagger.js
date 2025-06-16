// no hot-reload - reload app manually to see changes

// META
document.head.innerHTML += `
  <!-- meta -->
  <meta name="description" content="API for financial data, including stock prices, indices, bonds, and more." />

  <!-- open graph -->
  <meta property="og:url" content="https://InvestTester.com/api" />
  <meta property="og:title" content="Dados Financeiros API" />
  <meta property="og:site_name" content="InvestTester" />
  <meta property="og:description" content="API for financial data, including stock prices, indices, bonds, and more." />
  <meta property="og:image" itemprop="image" content="https://InvestTester.com/assets/logo/logo1000.jpg" />
  <meta property="og:type" content="website" />
`;

// H1 TITLE
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const title = document.querySelector('.title');
    if (title) title.outerHTML = `<h1 class="title">${title.innerHTML}</h1>`;
  }, 10);
});

// GTAG
(async () => {
  // const page = await fetch('/').then(r => r.text());
  // const scripts = page.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
  // const gtag = scripts.flatMap(e => e.match(/\bG-[A-Z0-9]{10,}\b/g))[0];

  const gtag = 'G-HPM5K2ZXRX';

  // https://minimalanalytics.com/
  // https://github.com/jahilldev/minimal-analytics/tree/main/packages/ga4#readme

  // window.minimalAnalytics = { trackingId: '%VITE_GTAG%', autoTrack: true }; // auto track
  !function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var o in n)("object"==typeof exports?exports:e)[o]=n[o]}}(this,(()=>(()=>{"use strict";var e={508:(e,t,n)=>{function o(e,t=300,n=0){return(...o)=>(clearTimeout(n),n=setTimeout(e,t,...o))}function i(e=16){return e=e>16?16:e,`${Math.floor(1e16*Math.random())}`.padStart(e,"0").substring(-1,e)}function s(e,t=16){let n=0;for(let t=0;t<e.length;t++)n=(n<<5)-n+e.charCodeAt(t),n&=n;return n=Math.abs(n),`${n}`.padStart(t,"0").substring(-1,t)}function r(){const e=document.body,t=window.pageYOffset||e.scrollTop,{scrollHeight:n,offsetHeight:o,clientHeight:i}=document.documentElement,s=Math.max(e.scrollHeight,n,e.offsetHeight,o,e.clientHeight,i)-window.innerHeight;return Math.floor(100*Math.abs(t/s))}function a(e,t){let n=e;for(;n&&(!(null==n?void 0:n.matches)||!(null==n?void 0:n.matches(t)));)n=null==n?void 0:n.parentNode;return n}function c(e){let t,n,o=!1;try{({hostname:t,pathname:n}=e&&new URL(e)||{})}catch(e){}return t&&(o=t!==window.location.host),{t:o,hostname:t,pathname:n}}n.r(t),n.d(t,{o:()=>u,i:()=>d,u:()=>o,l:()=>m,m:()=>f,g:()=>p,v:()=>s,p:()=>i,h:()=>r,_:()=>g,$:()=>v,S:()=>c,j:()=>a,I:()=>l});const u="clientId",l="sessionId",d="sessionCount";function f(){const{hostname:e,origin:t,pathname:n,search:o}=document.location,i=document.title;return{location:t+n+o,hostname:e,pathname:n,referrer:document.referrer,title:i}}function m(e=u){const t=i(),n=localStorage.getItem(e);return n||(localStorage.setItem(e,t),t)}function g(e=l){const t=i(),n=sessionStorage.getItem(e);return n||(sessionStorage.setItem(e,t),t)}function v(e){const t=localStorage.getItem(u)?void 0:"1",n=sessionStorage.getItem(l)?void 0:"1";let o=sessionStorage.getItem(d)||"1";return e&&(o=function(e=d){let t="1";const n=sessionStorage.getItem(e);return n&&(t=""+(+n+1)),sessionStorage.setItem(e,t),t}()),{firstVisit:t,sessionStart:n,sessionCount:o}}function p(e){return Array.isArray(e)?e.map((e=>e.map((e=>null==e?void 0:e.toString())))):Object.keys(e).map((t=>[t,`${e[t]}`]))}},209:(e,t)=>{Object.defineProperty(t,"M",{value:!0}),t.files=t.k=void 0;t.k={protocolVersion:"v",trackingId:"tid",pageId:"_p",language:"ul",clientId:"cid",firstVisit:"_fv",hitCount:"_s",sessionId:"sid",sessionCount:"sct",sessionEngagement:"seg",sessionStart:"_ss",debug:"_dbg",referrer:"dr",location:"dl",title:"dt",eventName:"en",eventParam:"ep",eventParamNumber:"epn",screenResolution:"sr",enagementTime:"_et"};t.files=["pdf|xlsx?|docx?|txt|rtf|csv|exe|key|pp(s|t|tx)|7z|pkg|rar|gz|zip|avi","mov|mp4|mpe?g|wmv|midi?|mp3|wav|wma"]}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var s=t[o]={exports:{}};return e[o](s,s.exports,n),s.exports}n.d=(e,t)=>{for(var o in t)n.D(t,o)&&!n.D(e,o)&&Object.defineProperty(e,o,{O:!0,get:t[o]})},n.D=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"M",{value:!0})};var o={};return(()=>{var e=o;Object.defineProperty(e,"M",{value:!0}),e.track=void 0;const t=n(508),i=n(209),s="undefined"!=typeof window,r=s&&window.minimalAnalytics?.defineGlobal,a=s&&window.minimalAnalytics?.autoTrack,c=["q","s","search","query","keyword"];let u,l,d,f=[[Date.now()]],m=!1;const g="page_view",v="scroll",p="click",w="view_search_results",h="user_engagement",y="file_download";function b(e,{type:n,event:o,debug:s}){const{location:r,referrer:a,title:u}=(0,t.m)(),{firstVisit:l,sessionStart:d,sessionCount:f}=(0,t.$)(!m),g=self.screen||{};let v=[[i.k.protocolVersion,"2"],[i.k.trackingId,e],[i.k.pageId,(0,t.p)()],[i.k.language,(navigator.language||"").toLowerCase()],[i.k.clientId,(0,t.l)()],[i.k.firstVisit,l],[i.k.hitCount,"1"],[i.k.sessionId,(0,t._)()],[i.k.sessionCount,f],[i.k.sessionEngagement,"1"],[i.k.sessionStart,d],[i.k.debug,s?"1":""],[i.k.referrer,a],[i.k.location,r],[i.k.title,u],[i.k.screenResolution,`${g.width}x${g.height}`]];return v=v.concat(function({type:e="",event:n}){const o=document.location.search,s=new URLSearchParams(o),r=c.some((e=>new RegExp(`[?|&]${e}=`,"g").test(o)))?w:e,a=c.find((e=>s.get(e)));let u=[[i.k.eventName,r],[`${i.k.eventParam}.search_term`,a||""]];return n&&(u=u.concat((0,t.g)(n))),u}({type:n,event:o})),v=v.filter((([,e])=>e)),new URLSearchParams(v)}function _(){return f.reduce(((e,[t,n=Date.now()])=>e+(n-t)),0).toString()}function $(e,n){const o=(0,t.j)(n.target,"a, button, input[type=submit], input[type=button]"),s=o?.tagName?.toLowerCase(),r="a"===s?"link":s,a=o?.getAttribute("href")||void 0,c=o?.getAttribute("download")||void 0||a,{t:u,hostname:l,pathname:d}=(0,t.S)(c),f="link"===r&&!u,[m]=c?.match(new RegExp(i.files.join("|"),"g"))||[],g=m?y:p,v=`${i.k.eventParam}.${r}`;if(!o||f&&!m)return;let w=[[`${v}_id`,o.id],[`${v}_classes`,o.className],[`${v}_name`,o?.getAttribute("name")?.trim()],[`${v}_text`,o.textContent?.trim()],[`${v}_value`,o?.getAttribute("value")?.trim()],[`${v}_url`,a],[`${v}_domain`,l],[`${i.k.eventParam}.outbound`,`${u}`],[i.k.enagementTime,_()]];m&&(w=w.concat([[`${i.k.eventParam}.file_name`,d||c],[`${i.k.eventParam}.file_extension`,m]])),D(e,{type:g,event:w})}function S(){const e=f.length-1,[,t]=f[e];t||f[e].push(Date.now())}function x(){const e=f.length-1,[,t]=f[e];t&&f.push([Date.now()])}function j(){const e=f.length-1,[,t]=f[e],n=["hidden","visible"].indexOf(document.visibilityState),o=Boolean(n);-1!==n&&(o?t&&f.push([Date.now()]):!t&&f[e].push(Date.now()))}const I=(0,t.u)((e=>{if((0,t.h)()<90)return;const n=[[`${i.k.eventParamNumber}.percent_scrolled`,90]];D(e,{type:v,event:n}),document.removeEventListener("scroll",l)}));function M(e){const t=[[i.k.enagementTime,_()]];D(e,{type:h,event:t})}function k(e){m||(u=$.bind(null,e),l=I.bind(null,e),d=M.bind(null,e),document.addEventListener("visibilitychange",j),document.addEventListener("scroll",l),document.addEventListener("click",u),window.addEventListener("blur",S),window.addEventListener("focus",x),window.addEventListener("beforeunload",d))}function D(...e){const[t,{type:n,event:o,debug:i}]=function(e){const t=window.minimalAnalytics?.trackingId,n="string"==typeof e[0]?e[0]:t,o="object"==typeof e[0]?e[0]:e[1]||{};return[n,{type:g,...o}]}(e);if(!t)return void console.error("GA4: Tracking ID is missing or undefined");const s=b(t,{type:n,event:o,debug:i}),r=window.minimalAnalytics?.analyticsEndpoint||"https://www.google-analytics.com/g/collect";navigator.sendBeacon(`${r}?${s}`),k(t),m=!0}e.track=D,r&&(window.track=D),a&&D()})(),o})()));

  if (!!gtag) {
    let hasInterected = false;
    const interactionEvents = ['click', 'touchstart', 'scroll', 'mouseover', 'keydown'];
    const func = () => {
      if (hasInterected) return;
      hasInterected = true;
      track(gtag); // manual track
      interactionEvents.forEach(event => document.removeEventListener(event, func, { passive: true }));
    };
    if (location.hostname !== 'localhost') {
      interactionEvents.forEach(event => document.addEventListener(event, func, { passive: true }));
    }
  }
})();