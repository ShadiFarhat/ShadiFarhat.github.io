/* =========================================================
   Shadi Farhat — Portfolio v2
   Base + Hero behaviors.
   Sections will be added one-by-one (about, career, etc.).
   ========================================================= */

(() => {
    'use strict';

    // ---------------------------------------------------------
    // PRELOADER — fills progress bar, dismisses on full load
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
        // Hard cap — always dismiss within 5s no matter what
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
    // 3. HERO — scroll-linked reveal
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

    // Initial intro fade-in (page load only — one-shot)
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
    // 4. HERO — WebGL Fluid Reveal (Mohamed Shehata's pipeline)
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
    //    in/out is purely the shader's natural dissipation — no manual
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

                // 1. Prefer a DOM <img> already loaded by the page — this
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

        const seqPaths = [1,2,3,4,5].map(n => `assets/seq/${n}.jpeg`);
        const seqFrames = [];
        seqPaths.forEach(p => loadTex(p).then(t => { if (t) seqFrames.push(t); }));

        loadTex('assets/hero-blue.jpg').then(base => {
            if (!base) { console.warn('[fluid-reveal] base failed — fallback img.'); return; }
            if (seqFrames.length === 0) seqFrames.push(base);

            let seqIdx = 0, lastSeqTime = 0, t0 = null;
            const SEQ_INTERVAL = 1000;

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
    // 5. INTRO statement — 3D line-flip reveal (Mohamed-style)
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
    // 6. PILL NAV — active-section highlight on scroll
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
    // 7. EXPERIMENTS — Tympanus / Hiro-kiii SVG blind reveal
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
        function textIn(el)  { return gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)',   y: 0,   duration: 1.5, ease: 'expo.out' }); }
        function textOut(el) { return gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', y: -30, duration: 1.2, ease: 'power2.inOut' }); }

        function buildTimeline() {
            if (master) master.kill();
            const texts = gsap.utils.toArray('#experiments .vc-txt');
            const intro = sec.querySelector('.vc-intro');

            master = gsap.timeline({
                scrollTrigger: {
                    trigger: sec,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 2.5,
                    invalidateOnRefresh: true,
                },
            });

            if (intro) {
                master.to({}, { duration: 0.6 });
                master.to(intro, { opacity: 0, duration: 0.6, ease: 'power2.out' });
            }

            blindsSets.forEach((blinds, i) => {
                master.add(openBlinds(blinds));
                if (texts[i]) {
                    master.add(textIn(texts[i]), '-=0.3');
                    if (i < blindsSets.length - 1) master.add(textOut(texts[i]), '+=0.8');
                    else master.to({}, { duration: 0.8 });
                }
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
    // 8. BACK TO TOP — click photo in contact section
    // ---------------------------------------------------------
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------------------------------------------------------
    // 6. Reduced motion fallback
    // ---------------------------------------------------------
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.globalTimeline.timeScale(0.0001); // kill all anims
        document.querySelectorAll('.char-anim').forEach(el => el.style.transform = 'none');
    }

})();
