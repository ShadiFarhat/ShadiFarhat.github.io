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

        const seqPaths = [1,2,3,4,5].map(n => `assets/seq/${n}.webp`);
        const seqFrames = [];
        seqPaths.forEach(p => loadTex(p).then(t => { if (t) seqFrames.push(t); }));

        loadTex('assets/hero-blue.webp').then(base => {
            if (!base) { console.warn('[fluid-reveal] base failed — fallback img.'); return; }
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
    // 8. BACK TO TOP — click photo in contact section
    // ---------------------------------------------------------
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------------------------------------------------------
    // 9. PROJECT MODAL — slideshow + info panel for every card
    // ---------------------------------------------------------
    (function initProjectModal() {
        // ---- Data (ported from old portfolio) ----
        const PROJECTS = {
            'pulse-dashboard': {
                category: 'Web Development', title: 'Maliks Pulse — HR System',
                description: 'Complete HR management system integrated with AI (OpenAI + Claude APIs) to generate professional reports and employee images. Features KPI tracking, vacation management, performance reviews, attendance, and customised dashboards.',
                role: 'Full-Stack Developer & Project Lead', year: '2024',
                tags: ['Laravel', 'React', 'MySQL', 'OpenAI', 'Claude', 'WebSockets'],
                link: null, isPrivate: true,
                images: ['assets/projects/pulse-dashboard/mockup.webp','assets/projects/pulse-dashboard/1.webp','assets/projects/pulse-dashboard/2.webp','assets/projects/pulse-dashboard/3.webp','assets/projects/pulse-dashboard/4.webp','assets/projects/pulse-dashboard/5.webp','assets/projects/pulse-dashboard/6.webp','assets/projects/pulse-dashboard/7.webp','assets/projects/pulse-dashboard/8.webp'],
            },
            'pulse-mobile': {
                category: 'Mobile App', title: 'Maliks Pulse Mobile',
                description: 'Cross-platform mobile companion for Maliks Pulse. Managers monitor sales, approve requests, and receive real-time notifications. Built with React Native for iOS + Android.',
                role: 'Mobile Developer', year: '2024',
                tags: ['React Native', 'Redux', 'Push Notifications'], link: null, isPrivate: true,
                images: ['assets/projects/pulse-mobile/mockup.jpg','assets/projects/pulse-mobile/1.png','assets/projects/pulse-mobile/2.png','assets/projects/pulse-mobile/3.png','assets/projects/pulse-mobile/4.png','assets/projects/pulse-mobile/5.png','assets/projects/pulse-mobile/6.png'],
            },
            'ai-system': {
                category: 'AI Game', title: 'Maliks Valentine Game',
                description: 'Interactive Valentine\'s Day game — customers draw a heart on screen; a perfect heart wins a free AI-generated photo via Nano Banana Pro. Canvas-API drawing detection + AI image gen pipeline.',
                role: 'Full-Stack Developer & AI Engineer', year: '2024',
                tags: ['JavaScript', 'Canvas API', 'Nano Banana AI', 'Laravel'], link: null, isPrivate: true,
                images: ['assets/projects/ai-system/mockup.webp','assets/projects/ai-system/1.webp','assets/projects/ai-system/2.webp','assets/projects/ai-system/3.webp','assets/projects/ai-system/4.webp'],
            },
            'tracking': {
                category: 'Mobile + Web', title: 'Maliks Deliveries Tracking',
                description: 'Delivery tracking system with a driver mobile app. Real-time GPS, daily/weekly/monthly movement reports, delivery status updates, route history. Managers monitor every driver live on a dashboard.',
                role: 'Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'React Native', 'Google Maps API', 'Firebase', 'MySQL'], link: null, isPrivate: true,
                images: ['assets/projects/tracking/mockup.webp'],
            },
            'warehouse': {
                category: 'Enterprise System', title: 'Maliks Warehouse Management',
                description: 'Full warehouse management with payroll and attendance. Stock control, inventory, barcode scanning, automated reordering, multi-location sync, and reporting.',
                role: 'Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'React', 'Barcode API', 'MySQL', 'Payroll'], link: null, isPrivate: true,
                images: ['assets/projects/warehouse/mockup.webp'],
            },
            'as3arna': {
                category: 'E-Commerce', title: 'As3arna — Price Platform',
                description: 'Price-comparison and tracking platform for the Lebanese market. Compare across stores, set price alerts, and find best deals. Web-scraping pipeline + history graphs.',
                role: 'Founder · Full-Stack Developer', year: '2023',
                tags: ['Laravel', 'Vue.js', 'Web Scraping', 'MySQL'],
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
                description: 'Design-agency site — portfolio gallery, team section, service showcase. Clean modern design with smooth scrolling effects.',
                role: 'Web Developer & Designer', year: '2022',
                tags: ['HTML/CSS', 'JavaScript', 'GSAP'],
                link: 'https://codesignlb.com', isPrivate: false,
                images: ['assets/projects/codesign/mockup.webp'],
            },
            'bakhoss': {
                category: 'Digital Invitation', title: 'Bakhos & Souzana — Wedding',
                description: 'Elegant digital wedding invitation with RSVP. Animations, event details, location map, photo gallery, guest confirmations.',
                role: 'Web Developer & Designer', year: '2022',
                tags: ['HTML/CSS', 'JavaScript', 'GSAP', 'Google Maps'],
                link: 'http://bakhossouzana.com', isPrivate: false,
                images: ['assets/projects/bakhoss/mockup.webp'],
            },
            'golden-coast': {
                category: 'Portfolio', title: 'Golden Coast',
                description: 'Corporate portfolio website for Golden Coast — services, projects, company info. Modern design and smooth UX.',
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
                link: 'https://violet-butterfly-367429.hostingersite.com', isPrivate: true,
                images: ['assets/projects/mini-market/mockup.webp','assets/projects/mini-market/1.webp','assets/projects/mini-market/2.webp','assets/projects/mini-market/3.webp','assets/projects/mini-market/4.webp','assets/projects/mini-market/5.webp','assets/projects/mini-market/6.webp'],
            },
            'pulse-old': {
                category: 'Legacy System', title: 'Maliks Pulse (Legacy)',
                description: 'Original Maliks Pulse — the foundation that evolved into the current HR and enterprise management platform.',
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
            elMeta.innerHTML = `
                <div class="lightbox-meta-item">
                    <span class="lightbox-meta-label">Role</span>
                    <span class="lightbox-meta-value">${data.role || '—'}</span>
                </div>
                <div class="lightbox-meta-item">
                    <span class="lightbox-meta-label">Year</span>
                    <span class="lightbox-meta-value">${data.year || '—'}</span>
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
            // Card had no data entry — synthesise a minimal info set
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
        document.querySelectorAll('.work-card').forEach(card => {
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
