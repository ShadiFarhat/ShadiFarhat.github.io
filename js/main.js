/* =========================================================
   Shadi Farhat - Portfolio v2
   Base + Hero behaviors.
   Sections will be added one-by-one (about, career, etc.).
   ========================================================= */

(() => {
    'use strict';

    // ---------------------------------------------------------
    // PRELOADER - fills progress bar, dismisses on full load
    // ---------------------------------------------------------
    (function initSplash() {
        const splash = document.getElementById('splash');
        const bar    = document.getElementById('splashBar');
        if (!splash || !bar) return;
        let pct = 0;
        const tick = setInterval(() => {
            pct = Math.min(pct + (90 - pct) * 0.05, 89);
            bar.style.width = pct + '%';
        }, 60);
        const dismiss = () => {
            clearInterval(tick);
            bar.style.width = '100%';
            setTimeout(() => {
                splash.classList.add('is-gone');
                setTimeout(() => { splash.style.display = 'none'; }, 800);
            }, 350);
        };
        if (document.readyState === 'complete') {
            setTimeout(dismiss, 600);
        } else {
            window.addEventListener('load', () => setTimeout(dismiss, 400));
        }
        // Hard cap - always dismiss within 5s no matter what
        setTimeout(dismiss, 5000);
    })();

    // ---------------------------------------------------------
    // Register GSAP plugins
    // ---------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);

    // ---------------------------------------------------------
    // 1. LENIS smooth scroll  (synced with GSAP ScrollTrigger)
    // ---------------------------------------------------------
    const lenis = new Lenis({
        duration: 1.15,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);

    // ---------------------------------------------------------
    // 2. CUSTOM CURSOR (blue ring + dot, with hover state)
    // ---------------------------------------------------------
    const ring = document.getElementById('cursorRing');
    const dot  = document.getElementById('cursorDot');
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });

    // Smooth-follow ring (lerp)
    (function tick() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(tick);
    })();

    // Grow cursor on interactive elements
    const hoverables = 'a, button, .hero-face-wrap, [data-cursor-hover]';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverables)) {
            ring.classList.add('is-hover');
            dot.classList.add('is-hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverables)) {
            ring.classList.remove('is-hover');
            dot.classList.remove('is-hover');
        }
    });

    // ---------------------------------------------------------
    // 3. HERO - scroll-linked reveal
    //    State 1: full-bleed face dominates (no text)
    //    State 2: face fades out, name "Shadi Farhat." fades in
    // ---------------------------------------------------------

    // Wrap each character in a <span> so we can stagger the reveal.
    // (Works for plain text OR text that already contains nested spans.)
    document.querySelectorAll('.hero-name-line').forEach(line => {
        const raw = line.textContent;
        line.innerHTML = [...raw].map(c =>
            c === '.' ? `<span class="char-anim text-accent">${c}</span>` :
            c === ' ' ? '&nbsp;' :
                        `<span class="char-anim">${c}</span>`
        ).join('');
    });

    // Set EXPLICIT initial states BEFORE timeline so reverse-scrub
    // returns cleanly to the hero photo when scrolling back up.
    gsap.set('.hero-face-wrap',     { scale: 1, opacity: 1 });
    gsap.set('.hero-name-overlay',  { opacity: 0 });
    gsap.set('.hero-name .char-anim', { y: '110%' });
    gsap.set('.hero-underline',     { scaleX: 0, transformOrigin: 'left center' });

    // Initial intro fade-in (page load only - one-shot)
    gsap.from('.hero-face-color', {
        scale: 1.06, opacity: 0, duration: 1.6, ease: 'expo.out'
    });

    // Scroll-linked: as you scroll the 200vh hero, photo fades +
    // name rises in. Scroll BACK and everything cleanly reverses
    // because scrub is bi-directional and initial states are set.
    const heroTL = gsap.timeline({
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end:   'bottom bottom',
            scrub: 0.3,                  // tight, almost instant both ways
            invalidateOnRefresh: true,
        },
    });
    heroTL
        .to('.hero-face-wrap',    { scale: 0.88, opacity: 0.15, ease: 'none' }, 0)
        .to('.hero-name-overlay', { opacity: 1, ease: 'none' }, 0.15)
        .to('.hero-name .char-anim', { y: '0%', stagger: 0.02, ease: 'power2.out' }, 0.25)
        .to('.hero-underline',    { scaleX: 1, ease: 'power2.out' }, 0.55);

    // ---------------------------------------------------------
    // 4. HERO - WebGL Fluid Reveal (Mohamed Shehata's pipeline)
    //
    //    Architecture (3 layers on ONE WebGL canvas):
    //      1. Trail canvas (2D, 512×512): cursor draws BLACK on WHITE
    //         with lerped follow → uploaded to GPU each frame.
    //      2. Sim shader: ping-pong FBOs. Reads previous frame, adds
    //         FBM-noise displacement, darken-spreads neighbours, mixes
    //         in the new trail, fades toward white (+0.0085/frame).
    //         → smooth dissipating B&W mask.
    //      3. Composite shader: mix(reveal, base, fluidMask) so where
    //         the fluid is dark the B&W seq frame shows through, where
    //         it's white the color base shows. Bottom vignette baked in.
    //
    //    Seq frames cycle every 300ms for the "live" feel. The fade
    //    in/out is purely the shader's natural dissipation - no manual
    //    timers or alpha tweens needed.
    // ---------------------------------------------------------
    (function initFluidReveal(){
        const heroCanvas = document.getElementById('heroGLCanvas');
        const heroWrap   = document.getElementById('heroFaceWrap');
        if (!heroCanvas || !heroWrap) return;

        // Size BEFORE GL init (resizing canvas.width later resets state)
        heroCanvas.width  = heroWrap.clientWidth  || window.innerWidth;
        heroCanvas.height = heroWrap.clientHeight || window.innerHeight;

        const gl = heroCanvas.getContext('webgl',              { alpha: true, antialias: false, depth: false }) ||
                   heroCanvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });
        if (!gl) return;          // graceful fallback to the <img> beneath

        const SIM_W = 512, SIM_H = 512;
        const LWIDTH = SIM_W * 0.20;

        const trailCanvas = document.createElement('canvas');
        trailCanvas.width = SIM_W; trailCanvas.height = SIM_H;
        const tc = trailCanvas.getContext('2d');

        let trailX = -1, trailY = -1;
        let rawX   = -1, rawY   = -1;
        let hasPos = false;

        const VS = `
            attribute vec2 a_pos;
            varying vec2 v_uv;
            void main(){
                v_uv = a_pos * 0.5 + 0.5;
                gl_Position = vec4(a_pos, 0.0, 1.0);
            }`;

        const SIM_FS = `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_prev;
            uniform sampler2D u_trail;
            uniform vec2 u_res;
            uniform float u_time;

            float hash(vec2 p){ p = fract(p*vec2(234.34,435.345)); p+=dot(p,p+34.23); return fract(p.x*p.y); }
            float noise(vec2 p){
                vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
                return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                           mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
            }
            float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;} return v; }

            void main(){
                vec2 px = 1.0 / u_res;
                float disp = fbm(v_uv*3.5 + u_time*0.12)*2.0 - 1.0;
                vec2 off = vec2(disp) * px * 4.5;

                float c  = texture2D(u_prev, v_uv + off).r;
                float cN = texture2D(u_prev, v_uv + vec2(0.0, px.y) + off).r;
                float cS = texture2D(u_prev, v_uv - vec2(0.0, px.y) + off).r;
                float cE = texture2D(u_prev, v_uv + vec2(px.x, 0.0) + off).r;
                float cW = texture2D(u_prev, v_uv - vec2(px.x, 0.0) + off).r;

                float blended = min(c, min(min(cN,cS), min(cE,cW)));
                float ink = 1.0 - texture2D(u_trail, v_uv).r;
                blended = min(blended, 1.0 - ink * 0.96);

                blended += 0.0085;
                gl_FragColor = vec4(vec3(clamp(blended,0.0,1.0)), 1.0);
            }`;

        const COMP_FS = `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_base;
            uniform sampler2D u_reveal;
            uniform sampler2D u_fluid;
            uniform vec2 u_baseSize;
            uniform vec2 u_revealSize;
            uniform vec2 u_canvas;

            vec2 coverUV(vec2 uv, vec2 img, vec2 cvs){
                float ia = img.x / img.y;
                float ca = cvs.x / cvs.y;
                vec2 s = (ia > ca) ? vec2(ca/ia, 1.0) : vec2(1.0, ia/ca);
                vec2 fuv = vec2(uv.x, 1.0 - uv.y);
                return (fuv - 0.5) * s + 0.5;
            }

            void main(){
                vec2 bUV = coverUV(v_uv, u_baseSize,   u_canvas);
                vec2 rUV = coverUV(v_uv, u_revealSize, u_canvas);

                vec3 base = texture2D(u_base, bUV).rgb;
                vec3 rev  = texture2D(u_reveal, rUV).rgb;
                float lum = dot(rev, vec3(0.299,0.587,0.114));
                lum = clamp((lum-0.5)*1.1 + 0.5, 0.0, 1.0);
                rev = vec3(lum);

                float mask = texture2D(u_fluid, v_uv).r;
                vec3 color = mix(rev, base, mask);

                float vf = max(0.0, 1.0 - v_uv.y / 0.65);
                float va = vf * vf * 0.45;
                color = mix(color, vec3(10.0/255.0), va);

                gl_FragColor = vec4(color, 1.0);
            }`;

        function compile(type, src){
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error('[fluid-reveal] Shader error:', gl.getShaderInfoLog(s)); return null;
            }
            return s;
        }
        function linkProg(vsSrc, fsSrc){
            const vs = compile(gl.VERTEX_SHADER, vsSrc);
            const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
            if (!vs || !fs) return null;
            const p = gl.createProgram();
            gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                console.error('[fluid-reveal] Program error:', gl.getProgramInfoLog(p)); return null;
            }
            return p;
        }
        const simProg  = linkProg(VS, SIM_FS);
        const compProg = linkProg(VS, COMP_FS);
        if (!simProg || !compProg) return;

        const quadBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
        function bindQuad(p){
            const loc = gl.getAttribLocation(p, 'a_pos');
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        }

        function makeFBO(w, h){
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return { tex, fbo };
        }
        let fboA = makeFBO(SIM_W, SIM_H);
        let fboB = makeFBO(SIM_W, SIM_H);
        function clearFBO(f){
            gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
            gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        clearFBO(fboA); clearFBO(fboB);

        const trailTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, trailTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM_W, SIM_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        function uploadTex(tex, img){
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        function loadTex(src){
            return new Promise(resolve => {
                const tex = gl.createTexture();

                // 1. Prefer a DOM <img> already loaded by the page - this
                //    sidesteps CORS issues on file:// since the browser
                //    already has the bytes.
                const file = src.split('/').pop();
                const domImg = document.querySelector('img[src*="' + file + '"]');
                if (domImg && domImg.complete && domImg.naturalWidth) {
                    try {
                        uploadTex(tex, domImg);
                        return resolve({ tex, w: domImg.naturalWidth, h: domImg.naturalHeight });
                    } catch (_) { /* fall through to fresh load */ }
                }

                // 2. Fallback: fresh load without crossOrigin (avoids CORS
                //    preflight that file:// can't satisfy).
                const img = new Image();
                img.onload = () => {
                    try {
                        uploadTex(tex, img);
                        resolve({ tex, w: img.naturalWidth, h: img.naturalHeight });
                    } catch (e) {
                        console.warn('[fluid-reveal] texImage2D failed', e);
                        resolve(null);
                    }
                };
                img.onerror = () => resolve(null);
                img.src = src;
            });
        }

        heroWrap.addEventListener('mousemove', e => {
            const r = heroWrap.getBoundingClientRect();
            rawX = (e.clientX - r.left) / r.width;
            rawY = (e.clientY - r.top)  / r.height;
            hasPos = true;
        });
        heroWrap.addEventListener('mouseleave', () => {
            hasPos = false; trailX = -1; trailY = -1;
        });

        const simU = {
            prev:  gl.getUniformLocation(simProg, 'u_prev'),
            trail: gl.getUniformLocation(simProg, 'u_trail'),
            res:   gl.getUniformLocation(simProg, 'u_res'),
            time:  gl.getUniformLocation(simProg, 'u_time'),
        };
        const compU = {
            base:       gl.getUniformLocation(compProg, 'u_base'),
            reveal:     gl.getUniformLocation(compProg, 'u_reveal'),
            fluid:      gl.getUniformLocation(compProg, 'u_fluid'),
            baseSize:   gl.getUniformLocation(compProg, 'u_baseSize'),
            revealSize: gl.getUniformLocation(compProg, 'u_revealSize'),
            canvas:     gl.getUniformLocation(compProg, 'u_canvas'),
        };

        window.addEventListener('resize', () => {
            heroCanvas.width  = heroWrap.clientWidth  || window.innerWidth;
            heroCanvas.height = heroWrap.clientHeight || window.innerHeight;
        });

        const seqPaths = [1,2,3,4,5].map(n => `assets/seq/${n}.webp`);
        const seqFrames = [];
        seqPaths.forEach(p => loadTex(p).then(t => { if (t) seqFrames.push(t); }));

        loadTex('assets/hero-blue.webp').then(base => {
            if (!base) { console.warn('[fluid-reveal] base failed - fallback img.'); return; }
            if (seqFrames.length === 0) seqFrames.push(base);

            let seqIdx = 0, lastSeqTime = 0, t0 = null;
            const SEQ_INTERVAL = 800;

            function frame(ts){
                requestAnimationFrame(frame);
                if (t0 === null) t0 = ts;
                const t = (ts - t0) * 0.001;

                if (ts - lastSeqTime >= SEQ_INTERVAL) {
                    seqIdx = (seqIdx + 1) % seqFrames.length;
                    lastSeqTime = ts;
                }
                const revealFrame = seqFrames[seqIdx];

                // 1. Update trail canvas
                tc.fillStyle = '#fff';
                tc.fillRect(0, 0, SIM_W, SIM_H);
                if (hasPos) {
                    const LERP = 0.14;
                    if (trailX < 0) { trailX = rawX; trailY = rawY; }
                    else { trailX += (rawX - trailX) * LERP; trailY += (rawY - trailY) * LERP; }
                    const sx = trailX * SIM_W, sy = (1.0 - trailY) * SIM_H;
                    const rx = rawX   * SIM_W, ry = (1.0 - rawY)   * SIM_H;
                    tc.strokeStyle = '#000'; tc.lineWidth = LWIDTH;
                    tc.lineCap = 'round';   tc.lineJoin = 'round';
                    tc.beginPath(); tc.moveTo(sx, sy); tc.lineTo(rx, ry); tc.stroke();
                    tc.fillStyle = '#000';
                    tc.beginPath(); tc.arc(rx, ry, LWIDTH * 0.55, 0, Math.PI * 2); tc.fill();
                }
                gl.bindTexture(gl.TEXTURE_2D, trailTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trailCanvas);

                // 2. Sim step (read fboA, write fboB)
                gl.useProgram(simProg); bindQuad(simProg);
                gl.viewport(0, 0, SIM_W, SIM_H);
                gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, fboA.tex); gl.uniform1i(simU.prev, 0);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, trailTex); gl.uniform1i(simU.trail, 1);
                gl.uniform2f(simU.res, SIM_W, SIM_H);
                gl.uniform1f(simU.time, t);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                const tmp = fboA; fboA = fboB; fboB = tmp;

                // 3. Composite to display
                gl.useProgram(compProg); bindQuad(compProg);
                gl.viewport(0, 0, heroCanvas.width, heroCanvas.height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, base.tex);        gl.uniform1i(compU.base, 0);
                gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, revealFrame.tex); gl.uniform1i(compU.reveal, 1);
                gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, fboA.tex);        gl.uniform1i(compU.fluid, 2);
                gl.uniform2f(compU.baseSize,   base.w, base.h);
                gl.uniform2f(compU.revealSize, revealFrame.w, revealFrame.h);
                gl.uniform2f(compU.canvas,     heroCanvas.width, heroCanvas.height);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            requestAnimationFrame(frame);
        });
    })();

    // ---------------------------------------------------------
    // 5. INTRO statement - 3D line-flip reveal (Mohamed-style)
    //    Each line clip-flips up from rotationX: -90 → 0 with a
    //    yPercent slide. Triggered once when the section scrolls in.
    // ---------------------------------------------------------
    (function initIntroFlip() {
        const el = document.getElementById('introStatement');
        if (!el) return;
        const lines = el.querySelectorAll('.ist-inner');
        gsap.fromTo(lines,
            {
                rotationX: -90,
                transformOrigin: '50% 100% -60px',
                opacity: 0,
                yPercent: 60,
            },
            {
                rotationX: 0,
                opacity: 1,
                yPercent: 0,
                duration: 1.1,
                ease: 'power3.out',
                stagger: 0.16,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 78%',
                    once: true,
                },
            }
        );

        // Count-up stats (only the ones with data-count)
        document.querySelectorAll('.intro-stat-num[data-count]').forEach((node) => {
            const target = parseInt(node.dataset.count, 10);
            const sfx    = node.dataset.sfx || '';
            gsap.fromTo(node, { textContent: 0 }, {
                textContent: target,
                duration: 1.6,
                ease: 'power2.out',
                snap: { textContent: 1 },
                scrollTrigger: { trigger: node, start: 'top 85%', once: true },
                onUpdate() { node.textContent = Math.round(+node.textContent) + sfx; },
            });
        });
    })();

    // ---------------------------------------------------------
    // 6. PILL NAV - active-section highlight on scroll
    // ---------------------------------------------------------
    const navLinks = document.querySelectorAll('.pill-link');
    function updateActiveNav() {
        const scrollY = window.scrollY + window.innerHeight * 0.4;
        navLinks.forEach(link => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            const top    = target.offsetTop;
            const bottom = top + target.offsetHeight;
            link.classList.toggle('is-active', scrollY >= top && scrollY < bottom);
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Smooth-scroll for pill nav clicks (skip fluid scrub when GSAP scrub running)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const tgt = document.querySelector(id);
            if (!tgt) return;
            e.preventDefault();
            const navH = 80;
            window.scrollTo({ top: tgt.offsetTop - navH, behavior: 'smooth' });
        });
    });

    // ---------------------------------------------------------
    // 7. EXPERIMENTS - Tympanus / Hiro-kiii SVG blind reveal
    //    (port of Mohamed Shehata's vibe-coding scroll section)
    // ---------------------------------------------------------
    (function initVibeCoding() {
        if (!window.ScrollTrigger) return;
        const sec = document.getElementById('experiments');
        if (!sec) return;

        const BLIND_COUNT = 30;
        const svgNS = 'http://www.w3.org/2000/svg';
        let blindsSets = [];
        let master = null;
        let progressTrigger = null;

        function createBlinds(groupId) {
            const g = document.getElementById(groupId);
            if (!g) return null;
            g.innerHTML = '';
            const vbHeight = (window.innerHeight / window.innerWidth) * 100;
            const h = vbHeight / BLIND_COUNT;
            const blinds = [];
            let currentY = 0;
            for (let i = 0; i < BLIND_COUNT; i++) {
                const centerY = vbHeight - (currentY + h / 2);
                const rectTop    = document.createElementNS(svgNS, 'rect');
                const rectBottom = document.createElementNS(svgNS, 'rect');
                [rectTop, rectBottom].forEach(r => {
                    r.setAttribute('x', 0);
                    r.setAttribute('width', 100);
                    r.setAttribute('height', 0);
                    r.setAttribute('fill', 'white');
                });
                rectTop.setAttribute('y', centerY);
                rectBottom.setAttribute('y', centerY);
                g.appendChild(rectTop); g.appendChild(rectBottom);
                blinds.push({ top: rectTop, bottom: rectBottom, y: centerY, h: h / 2 });
                currentY += h;
            }
            return blinds;
        }

        function updateLayout() {
            const vbHeight = (window.innerHeight / window.innerWidth) * 100;
            blindsSets = [];
            sec.querySelectorAll('.vc-layer').forEach(svg => {
                svg.setAttribute('viewBox', `0 0 100 ${vbHeight}`);
                const maskRect = svg.querySelector('mask rect');
                if (maskRect) {
                    maskRect.setAttribute('width', 100);
                    maskRect.setAttribute('height', vbHeight);
                }
                const img = svg.querySelector('image');
                if (img) {
                    img.setAttribute('width', 100);
                    img.setAttribute('height', vbHeight);
                }
                const groupEl = svg.querySelector('g[id^="vc-blinds-"]');
                if (!groupEl) return;
                const blinds = createBlinds(groupEl.id);
                if (blinds) blindsSets.push(blinds);
            });
            buildTimeline();
        }

        function openBlinds(blinds) {
            return gsap.timeline().to(
                blinds.flatMap(b => [b.top, b.bottom]),
                {
                    attr: {
                        y: i => {
                            const b = blinds[Math.floor(i / 2)];
                            return i % 2 === 0 ? b.y - b.h : b.y;
                        },
                        height: i => blinds[Math.floor(i / 2)].h + 0.01,
                    },
                    ease: 'power3.out',
                    stagger: { each: 0.02, from: 'start' },
                }
            );
        }

        let perPanelTriggers = [];

        function buildTimeline() {
            if (master) master.kill();
            perPanelTriggers.forEach(t => t.kill());
            perPanelTriggers = [];

            const texts = gsap.utils.toArray('#experiments .vc-txt');
            const intro = sec.querySelector('.vc-intro');

            // ---- Master timeline: ONLY drives the SVG blinds + intro fade.
            // Text panels are handled by their own per-panel ScrollTriggers
            // below (much more robust on reverse-scroll than a scrubbed
            // master timeline with clip-path tweens).
            master = gsap.timeline({
                scrollTrigger: {
                    trigger: sec,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                    invalidateOnRefresh: true,
                },
            });

            if (intro) {
                master.to({}, { duration: 0.4 });
                master.to(intro, { opacity: 0, duration: 0.4, ease: 'power2.out' });
            }
            blindsSets.forEach((blinds) => master.add(openBlinds(blinds)));

            // ---- Per-panel text triggers.
            // Each panel is visible during ITS slice of the section
            // (e.g. panel 1 = 14%-30%, panel 2 = 30%-46%, etc). We use
            // the trigger's onUpdate to set opacity + translateY directly.
            // This always reflects the current scroll position correctly,
            // so reverse-scroll never leaves a panel pinned on screen.
            const n = texts.length;
            const introSpan = 0.10;                 // first 10% is the intro fade
            const slice = (1 - introSpan) / n;
            const fadeIn  = 0.25;                   // % of slice spent fading in
            const fadeOut = 0.25;                   // % spent fading out

            const secStart = sec.offsetTop;
            const secEnd   = secStart + sec.offsetHeight - window.innerHeight;
            const secLen   = secEnd - secStart;

            texts.forEach((el, i) => {
                const startP = introSpan + i * slice;
                const endP   = startP + slice;
                const t = ScrollTrigger.create({
                    trigger: sec,
                    start: () => secStart + startP * secLen,
                    end:   () => secStart + endP   * secLen,
                    scrub: true,
                    onUpdate: (self) => {
                        const p = self.progress;     // 0 -> 1 inside this panel's slice
                        let opacity, y;
                        if (p < fadeIn) {
                            // Fade in
                            const k = p / fadeIn;
                            opacity = k;
                            y = 40 * (1 - k);
                        } else if (p > 1 - fadeOut) {
                            // Fade out
                            const k = (p - (1 - fadeOut)) / fadeOut;
                            opacity = 1 - k;
                            y = -30 * k;
                        } else {
                            opacity = 1;
                            y = 0;
                        }
                        el.style.opacity = opacity;
                        el.style.transform = `translateY(${y}px)`;
                    },
                });
                perPanelTriggers.push(t);
            });
        }

        function initProgress() {
            const fills   = gsap.utils.toArray('#experiments .vc-fill');
            const counter = document.getElementById('vcCounter');
            if (progressTrigger) progressTrigger.kill();
            progressTrigger = ScrollTrigger.create({
                trigger: sec,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
                onUpdate: self => {
                    const p = self.progress;
                    const total = fills.length;
                    let active = 0;
                    fills.forEach((fill, i) => {
                        let v = (p - i / total) * total;
                        v = Math.max(0, Math.min(1, v));
                        fill.style.width = (v * 100) + '%';
                        if (v > 0) active = i;
                    });
                    if (counter) counter.textContent = String(active + 1).padStart(2, '0');
                },
            });
        }

        updateLayout();
        initProgress();
        let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(updateLayout, 250); });
    })();

    // ---------------------------------------------------------
    // 8. BACK TO TOP - click photo in contact section
    // ---------------------------------------------------------
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------------------------------------------------------
    // 9. PROJECT MODAL - slideshow + info panel for every card
    // ---------------------------------------------------------
    (function initProjectModal() {
        // ---- Data (ported from old portfolio) ----
        const PROJECTS = {
            'maliks-b2b': {
                category: 'B2B Platform + CRM', title: 'Maliks B2B · Corporate CRM',
                description: 'B2B commerce platform and full CRM for the Maliks corporate division. Companies browse catalogues, see their own contract pricing and request quotes; the back office runs leads, deals, tasks, email, WhatsApp and ERP sync from the same system. Web admin plus a React Native app for the sales team.',
                role: 'Full-Stack Developer & System Architect', year: '2025',
                tags: ['Laravel 11', 'React', 'React Native', 'MySQL', 'Meilisearch', 'Laravel Reverb', 'Sanctum', 'Spatie Permissions'],
                link: 'https://corporate.malikspulse.com', isPrivate: false,
                images: ['assets/projects/maliks-b2b/mockup.jpg'],
                case: {
                    problem: "The corporate division sold to companies, schools, banks and NGOs through phone calls, spreadsheets and personal inboxes. Quotes, orders and follow-ups sat with whoever happened to handle them, so nothing was visible to the rest of the team and nothing survived a person leaving.",
                    built: [
                        "A B2B storefront where companies browse the catalogue, see their own contract pricing and submit quote requests. There is no public checkout, because these accounts buy on terms",
                        "A full CRM behind it: leads, deals, tasks, activities, client requests, scheduled payments and sales targets",
                        "An IMAP email client and a WhatsApp inbox built into the CRM, so client conversation lives on the client record instead of in someone's personal mailbox",
                        "Strict per-company data scoping, so a client user can only ever see their own company's data, enforced server-side rather than hidden in the interface",
                        "Two-way ERP sync so pricing, stock and sales figures match the accounting system",
                        "Meilisearch for instant catalogue search, and Laravel Reverb for live updates and chat",
                        "A React Native app covering ten of the modules, so the sales team works from the road",
                    ],
                    result: [
                        "One system replaces the spreadsheets, the personal inboxes and the phone-call trail",
                        "Every quote, order and conversation is attached to the company record and survives staff changes",
                        "Sales work from their phones while the back office sees the same data in real time",
                        "The largest system I have built, at around 190 database models spanning commerce, CRM, messaging and reporting",
                    ],
                },
            },
            'asaarna-v2': {
                category: 'Internal Platform', title: 'As3arna V2 · Branch Terminal',
                description: 'Rebuild of the Maliks and Doculand price list system as a modular platform: catalogue, pricing, costing, quotes, ordering, stock, transfers and an AI image studio, opened from a terminal in every branch.',
                role: 'Full-Stack Developer & Architect', year: '2026',
                tags: ['Laravel 12', 'React 19', 'TypeScript', 'Vite', 'MySQL', 'PWA'],
                link: null, isPrivate: true,
                images: ['assets/projects/asaarna-v2/mockup.jpg'],
                case: {
                    problem: "The original price list system had grown into one codebase where pricing, costing, quoting and stock were tangled together. Every change risked breaking something unrelated, and branches waited on head office for prices that move every week.",
                    built: [
                        "Rebuilt as a Laravel 12 modular monolith of 24 modules (Catalog, Pricing, Costing, Quotes, Ordering, Stock, Transfers, Invoicing, Studio and more), each with its own controllers, models and routes",
                        "React 19 and TypeScript front end, installable as a PWA so a branch terminal keeps working when the connection drops",
                        "Branch-account sign-in, so staff open the terminal without head office having to set it up",
                        "An AI studio built in: background removal, restoration, colourisation, OCR, passport photos, name tags, price tags and barcodes",
                        "Tests on both sides, so a change to pricing can no longer silently break costing",
                    ],
                    result: [
                        "Branches serve customers without waiting on head office for a price",
                        "Modules can be changed independently, instead of one codebase where everything touches everything",
                        "The AI studio replaced work that used to be sent out to a designer",
                    ],
                },
            },
            'wc-photobooth': {
                category: 'AI Experience', title: 'World Cup 2026 Photobooth',
                description: 'In-store AI photobooth for the 2026 World Cup. A customer takes a photo and gets it back wearing their team kit, or standing next to a football star. Face detection runs in the browser, image generation on a Laravel backend, and the result is delivered by QR code.',
                role: 'Full-Stack Developer & AI Engineer', year: '2026',
                tags: ['React 19', 'Three.js', 'face-api.js', 'Laravel', 'Replicate API', 'Framer Motion'],
                link: 'https://ai.malikspulse.com', isPrivate: false,
                images: ['assets/projects/wc-photobooth/mockup.jpg'],
                case: {
                    problem: "Seasonal in-store campaigns are posters people walk past. There was nothing that made a customer stop, take part, and leave with something they would actually show to other people.",
                    built: [
                        "A React 19 photobooth that runs on an in-store screen or on the customer's own phone",
                        "face-api.js does face detection in the browser first, so a bad photo is rejected before it costs an AI generation",
                        "Laravel backend calling the Replicate API to place the customer in their team kit, or beside a football star",
                        "QR delivery, so the customer scans and walks away with the image already on their phone",
                        "Three.js and Framer Motion for the stadium atmosphere, with sound",
                    ],
                    result: [
                        "A campaign customers take part in and share, instead of one they walk past",
                        "Checking the face before generating keeps the AI cost per customer down",
                        "The same build runs in-store and on a phone, so the campaign is not limited to branch hardware",
                    ],
                },
            },
            'tower-rush': {
                category: 'Game \u00b7 Kiosk', title: 'Maliks Back-to-School Tower',
                description: 'One-touch stacking game for 32-inch touchscreen kiosks in Maliks branches. Players stack real Maliks products and catch flying items for bonus points. Phaser 3 game with a Laravel leaderboard, offline play and per-branch configuration.',
                role: 'Game Developer & Full-Stack', year: '2025',
                tags: ['Phaser 3', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Kiosk'],
                link: 'https://game.ai.malikspulse.com', isPrivate: false,
                images: ['assets/projects/tower-rush/mockup.jpg'],
                case: {
                    problem: "Back-to-school is the busiest season in the branches, and there was nothing to hold a child's attention while a parent shopped, and no reason for a family to stay longer or to come back.",
                    built: [
                        "A Phaser 3 stacking game in React and TypeScript, running full screen on 32-inch touch kiosks",
                        "Players stack real Maliks products (bags, pencil cases, lunch boxes) photographed for the game",
                        "Laravel API for branch registration, leaderboard, analytics and per-branch game settings",
                        "No-password device login: a branch picks itself once and the kiosk stays registered",
                        "Works offline and syncs scores when the connection returns, because branch wifi is not reliable",
                        "English and French, switched on the title screen",
                    ],
                    result: [
                        "A reason for families to stay in store during the busiest season of the year",
                        "Per-branch leaderboards and play analytics head office can actually read",
                        "Runs unattended on kiosk hardware, so no staff member has to reset it",
                    ],
                },
            },
            'gta-portfolio': {
                category: 'Creative Build', title: 'Vice City Portfolio',
                description: 'My CV rebuilt as a Grand Theft Auto: Vice City pause menu, with a loading screen, neon Beirut skyline, a HUD with health, cash and wanted stars, a minimap, and a loadout wheel. Every section of a CV mapped onto a game menu item.',
                role: 'Designer & Developer', year: '2026',
                tags: ['Astro', 'GSAP', 'JavaScript', 'CSS', 'Illustration'],
                link: 'https://aquamarine-fairy-5ff37e.netlify.app', isPrivate: false,
                images: ['assets/projects/gta-portfolio/mockup.jpg'],
                case: {
                    problem: "A developer CV is a PDF that looks like every other PDF. I wanted a version somebody would actually finish reading, and still remember afterwards.",
                    built: [
                        "The whole CV rebuilt as a Vice City pause menu, where About, Skills, Projects, Experience, Achievements, Services and Contact all become menu entries",
                        "A scripted loading screen, because half the memory of that game is waiting for it to load",
                        "A full HUD: clock, cash, health bar, wanted stars and a working minimap",
                        "Keyboard-first navigation with arrows, Enter, Esc, and Tab for the loadout wheel",
                        "A Beirut rooftop illustration at sunset, drawn for this rather than bought",
                        "Astro and GSAP, with no framework weight behind it",
                    ],
                    result: [
                        "People finish it, and they remember it afterwards",
                        "Shows design and front-end craft in one artefact, instead of claiming both on a list of skills",
                    ],
                },
            },
            'cs-portfolio': {
                category: 'Creative Build', title: 'Counter-Strike 1.3 Portfolio',
                description: 'The same CV as a Counter-Strike 1.3 server browser, with a connect screen that precaches sounds, de_italy in the background, a buy menu, match history and awards. A second take on the same content in a completely different visual language.',
                role: 'Designer & Developer', year: '2026',
                tags: ['Astro', 'GSAP', 'JavaScript', 'CSS', 'Pixel UI'],
                link: 'https://warm-crostata-37e268.netlify.app', isPrivate: false,
                images: ['assets/projects/cs-portfolio/mockup.jpg'],
                case: {
                    problem: "Having built the Vice City version, I wanted to prove the idea was not a one-off trick, and that I could take the same content and rebuild it convincingly in a completely different visual language.",
                    built: [
                        "A CS 1.3 connect sequence, down to 'precaching sounds' and the map name sitting on the loading bar",
                        "CV sections mapped onto the game's own menu: Player Info, Loadout, Missions, Match History, Awards, Contract and Radio",
                        "de_italy rendered as the backdrop, with the orange terminal palette and bitmap type of the original",
                        "The same Astro and GSAP foundation as the Vice City build, reskinned end to end",
                    ],
                    result: [
                        "Two complete portfolios from one set of content, in two different visual worlds",
                        "That pairing is the point: the design is deliberate, not something I got lucky with once",
                    ],
                },
            },
            'pulse-dashboard': {
                category: 'Web Development', title: 'Maliks Pulse · HR System',
                description: 'Complete HR management system integrated with AI (OpenAI + Claude APIs) to generate professional reports and employee images. Features KPI tracking, vacation management, performance reviews, attendance, and customised dashboards.',
                role: 'Full-Stack Developer & Project Lead', year: '2024',
                tags: ['Laravel', 'React', 'MySQL', 'OpenAI', 'Claude', 'WebSockets'],
                case: {
                    problem: "Maliks runs more than 30 branches. Attendance, leave, performance and payroll each lived in a different place, so head office never had one current picture of the workforce, and every management report had to be assembled by hand.",
                    built: [
                        "Laravel API and React dashboard covering attendance, leave, KPIs, performance reviews and payroll",
                        "Role-based views, so a branch manager, an HR officer and a director each see only what they need",
                        "Live updates over WebSockets: approvals and attendance appear without a refresh",
                        "AI reporting layer on the OpenAI and Claude APIs that turns raw HR data into written management reports",
                        "AI-generated employee imagery for profiles and internal communications",
                    ],
                    result: [
                        "Attendance, leave, performance and payroll for 30+ branches and roughly 550 users run through a single system",
                        "Reports that were written by hand are generated from live data",
                        "In daily production use, and still built and maintained by me",
                    ],
                },
                link: null, isPrivate: true,
                images: ['assets/projects/pulse-dashboard/mockup.webp','assets/projects/pulse-dashboard/1.webp','assets/projects/pulse-dashboard/2.webp','assets/projects/pulse-dashboard/3.webp','assets/projects/pulse-dashboard/4.webp','assets/projects/pulse-dashboard/5.webp','assets/projects/pulse-dashboard/6.webp','assets/projects/pulse-dashboard/7.webp','assets/projects/pulse-dashboard/8.webp'],
            },
            'pulse-mobile': {
                category: 'Mobile App', title: 'Maliks Pulse Mobile',
                description: 'Cross-platform mobile companion for Maliks Pulse. Managers monitor sales, approve requests, and receive real-time notifications. Built with React Native for iOS + Android.',
                role: 'Mobile Developer', year: '2024',
                tags: ['React Native', 'Redux', 'Push Notifications'], link: null, isPrivate: true,
                case: {
                    problem: "Managers spend their day on the shop floor, not at a desk. Anything needing their approval sat waiting until they were back at a computer, which slowed down every request behind it.",
                    built: [
                        "React Native app for iOS and Android running on the same Laravel backend as the Pulse dashboard",
                        "Sales monitoring, request approvals and real-time push notifications",
                        "Redux state layer tuned for older Android devices and weak connections",
                    ],
                    result: [
                        "Approvals happen on the floor instead of waiting for desk time",
                        "Managers are alerted to sales and requests as they happen",
                        "One backend serves both the web dashboard and the app, so there is no duplicated business logic",
                    ],
                },
                images: ['assets/projects/pulse-mobile/mockup.jpg','assets/projects/pulse-mobile/1.png','assets/projects/pulse-mobile/2.png','assets/projects/pulse-mobile/3.png','assets/projects/pulse-mobile/4.png','assets/projects/pulse-mobile/5.png','assets/projects/pulse-mobile/6.png'],
            },
            'ai-system': {
                category: 'AI Game', title: 'Maliks Valentine Game',
                description: 'Interactive Valentine\'s Day game where customers draw a heart on screen; a perfect heart wins a free AI-generated photo via Nano Banana Pro. Canvas-API drawing detection + AI image gen pipeline.',
                role: 'Full-Stack Developer & AI Engineer', year: '2024',
                tags: ['JavaScript', 'Canvas API', 'Nano Banana AI', 'Laravel'], link: null, isPrivate: true,
                images: ['assets/projects/ai-system/mockup.webp','assets/projects/ai-system/1.webp','assets/projects/ai-system/2.webp','assets/projects/ai-system/3.webp','assets/projects/ai-system/4.webp'],
            },
            'tracking': {
                category: 'Mobile + Web', title: 'Maliks Deliveries Tracking',
                description: 'Delivery tracking system with a driver mobile app. Real-time GPS, daily/weekly/monthly movement reports, delivery status updates, route history. Managers monitor every driver live on a dashboard.',
                role: 'Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'React Native', 'Google Maps API', 'Firebase', 'MySQL'], link: null, isPrivate: true,
                case: {
                    problem: "Once a delivery left the branch it was invisible. There was no record of where a driver had been, which route they took, or when a delivery was actually completed, so customer questions and driver disputes could not be settled with evidence.",
                    built: [
                        "React Native driver app reporting GPS position in the background",
                        "Laravel and MySQL backend, with Firebase handling push and live sync",
                        "Dispatcher dashboard on the Google Maps API showing every active driver live",
                        "Delivery status updates and full route history per driver",
                        "Automated daily, weekly and monthly movement reports",
                    ],
                    result: [
                        "Dispatchers see every one of the 25 active drivers on a single map",
                        "Every delivery carries a timestamped route history, so questions are answered from data instead of memory",
                        "Movement reporting is generated automatically rather than compiled by hand",
                    ],
                },
                images: ['assets/projects/tracking/mockup.webp'],
            },
            'warehouse': {
                category: 'Enterprise System', title: 'Maliks Warehouse Management',
                description: 'Full warehouse management with payroll and attendance. Stock control, inventory, barcode scanning, automated reordering, multi-location sync, and reporting.',
                role: 'Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'React', 'Barcode API', 'MySQL', 'Payroll'], link: null, isPrivate: true,
                case: {
                    problem: "Stock moved constantly between a central warehouse and 30+ branches, tracked by manual entry. There was no single live stock figure that head office and the branches both trusted, and reordering depended on someone remembering.",
                    built: [
                        "Laravel and React system for stock control and multi-location inventory",
                        "Barcode scanning for receiving, transfers and stock counts",
                        "Inter-branch transfer workflow with approval steps",
                        "Automated reorder triggers based on live stock levels",
                        "Attendance and payroll for warehouse staff handled in the same system",
                        "Reporting across every location",
                    ],
                    result: [
                        "One live stock figure shared by the warehouse and all 30+ branches",
                        "Counts and transfers are done by scanning instead of typing",
                        "Reordering is triggered by the system rather than remembered by a person",
                    ],
                },
                images: ['assets/projects/warehouse/mockup.webp'],
            },
            'as3arna': {
                category: 'E-Commerce', title: 'As3arna · Price Platform',
                description: 'Price-comparison and tracking platform for the Lebanese market. Compare across stores, set price alerts, and find best deals. Web-scraping pipeline + history graphs.',
                role: 'Founder · Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'Vue.js', 'Web Scraping', 'MySQL'],
                case: {
                    problem: "Prices for the same product vary widely between Lebanese retailers and move fast. Shoppers had no way to compare across stores, and no way to tell whether the price in front of them was actually a good one.",
                    built: [
                        "Laravel and Vue platform with a scraping pipeline that normalises the same product across stores that name it differently",
                        "Price history graphs, so a shopper can see whether today's price is genuinely low",
                        "Price alerts that fire when a tracked product drops",
                        "Search and comparison built to stay usable on slow connections",
                    ],
                    result: [
                        "Live at as3arna.net",
                        "My own product: I built the scraping, the backend, the frontend and the design",
                        "Solves the hard part of price comparison, which is matching one real product across inconsistent store listings",
                    ],
                },
                link: 'https://as3arna.net', isPrivate: false,
                images: ['assets/projects/as3arna/mockup.webp'],
            },
            'filali': {
                category: 'Web Development', title: 'Filali Engineers',
                description: 'Professional website for Filali Engineering. Project showcase, services, and company portfolio with modern design and smooth animations.',
                role: 'Web Developer & Designer', year: '2023',
                tags: ['HTML/CSS', 'JavaScript', 'PHP'],
                link: 'http://filaliengineers.com', isPrivate: false,
                images: ['assets/projects/filali/mockup.webp'],
            },
            'mediahub': {
                category: 'Web Platform', title: 'Hostify',
                description: 'Airbnb-style rental platform for Lebanon. List properties, browse rentals, book stays, manage reservations. Auth, payments, reviews, messaging.',
                role: 'Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'Vue.js', 'MySQL', 'Stripe', 'Google Maps'],
                link: 'https://slategray-emu-126412.hostingersite.com', isPrivate: false,
                images: ['assets/projects/mediahub/mockup.webp'],
            },
            'codesign': {
                category: 'Web Development', title: 'Codesign LB',
                description: 'Design-agency site with a portfolio gallery, team section and service showcase. Clean modern design with smooth scrolling effects.',
                role: 'Web Developer & Designer', year: '2022',
                tags: ['HTML/CSS', 'JavaScript', 'GSAP'],
                link: 'https://codesignlb.com', isPrivate: false,
                images: ['assets/projects/codesign/mockup.webp'],
            },
            'bakhoss': {
                category: 'Digital Invitation', title: 'Bakhos & Souzana · Wedding',
                description: 'Elegant digital wedding invitation with RSVP. Animations, event details, location map, photo gallery, guest confirmations.',
                role: 'Web Developer & Designer', year: '2022',
                tags: ['HTML/CSS', 'JavaScript', 'GSAP', 'Google Maps'],
                link: 'http://bakhossouzana.com', isPrivate: false,
                images: ['assets/projects/bakhoss/mockup.webp'],
            },
            'golden-coast': {
                category: 'Portfolio', title: 'Golden Coast',
                description: 'Corporate portfolio website for Golden Coast covering services, projects and company info. Modern design and smooth UX.',
                role: 'Web Developer & Designer', year: '2023',
                tags: ['HTML/CSS', 'JavaScript', 'PHP'],
                link: 'https://olivedrab-rhinoceros-902407.hostingersite.com', isPrivate: false,
                images: ['assets/projects/golden-coast/mockup.webp','assets/projects/golden-coast/1.webp','assets/projects/golden-coast/2.webp','assets/projects/golden-coast/3.webp','assets/projects/golden-coast/4.webp','assets/projects/golden-coast/5.webp','assets/projects/golden-coast/6.webp'],
            },
            'mini-market': {
                category: 'ERP System', title: 'Mini Market ERP',
                description: 'Complete ERP for mini markets and small retail stores. Inventory, POS, sales tracking, and reporting dashboards.',
                role: 'Full-Stack Developer', year: '2024',
                tags: ['Laravel', 'Vue.js', 'MySQL', 'POS'],
                case: {
                    problem: "Small retail shops need the same inventory and sales control a chain has, but cannot run enterprise software and cannot pay enterprise prices or hire someone to operate it.",
                    built: [
                        "Laravel and Vue ERP combining POS, inventory and sales tracking",
                        "Reporting dashboards for daily takings, stock movement and margins",
                        "Designed to be set up and run by the shop owner, not an IT department",
                    ],
                    result: [
                        "Inventory, point of sale and reporting in one system a single owner can operate",
                        "In daily use by a real shop, not a demo",
                    ],
                },
                link: 'https://violet-butterfly-367429.hostingersite.com', isPrivate: true,
                images: ['assets/projects/mini-market/mockup.webp','assets/projects/mini-market/1.webp','assets/projects/mini-market/2.webp','assets/projects/mini-market/3.webp','assets/projects/mini-market/4.webp','assets/projects/mini-market/5.webp','assets/projects/mini-market/6.webp'],
            },
            'pulse-old': {
                category: 'Legacy System', title: 'Maliks Pulse (Legacy)',
                description: 'Original Maliks Pulse, the foundation that evolved into the current HR and enterprise management platform.',
                role: 'Full-Stack Developer', year: '2022',
                tags: ['Laravel', 'jQuery', 'MySQL', 'Bootstrap'],
                link: 'http://demo.malikspulse.com', isPrivate: true,
                images: ['assets/projects/pulse-old/mockup.webp','assets/projects/pulse-old/1.webp','assets/projects/pulse-old/2.webp','assets/projects/pulse-old/3.webp','assets/projects/pulse-old/4.webp','assets/projects/pulse-old/5.webp','assets/projects/pulse-old/6.webp','assets/projects/pulse-old/7.webp','assets/projects/pulse-old/8.webp'],
            },
        };

        const THREED = {
            'almaza':           { category: 'Product', title: 'Almaza',            description: '3D product visualisation of Almaza beer bottle. Photoreal render in Blender with studio lighting.' },
            'black-opuim':      { category: 'Product', title: 'Black Opium',       description: 'YSL Black Opium perfume bottle. High-end product visualisation with dramatic lighting.' },
            'la-vie-est-belle': { category: 'Product', title: 'La Vie Est Belle',  description: 'Lancôme La Vie Est Belle perfume. Elegant product render with soft lighting.' },
            'valentino':        { category: 'Product', title: 'Valentino',         description: 'Valentino fragrance bottle. Luxury product visualisation with studio setup.' },
            'spice-bomb':       { category: 'Product', title: 'Spice Bomb',        description: 'Viktor & Rolf Spice Bomb perfume. Bold product render with explosive theme.' },
            'la-nuit-de-lhomme':{ category: 'Product', title: "La Nuit de l'Homme", description: "YSL La Nuit de l'Homme fragrance. Sophisticated product visualisation." },
            'lhomme-prada':     { category: 'Product', title: "L'Homme Prada",     description: 'Prada fragrance bottle. Minimalist luxury product render.' },
            'redbull':          { category: 'Product', title: 'Red Bull',          description: 'Red Bull energy drink can. Dynamic product visualisation with energetic mood.' },
            'freeze':           { category: 'Product', title: 'Freeze',            description: 'Cool, refreshing aesthetic. Professional studio render.' },
            'kitkat':           { category: 'Product', title: 'KitKat',            description: 'KitKat chocolate bar. Appetising product visualisation with realistic textures.' },
            'pringles':         { category: 'Product', title: 'Pringles',          description: 'Pringles can. Fun and playful product render.' },
            'prill':            { category: 'Product', title: 'Prill',             description: 'Prill cleaning product. Clean and professional product visualisation.' },
            'lysedia-jar':      { category: 'Product', title: 'Lysedia Jar',       description: 'Cosmetic jar. Elegant beauty product render with soft lighting.' },
            'sport-bottle':     { category: 'Product', title: 'Sport Bottle',      description: 'Sports water bottle. Active-lifestyle product visualisation.' },
            'chess':            { category: 'Product', title: 'Chess',             description: 'Chess pieces. Artistic render with dramatic lighting.' },
            'white-mugs':       { category: 'Product', title: 'White Mugs',        description: 'Ceramic mugs. Clean minimalist product visualisation.' },
            'badges':           { category: 'Product', title: 'Badges',            description: 'Promotional badges. Detailed product render with realistic materials.' },
        };

        // Auto-derive image lists for the 3D pieces from disk layout. Most
        // have skeleton.webp + final.webp; otherwise final only.
        const NO_SKELETON = new Set(['la-nuit-de-lhomme']);
        for (const id in THREED) {
            THREED[id].role  = '3D Artist · Blender';
            THREED[id].year  = '2024';
            THREED[id].tags  = ['Blender', 'Cycles', 'Product Render'];
            THREED[id].link  = null;
            THREED[id].images = NO_SKELETON.has(id)
                ? [`assets/3d-work/${id}/final.webp`]
                : [`assets/3d-work/${id}/final.webp`, `assets/3d-work/${id}/skeleton.webp`];
        }

        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;
        const slidesWrap = document.getElementById('lightboxSlides');
        const counter    = document.getElementById('lightboxCounter');
        const elCat      = document.getElementById('lightboxCat');
        const elTitle    = document.getElementById('lightboxTitle');
        const elDesc     = document.getElementById('lightboxDesc');
        const elCase     = document.getElementById('lightboxCase');
        const elMeta     = document.getElementById('lightboxMeta');
        const elTech     = document.getElementById('lightboxTech');
        const elCta      = document.getElementById('lightboxCta');
        const closeBtn   = lightbox.querySelector('.lightbox-close');
        const backdrop   = lightbox.querySelector('.lightbox-backdrop');
        const prevBtn    = lightbox.querySelector('.lightbox-prev');
        const nextBtn    = lightbox.querySelector('.lightbox-next');

        let slides = [];
        let idx    = 0;

        function renderSlides(images) {
            slidesWrap.innerHTML = '';
            slides = images.map((src, i) => {
                const img = document.createElement('img');
                img.alt = '';
                // Lazy-load all but the first
                if (i === 0) img.src = src; else img.dataset.src = src;
                if (i === 0) img.classList.add('is-active');
                slidesWrap.appendChild(img);
                return img;
            });
            const hasMany = images.length > 1;
            prevBtn.hidden = !hasMany;
            nextBtn.hidden = !hasMany;
            counter.hidden = !hasMany;
            idx = 0;
            updateCounter();
        }
        function updateCounter() {
            counter.textContent = `${idx + 1} / ${slides.length}`;
        }
        function go(to) {
            if (slides.length < 2) return;
            const next = ((to % slides.length) + slides.length) % slides.length;
            const el = slides[next];
            if (el.dataset.src && !el.src) { el.src = el.dataset.src; delete el.dataset.src; }
            slides[idx].classList.remove('is-active');
            el.classList.add('is-active');
            idx = next;
            updateCounter();
        }

        function render(data) {
            renderSlides(data.images);
            elCat.textContent   = data.category || '';
            elTitle.textContent = data.title    || '';
            elDesc.textContent  = data.description || '';
            if (elCase) {
                const cs = data.case;
                if (cs) {
                    const items = list => (list || []).map(t => `<li>${t}</li>`).join('');
                    elCase.innerHTML = `
                        <div class="lightbox-case-block">
                            <span class="lightbox-meta-label">The problem</span>
                            <p class="lightbox-case-text">${cs.problem}</p>
                        </div>
                        <div class="lightbox-case-block">
                            <span class="lightbox-meta-label">What I built</span>
                            <ul class="lightbox-case-list">${items(cs.built)}</ul>
                        </div>
                        <div class="lightbox-case-block">
                            <span class="lightbox-meta-label">Impact</span>
                            <ul class="lightbox-case-list">${items(cs.result)}</ul>
                        </div>`;
                    elCase.hidden = false;
                } else {
                    elCase.innerHTML = '';
                    elCase.hidden = true;
                }
            }
            elMeta.innerHTML = `
                <div class="lightbox-meta-item">
                    <span class="lightbox-meta-label">Role</span>
                    <span class="lightbox-meta-value">${data.role || '-'}</span>
                </div>
                <div class="lightbox-meta-item">
                    <span class="lightbox-meta-label">Year</span>
                    <span class="lightbox-meta-value">${data.year || '-'}</span>
                </div>`;
            elTech.innerHTML = (data.tags || []).map(t => `<span class="lightbox-tech-tag">${t}</span>`).join('');
            if (data.link) {
                elCta.href = data.link;
                elCta.hidden = false;
            } else {
                elCta.removeAttribute('href');
                elCta.hidden = true;
            }
        }

        function open(data) {
            render(data);
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            if (typeof lenis !== 'undefined' && lenis.stop) lenis.stop();
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }
        function close() {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            if (typeof lenis !== 'undefined' && lenis.start) lenis.start();
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        backdrop.addEventListener('click', close);
        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', () => go(idx - 1));
        nextBtn.addEventListener('click', () => go(idx + 1));
        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape')     close();
            if (e.key === 'ArrowLeft')  go(idx - 1);
            if (e.key === 'ArrowRight') go(idx + 1);
        });
        // Block scroll-through
        const blockScroll = e => {
            if (lightbox.classList.contains('is-open') && !e.target.closest('.lightbox-info')) e.preventDefault();
        };
        lightbox.addEventListener('wheel',     blockScroll, { passive: false });
        lightbox.addEventListener('touchmove', blockScroll, { passive: false });

        function fallbackFromCard(card, isThreeD) {
            // Card had no data entry - synthesise a minimal info set
            const img = card.querySelector('img');
            const title = card.querySelector('.work-card-title, .threed-card-label');
            const cat   = card.querySelector('.work-card-meta');
            return {
                category: cat ? cat.textContent.trim() : (isThreeD ? '3D · Blender' : 'Project'),
                title: title ? title.textContent.trim() : (img && img.alt) || 'Untitled',
                description: '', role: '', year: '', tags: [], link: null,
                images: img ? [img.currentSrc || img.src] : [],
            };
        }

        // Wire clicks: project cards
        document.querySelectorAll('.work-card, .v-item[data-project]').forEach(card => {
            card.style.cursor = 'zoom-in';
            card.addEventListener('click', () => {
                const id = card.dataset.project;
                open(PROJECTS[id] || fallbackFromCard(card, false));
            });
        });
        // 3D cards
        document.querySelectorAll('.threed-card').forEach(card => {
            card.style.cursor = 'zoom-in';
            card.addEventListener('click', () => {
                const id = card.dataset['3d'];
                open(THREED[id] || fallbackFromCard(card, true));
            });
        });
    })();

    // ---------------------------------------------------------
    // 6. Reduced motion fallback
    // ---------------------------------------------------------
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.globalTimeline.timeScale(0.0001); // kill all anims
        document.querySelectorAll('.char-anim').forEach(el => el.style.transform = 'none');
    }

})();
