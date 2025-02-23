"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[940],{9940:function(e,s,a){a.r(s),a.d(s,{default:function(){return C}});var l=a(7437),n=a(2265),i=a(7907);function t(){let e=(0,i.usePathname)();return(0,n.useEffect)(()=>{let s=document.querySelector("body");s&&(s.classList.remove("home-page-3","home-page-2"),"/index-2"===e&&s.classList.add("home-page-2"),"/index-3"===e&&s.classList.add("home-page-3"))},[e]),null}function r(e){let{target:s}=e,[a,i]=(0,n.useState)(!1);return(0,n.useEffect)(()=>{let e=()=>{i(window.scrollY>100)};return window.addEventListener("scroll",e),()=>window.removeEventListener("scroll",e)},[]),(0,l.jsx)(l.Fragment,{children:a&&(0,l.jsx)("div",{className:"btn-scroll-top active-progress",onClick:()=>{let e=document.querySelector(s);e?window.scrollTo({top:e.offsetTop,behavior:"smooth"}):console.error("Element with target '".concat(s,"' not found"))},children:(0,l.jsx)("svg",{className:"progress-square svg-content",width:"100%",height:"100%",viewBox:"0 0 40 40",children:(0,l.jsx)("path",{d:"M8 1H32C35.866 1 39 4.13401 39 8V32C39 35.866 35.866 39 32 39H8C4.13401 39 1 35.866 1 32V8C1 4.13401 4.13401 1 8 1Z"})})})})}function c(){return(0,n.useEffect)(()=>{document.querySelectorAll("[data-background]").forEach(e=>{let s=e.getAttribute("data-background");s&&(e.style.backgroundImage="url(".concat(s,")"))})},[]),null}let o=e=>({x:e.pageX||e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,y:e.pageY||e.clientY+document.body.scrollTop+document.documentElement.scrollTop});class d{setupRevealContent(){this.DOM.revealInner.className="tg-img-reveal-wrapper__inner",this.DOM.revealImg.className="tg-img-reveal-wrapper__img",this.DOM.revealImg.style.backgroundImage="url(".concat(this.DOM.el.dataset.img,")"),this.DOM.revealInner.appendChild(this.DOM.revealImg);let e=document.createElement("div");e.className="tg-hover-wrapper",e.innerHTML='\n            <ul class="tgbanner__content-meta list-wrap">\n                <li><span class="by">By</span> <a href="#">'.concat(this.DOM.el.dataset.author||"","</a></li>\n                <li>").concat(this.DOM.el.dataset.date||"",'</li>\n            </ul>\n            <h3 class="tg-hover-title">').concat(this.DOM.el.dataset.title||"","</h3>\n        "),this.DOM.revealImg.appendChild(e),this.DOM.reveal.appendChild(this.DOM.revealInner)}initEvents(){this.positionElement=e=>{let s=o(e),a={left:document.body.scrollLeft+document.documentElement.scrollLeft,top:document.body.scrollTop+document.documentElement.scrollTop};this.DOM.reveal.style.top="".concat(s.y+20-a.top,"px"),this.DOM.reveal.style.left="".concat(s.x+20-a.left,"px")},this.mouseenterFn=e=>{this.positionElement(e),this.showImage()},this.mousemoveFn=e=>{requestAnimationFrame(()=>{this.positionElement(e)})},this.mouseleaveFn=()=>{this.hideImage()},this.DOM.el.addEventListener("mouseenter",this.mouseenterFn),this.DOM.el.addEventListener("mousemove",this.mousemoveFn),this.DOM.el.addEventListener("mouseleave",this.mouseleaveFn)}showImage(){this.DOM.reveal.style.opacity="1",this.DOM.revealInner.style.transform="translateX(0%)",this.DOM.revealImg.style.transform="translateX(0%)",this.DOM.reveal.style.pointerEvents="auto"}hideImage(){this.DOM.reveal.style.opacity="0",this.DOM.revealInner.style.transform="translateX(100%)",this.DOM.revealImg.style.transform="translateX(-100%)",this.DOM.reveal.style.pointerEvents="none"}destroy(){this.DOM.el.removeEventListener("mouseenter",this.mouseenterFn),this.DOM.el.removeEventListener("mousemove",this.mousemoveFn),this.DOM.el.removeEventListener("mouseleave",this.mouseleaveFn)}constructor(e){this.DOM={el:e,reveal:document.createElement("div"),revealInner:document.createElement("div"),revealImg:document.createElement("div")},this.DOM.reveal.className="tg-img-reveal-wrapper",this.DOM.reveal.style.opacity="0",this.setupRevealContent(),this.DOM.el.appendChild(this.DOM.reveal),this.initEvents()}}function m(){return(0,n.useEffect)(()=>{let e=Array.from(document.querySelectorAll('[data-fx="1"] > .tg-img-reveal-item, .tg-img-reveal-item[data-fx="1"]')).map(e=>new d(e));return()=>{e.forEach(e=>e.destroy())}},[]),null}function h(e){let{breadcrumbTitle:s}=e;return(0,l.jsx)(l.Fragment,{})}var f=a(8792),x=a(8565),u=a.n(x);function v(e){let{isMobileMenu:s,handleMobileMenu:a}=e;return(0,l.jsx)(l.Fragment,{children:(0,l.jsx)("div",{className:"mobile-header-active mobile-header-wrapper-style perfect-scrollbar button-bg-2 ".concat(s?"sidebar-visible":""),children:(0,l.jsxs)("div",{className:"mobile-header-wrapper-inner",children:[(0,l.jsxs)("div",{className:"mobile-header-logo",children:[(0,l.jsxs)(f.default,{className:"d-flex main-logo align-items-center d-inline-flex",href:"/",children:[(0,l.jsx)("img",{src:"/assets/imgs/footer-1/logo.svg",alt:"infinia"}),(0,l.jsx)("span",{className:"fs-4 ms-2 text-dark",children:"william.design"})]}),(0,l.jsxs)("div",{className:"burger-icon burger-icon-white border rounded-3 ".concat(s?"burger-close":""),onClick:a,children:[(0,l.jsx)("span",{className:"burger-icon-top"}),(0,l.jsx)("span",{className:"burger-icon-mid"}),(0,l.jsx)("span",{className:"burger-icon-bottom"})]})]}),(0,l.jsx)("div",{className:"mobile-header-content-area",children:(0,l.jsx)(u(),{className:"perfect-scroll",children:(0,l.jsx)("div",{className:"mobile-menu-wrap mobile-header-border",children:(0,l.jsx)("nav",{children:(0,l.jsxs)("ul",{className:"mobile-menu font-heading ps-0",children:[(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link active",href:"/",children:"Home"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"/services",children:"Services"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"/work",children:"Portfolio"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"/pricing",children:"Pricing"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"/blog-list",children:"Blog"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"/#contact",children:"Contact"})})]})})})})})]})})})}function j(){return(0,l.jsx)(l.Fragment,{children:(0,l.jsx)("footer",{children:(0,l.jsxs)("div",{className:"section-footer position-relative pt-60 pb-60 bg-secondary-1",children:[(0,l.jsxs)("div",{className:"container position-relative z-1",children:[(0,l.jsxs)("div",{className:"text-center",children:[(0,l.jsxs)(f.default,{className:"d-flex main-logo align-items-center d-inline-flex",href:"/",children:[(0,l.jsx)("img",{src:"/assets/imgs/footer-1/logo.svg",alt:"infinia"}),(0,l.jsx)("span",{className:"fs-4 ms-2 text-white-keep",children:"shadi.ai"})]}),(0,l.jsxs)("div",{className:"navigation d-none d-md-flex align-items-center justify-content-center flex-wrap gap-4 my-4",children:[(0,l.jsx)(f.default,{href:"/",className:"fs-5",children:"Home"}),(0,l.jsx)(f.default,{href:"/services",className:"fs-5",children:"Services"}),(0,l.jsx)(f.default,{href:"/work",className:"fs-5",children:"Portfolio"}),(0,l.jsx)(f.default,{href:"/#contact",className:"fs-5",children:"Contact"})]})]}),(0,l.jsx)("div",{className:"row text-center py-4",children:(0,l.jsxs)("span",{className:"fs-6 text-white-keep",children:["\xa9 ",new Date().getFullYear()," All Rights Reserved by ",(0,l.jsx)("span",{children:(0,l.jsx)(f.default,{href:"/#",className:"text-primary-1",children:"shadi.ai"})})]})})]}),(0,l.jsx)("div",{className:"position-absolute top-0 start-0 w-100 h-100 z-0","data-background":"assets/imgs/footer-1/background.png "})]})})})}function p(){return(0,l.jsx)(l.Fragment,{children:(0,l.jsx)("footer",{children:(0,l.jsx)("div",{className:"section-footer-2 position-relative",children:(0,l.jsx)("div",{className:"container position-relative z-1 border-top border-1 pb-2 pt-4",children:(0,l.jsxs)("div",{className:"text-center",children:[(0,l.jsxs)("a",{className:"d-flex main-logo align-items-center justify-content-center mb-3",children:[(0,l.jsx)("img",{src:"assets/imgs/home-page-2/template/favicon.svg",alt:"zelio"}),(0,l.jsx)("span",{className:"fs-4 ms-2",children:"James.dev"})]}),(0,l.jsxs)("div",{className:"d-flex justify-content-center gap-3",children:[(0,l.jsx)("a",{href:"http://facebook.com",children:(0,l.jsx)("i",{className:"ri-facebook-circle-fill fs-18"})}),(0,l.jsx)("a",{href:"http://twitter.com",children:(0,l.jsx)("i",{className:"ri-twitter-x-fill fs-18"})}),(0,l.jsx)("a",{href:"http://linkedin.com",children:(0,l.jsx)("i",{className:"ri-linkedin-fill fs-18"})}),(0,l.jsx)("a",{href:"http://github.com",children:(0,l.jsx)("i",{className:"ri-github-fill fs-18"})})]}),(0,l.jsxs)("div",{className:"navigation d-flex align-items-center justify-content-center flex-wrap gap-4 my-4",children:[(0,l.jsx)("a",{href:"#about",className:"fs-6",children:" About me "}),(0,l.jsx)("a",{href:"#resume",className:"fs-6",children:" Resume "}),(0,l.jsx)("a",{href:"#services",className:"fs-6",children:" Services "}),(0,l.jsx)("a",{href:"#portfolio",className:"fs-6",children:" Portfolio "}),(0,l.jsx)("a",{href:"#blog",className:"fs-6",children:" Blog "}),(0,l.jsx)("a",{href:"#contact",className:"fs-6",children:" Contact "})]})]})})})})})}function g(){return(0,l.jsx)(l.Fragment,{children:(0,l.jsx)("footer",{children:(0,l.jsx)("div",{className:"section-footer-3 position-relative",children:(0,l.jsx)("div",{className:"container position-relative z-1 border-top border-secondary-3 pb-2 pt-4 px-lg-0",children:(0,l.jsxs)("div",{className:"d-lg-flex justify-content-between align-items-center",children:[(0,l.jsxs)(f.default,{className:"d-flex main-logo align-items-center justify-content-center ms-lg-0 ms-md-5 ms-3",href:"/index-3",children:[(0,l.jsx)("h1",{className:"fs-28 mb-0 me-2",children:"Meisa"}),(0,l.jsx)("img",{src:"assets/imgs/home-page-3/template/favicon.svg",alt:"zelio"})]}),(0,l.jsxs)("div",{className:"navigation d-flex align-items-center justify-content-center flex-wrap gap-4 my-4",children:[(0,l.jsx)("a",{href:"#about",className:"fs-6",children:" About me "}),(0,l.jsx)("a",{href:"#resume",className:"fs-6",children:" Resume "}),(0,l.jsx)("a",{href:"#services",className:"fs-6",children:" Services "}),(0,l.jsx)("a",{href:"#portfolio",className:"fs-6",children:" Portfolio "}),(0,l.jsx)("a",{href:"#blog",className:"fs-6",children:" Blog "}),(0,l.jsx)("a",{href:"#contact",className:"fs-6",children:" Contact "})]}),(0,l.jsxs)("div",{className:"navbar-social d-flex justify-content-center gap-3",children:[(0,l.jsx)("a",{href:"http://facebook.com",children:(0,l.jsx)("i",{className:"ri-facebook-circle-fill fs-18"})}),(0,l.jsx)("a",{href:"http://twitter.com",children:(0,l.jsx)("i",{className:"ri-twitter-x-fill fs-18"})}),(0,l.jsx)("a",{href:"http://linkedin.com",children:(0,l.jsx)("i",{className:"ri-linkedin-fill fs-18"})}),(0,l.jsx)("a",{href:"http://github.com",children:(0,l.jsx)("i",{className:"ri-github-fill fs-18"})})]})]})})})})})}function b(){let[e,s]=(0,n.useState)("dark");return(0,n.useEffect)(()=>{var e;let a=(null===(e=localStorage)||void 0===e?void 0:e.getItem("theme"))||"dark";s(a),document.documentElement.setAttribute("data-bs-theme",a)},[]),(0,n.useEffect)(()=>{localStorage.setItem("theme",e),document.documentElement.setAttribute("data-bs-theme",e)},[e]),(0,l.jsx)(l.Fragment,{children:(0,l.jsx)("div",{className:"dark-light-switcher pe-10 pe-lg-0 pe-0 ps-md-5 ps-0 ps-lg-4 pe-lg-4 d-flex justify-content-center align-items-center icon_80",onClick:()=>{s(e=>"light"===e?"dark":"light")},style:{cursor:"pointer"},children:(0,l.jsx)("i",{className:"bi theme-icon ".concat("dark"===e?"ri-sun-line text-warning":"ri-contrast-2-line text-white")})})})}function N(){let e=(0,i.usePathname)();return(0,l.jsx)(l.Fragment,{children:(0,l.jsxs)("ul",{className:"navbar-nav me-auto mb-2 mb-lg-0",children:[(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{href:"/",className:"/"===e?"nav-link active":"nav-link",children:"Home"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{href:"/services",className:"/services"===e?"nav-link active":"nav-link",children:"Services"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{href:"/work",className:"/work"===e?"nav-link active":"nav-link",children:"Portfolio"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{href:"/#contact",className:"#contact"===e?"nav-link active":"nav-link",children:"Contact"})})]})})}function k(e){let{isOffCanvas:s,handleOffCanvas:a}=e;return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)("div",{className:"offCanvas__info ".concat(s?"active":""),children:[(0,l.jsx)("div",{className:"offCanvas__close-icon menu-close",onClick:a,children:(0,l.jsx)("button",{children:(0,l.jsx)("i",{className:"ri-close-line"})})}),(0,l.jsx)("div",{className:"offCanvas__logo mb-5",children:(0,l.jsx)("h3",{className:"mb-0",children:"Get in touch"})}),(0,l.jsxs)("div",{className:"offCanvas__side-info mb-30",children:[(0,l.jsxs)("div",{className:"contact-list mb-30",children:[(0,l.jsx)("p",{className:"fs-6 fw-medium text-200 mb-5",children:"I'm always excited to take on new projects and collaborate with innovative minds."}),(0,l.jsxs)("div",{className:"mb-3",children:[(0,l.jsx)("span",{className:"text-400 fs-5",children:"Phone Number"}),(0,l.jsx)("p",{className:"mb-0",children:"+961 76 938 653"})]}),(0,l.jsxs)("div",{className:"mb-3",children:[(0,l.jsx)("span",{className:"text-400 fs-5",children:"Email"}),(0,l.jsx)("p",{className:"mb-0",children:"shadifarhat98@gmail.com"})]}),(0,l.jsxs)("div",{className:"mb-3",children:[(0,l.jsx)("span",{className:"text-400 fs-5",children:"Address"}),(0,l.jsx)("p",{className:"mb-0",children:"Lebanon - Beirut"})]})]}),(0,l.jsxs)("div",{className:"contact-list",children:[(0,l.jsx)("p",{className:"text-400 fs-5 mb-2",children:"Social"}),(0,l.jsxs)("div",{className:"d-md-flex d-none gap-3",children:[(0,l.jsx)(f.default,{href:"http://facebook.com/shadi.farhat.10",target:"_blank",children:(0,l.jsx)("i",{className:"ri-facebook-circle-fill fs-18"})}),(0,l.jsx)(f.default,{href:"https://api.whatsapp.com/send/?phone=96176938653&text&type=phone_number&app_absent=0",target:"_blank",children:(0,l.jsx)("i",{className:"ri-whatsapp-fill fs-18"})}),(0,l.jsx)(f.default,{href:"https://www.linkedin.com/in/shadi-farhat-61043a204/",target:"_blank",children:(0,l.jsx)("i",{className:"ri-linkedin-fill fs-18"})}),(0,l.jsx)(f.default,{href:"https://github.com/ShadiFarhat",target:"_blank",children:(0,l.jsx)("i",{className:"ri-github-fill fs-18"})})]})]})]})]}),(0,l.jsx)("div",{className:"offCanvas__overly ".concat(s?"active":""),onClick:a})]})}function w(e){let{scroll:s,isMobileMenu:a,handleMobileMenu:n,isOffCanvas:i,handleOffCanvas:t}=e;return(0,l.jsx)(l.Fragment,{children:(0,l.jsxs)("header",{children:[(0,l.jsxs)("nav",{className:"navbar navbar-expand-lg navbar-light w-100 flex-nowrap z-999 p-0 ".concat(s?"navbar-stick":""),style:{position:"".concat(s?"fixed":"relative"),top:"".concat(s?"0":"auto")},children:[(0,l.jsx)(f.default,{href:"/#",className:"navbar-menu p-4 text-center square-100 menu-tigger icon_80 icon-shape d-none d-md-flex","data-bs-target":".offCanvas__info","aria-controls":"offCanvas__info",onClick:t,children:(0,l.jsx)("i",{className:"ri-menu-2-line"})}),(0,l.jsxs)("div",{className:"container py-3 px-0",children:[(0,l.jsxs)(f.default,{className:"navbar-brand d-flex main-logo align-items-center ms-lg-0 ms-md-5 ms-3",href:"/",children:[(0,l.jsx)("img",{src:"/assets/imgs/template/favicon.svg",alt:"infinia"}),(0,l.jsx)("span",{className:"fs-4 ms-2",children:"shadi.ai"})]}),(0,l.jsx)("div",{className:"d-none d-lg-flex",children:(0,l.jsx)("div",{className:"collapse navbar-collapse",id:"navbarSupportedContent",children:(0,l.jsx)(N,{})})}),(0,l.jsxs)("div",{className:"navbar-social d-flex align-items-center pe-5 pe-lg-0 me-5 me-lg-0",children:[(0,l.jsxs)("div",{className:"d-md-flex d-none gap-3",children:[(0,l.jsx)(f.default,{href:"http://facebook.com/shadi.farhat.10",target:"_blank",children:(0,l.jsx)("i",{className:"ri-facebook-circle-fill fs-18"})}),(0,l.jsx)(f.default,{href:"https://api.whatsapp.com/send/?phone=96176938653&text&type=phone_number&app_absent=0",target:"_blank",children:(0,l.jsx)("i",{className:"ri-whatsapp-fill fs-18"})}),(0,l.jsx)(f.default,{href:"https://www.linkedin.com/in/shadi-farhat-61043a204/",target:"_blank",children:(0,l.jsx)("i",{className:"ri-linkedin-fill fs-18"})}),(0,l.jsx)(f.default,{href:"https://github.com/ShadiFarhat",target:"_blank",children:(0,l.jsx)("i",{className:"ri-github-fill fs-18"})})]}),(0,l.jsxs)("div",{className:"burger-icon burger-icon-white border rounded-3",onClick:n,children:[(0,l.jsx)("span",{className:"burger-icon-top"}),(0,l.jsx)("span",{className:"burger-icon-mid"}),(0,l.jsx)("span",{className:"burger-icon-bottom"})]})]})]}),(0,l.jsx)(b,{})]}),(0,l.jsx)(k,{isOffCanvas:i,handleOffCanvas:t}),(0,l.jsx)(v,{isMobileMenu:a,handleMobileMenu:n})]})})}function M(e){let{scroll:s,isMobileMenu:a,handleMobileMenu:n,isOffCanvas:i,handleOffCanvas:t}=e;return(0,l.jsx)(l.Fragment,{children:(0,l.jsx)("header",{children:(0,l.jsxs)("div",{className:"container position-relative",children:[(0,l.jsx)("div",{className:"position-relative",children:(0,l.jsxs)("nav",{className:"navbar navbar-expand-lg navbar-home-2 flex-nowrap z-999 p-0 border border-1 rounded-3",children:[(0,l.jsx)("a",{className:"navbar-menu p-4 text-center square-100 menu-tigger icon_80 icon-shape d-none d-md-flex","data-bs-target":".offCanvas__info","aria-controls":"offCanvas__info",onClick:t,children:(0,l.jsx)("i",{className:"ri-menu-2-line"})}),(0,l.jsxs)("div",{className:"container py-3 px-4",children:[(0,l.jsxs)(f.default,{className:"navbar-brand d-flex main-logo align-items-center",href:"/index-2",children:[(0,l.jsx)("img",{src:"assets/imgs/home-page-2/template/favicon.svg",alt:"zelio"}),(0,l.jsx)("span",{className:"fs-4 ms-2",children:"James.dev"})]}),(0,l.jsx)("div",{className:"d-none d-lg-flex",children:(0,l.jsx)("div",{className:"collapse navbar-collapse",id:"navbarSupportedContent",children:(0,l.jsxs)("ul",{className:"navbar-nav me-auto mb-2 mb-lg-0",children:[(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link active",href:"#about",children:"About me"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#resume",children:"Resume"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#services",children:"Services"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#portfolio",children:"Portfolio"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#blog",children:"Blog"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#contact",children:"Contact"})})]})})}),(0,l.jsxs)("div",{className:"navbar-social d-flex align-items-center pe-5 pe-lg-0 me-5 me-lg-0",children:[(0,l.jsxs)("div",{className:"d-md-flex d-none gap-3",children:[(0,l.jsx)(f.default,{href:"/http://facebook.com",children:(0,l.jsx)("i",{className:"ri-facebook-circle-fill fs-18"})}),(0,l.jsx)(f.default,{href:"/http://twitter.com",children:(0,l.jsx)("i",{className:"ri-twitter-x-fill fs-18"})}),(0,l.jsx)(f.default,{href:"/http://linkedin.com",children:(0,l.jsx)("i",{className:"ri-linkedin-fill fs-18"})}),(0,l.jsx)(f.default,{href:"/http://github.com",children:(0,l.jsx)("i",{className:"ri-github-fill fs-18"})})]}),(0,l.jsxs)("div",{className:"burger-icon burger-icon-white border rounded-3",onClick:n,children:[(0,l.jsx)("span",{className:"burger-icon-top"}),(0,l.jsx)("span",{className:"burger-icon-mid"}),(0,l.jsx)("span",{className:"burger-icon-bottom"})]})]})]}),(0,l.jsx)(b,{})]})}),(0,l.jsx)(k,{isOffCanvas:i,handleOffCanvas:t}),(0,l.jsx)(v,{isMobileMenu:a,handleMobileMenu:n})]})})})}function y(e){let{scroll:s,isMobileMenu:a,handleMobileMenu:n,isOffCanvas:i,handleOffCanvas:t}=e;return(0,l.jsx)(l.Fragment,{children:(0,l.jsxs)("header",{children:[(0,l.jsxs)("nav",{className:"navbar navbar-expand-lg navbar-home-3 flex-nowrap z-999 p-0",children:[(0,l.jsxs)("div",{className:"container py-3 px-0",children:[(0,l.jsxs)(f.default,{className:"navbar-brand d-flex main-logo align-items-center ms-lg-0 ms-md-5 ms-3",href:"/index-3",children:[(0,l.jsx)("h1",{className:"fs-28 mb-0 me-2",children:"Meisa"}),(0,l.jsx)("img",{src:"assets/imgs/home-page-3/template/favicon.svg",alt:"zelio"})]}),(0,l.jsx)("div",{className:"d-none d-lg-flex",children:(0,l.jsx)("div",{className:"collapse navbar-collapse",id:"navbarSupportedContent",children:(0,l.jsxs)("ul",{className:"navbar-nav me-auto mb-2 mb-lg-0",children:[(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link active",href:"#about",children:"About me"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#resume",children:"Resume"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#services",children:"Services"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#portfolio",children:"Portfolio"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#blog",children:"Blog"})}),(0,l.jsx)("li",{className:"nav-item",children:(0,l.jsx)(f.default,{className:"nav-link",href:"#contact",children:"Contact"})})]})})}),(0,l.jsxs)("div",{className:"navbar-social d-flex align-items-center",children:[(0,l.jsxs)("div",{className:"d-md-flex d-none gap-3",children:[(0,l.jsx)(f.default,{href:"http://facebook.com",children:(0,l.jsx)("i",{className:"ri-facebook-circle-fill fs-18"})}),(0,l.jsx)(f.default,{href:"http://twitter.com",children:(0,l.jsx)("i",{className:"ri-twitter-x-fill fs-18"})}),(0,l.jsx)(f.default,{href:"http://linkedin.com",children:(0,l.jsx)("i",{className:"ri-linkedin-fill fs-18"})}),(0,l.jsx)(f.default,{href:"http://github.com",children:(0,l.jsx)("i",{className:"ri-github-fill fs-18"})})]}),(0,l.jsxs)("div",{className:"burger-icon burger-icon-white border rounded-3",onClick:t,children:[(0,l.jsx)("span",{className:"burger-icon-top"}),(0,l.jsx)("span",{className:"burger-icon-mid"}),(0,l.jsx)("span",{className:"burger-icon-bottom"})]})]})]}),(0,l.jsx)(b,{})]}),(0,l.jsx)(k,{isOffCanvas:i,handleOffCanvas:t}),(0,l.jsx)(v,{isMobileMenu:a,handleMobileMenu:n})]})})}function C(e){let{headerStyle:s,footerStyle:i,breadcrumbTitle:o,children:d}=e,[f,x]=(0,n.useState)(!1),[u,b]=(0,n.useState)(!1),N=()=>{b(!u),u?document.body.classList.remove("mobile-menu-active"):document.body.classList.add("mobile-menu-active")},[k,C]=(0,n.useState)(!1),[O,_]=(0,n.useState)(!1),E=()=>_(!O);return(0,n.useEffect)(()=>{let e=a(3715);window.wow=new e.WOW({live:!1}),window.wow.init();let s=()=>{let e=window.scrollY>100;e!==f&&x(e)};return document.addEventListener("scroll",s),()=>{document.removeEventListener("scroll",s)}},[f]),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("div",{id:"top"}),(0,l.jsx)(t,{}),(0,l.jsx)(c,{}),(0,l.jsx)(m,{}),!s&&(0,l.jsx)(w,{scroll:f,isMobileMenu:u,handleMobileMenu:N,isOffCanvas:O,handleOffCanvas:E}),1==s?(0,l.jsx)(w,{scroll:f,isMobileMenu:u,handleMobileMenu:N,isOffCanvas:O,handleOffCanvas:E}):null,2==s?(0,l.jsx)(M,{scroll:f,isMobileMenu:u,handleMobileMenu:N,isOffCanvas:O,handleOffCanvas:E}):null,3==s?(0,l.jsx)(y,{scroll:f,isMobileMenu:u,handleMobileMenu:N,isOffCanvas:O,handleOffCanvas:E}):null,(0,l.jsx)(v,{}),(0,l.jsxs)("main",{className:"main",children:[o&&(0,l.jsx)(h,{breadcrumbTitle:o}),d]}),!i&&(0,l.jsx)(j,{}),1==i?(0,l.jsx)(j,{}):null,2==i?(0,l.jsx)(p,{}):null,3==i?(0,l.jsx)(g,{}):null,(0,l.jsx)(r,{target:"#top"})]})}}}]);