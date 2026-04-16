/* ============================================
   SHADI FARHAT PORTFOLIO
   Scroll-Controlled Video + Text Transitions
   Apple-style Experience
   ============================================ */

// Global Lenis instance
let lenis;

function initLenis() {
    lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
    });

    // Animation loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Stop during preloader
    lenis.stop();
}

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initPreloader();
    initNavigation();
    initScrollVideo();
    initHeroLayers();
    initFanCards();
    initHorizontalScroll();
    initScrollAnimations();
    initParallax();
    initProjectModal();
});

/* ============================================
   PRELOADER
   ============================================ */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const preLogo = document.getElementById('preLogo');

    if (!preloader) return;

    document.body.classList.add('loading');

    let colorIndex = 0;
    let colorTimer = null;

    // Change color
    function changeColor() {
        colorIndex = (colorIndex + 1) % 6;
        preloader.setAttribute('data-c', colorIndex.toString());
    }

    // Start animations after entrance
    setTimeout(() => {
        // Add breathing animation to letters
        if (preLogo) preLogo.classList.add('breathing');

        // Start color cycling
        colorTimer = setInterval(changeColor, 700);
    }, 700);

    // Hide preloader
    window.hidePreloader = function() {
        const minTime = 2500;
        const elapsed = performance.now();
        const delay = Math.max(0, minTime - elapsed);

        setTimeout(() => {
            clearInterval(colorTimer);

            preloader.classList.add('loaded');
            document.body.classList.remove('loading');

            // Start Lenis smooth scrolling
            if (lenis) lenis.start();

            setTimeout(() => {
                const firstLayer = document.querySelector('.hero-layer[data-layer="1"]');
                if (firstLayer) firstLayer.classList.add('active');
            }, 500);
        }, delay);
    };

    // Fallback
    setTimeout(() => {
        if (!preloader.classList.contains('loaded')) {
            window.hidePreloader();
        }
    }, 5000);
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const heroWrapper = document.getElementById('heroWrapper');

    let lastScroll = 0;
    let ticking = false;

    function updateNav() {
        const currentScroll = window.pageYOffset;
        const heroHeight = heroWrapper ? heroWrapper.offsetHeight : window.innerHeight;

        // Only show background AFTER hero section ends
        if (currentScroll > heroHeight - 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Hide/show on scroll direction (only after hero)
        if (currentScroll > heroHeight) {
            if (currentScroll > lastScroll && currentScroll > heroHeight + 200) {
                nav.classList.add('hidden');
            } else {
                nav.classList.remove('hidden');
            }
        } else {
            nav.classList.remove('hidden');
        }

        lastScroll = currentScroll;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });

    // Mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('loading');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('loading');
        });
    });
}

/* ============================================
   IMAGE SEQUENCE (Apple Style - Buttery Smooth)
   ============================================ */
function initScrollVideo() {
    const canvas = document.getElementById('heroCanvas');
    const heroWrapper = document.getElementById('heroWrapper');
    const heroLoading = document.getElementById('heroLoading');
    const progressBar = document.getElementById('scrollProgressBar');

    if (!canvas || !heroWrapper) return;

    const ctx = canvas.getContext('2d');

    // Configuration
    const FRAME_COUNT = 86;  // Total frames (000-085)
    const FRAME_PATH = 'assets/frames/freepik_opening-pure-black-screen-with-a-single-spotlight-_veo3_1_1080p_16-9_24fps_36215_';
    const FRAME_EXT = '.webp';  // WebP for faster loading

    // State
    const frames = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let targetFrame = 0;
    let isLoaded = false;

    // Smoothness (lower = smoother, higher = more responsive)
    const LERP_FACTOR = 0.12;

    // Set canvas size
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Reset transform before scaling (fixes cumulative scale bug on mobile)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Redraw current frame after resize
        if (isLoaded && frames[Math.floor(currentFrame)]) {
            drawFrame(Math.floor(currentFrame));
        }
    }

    // Load frames with priority loading (first frames load first)
    function loadFrames() {
        // Priority frames (first 5 and keyframes)
        const priorityFrames = [0, 1, 2, 3, 4];
        const loadQueue = [...priorityFrames];

        // Add remaining frames
        for (let i = 0; i < FRAME_COUNT; i++) {
            if (!priorityFrames.includes(i)) {
                loadQueue.push(i);
            }
        }

        // Pre-create all image objects
        for (let i = 0; i < FRAME_COUNT; i++) {
            frames[i] = new Image();
        }

        let currentBatch = 0;
        const BATCH_SIZE = 10; // Load 10 at a time

        function loadBatch() {
            const start = currentBatch * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, loadQueue.length);

            for (let i = start; i < end; i++) {
                const frameIndex = loadQueue[i];
                const img = frames[frameIndex];
                const frameNum = String(frameIndex).padStart(3, '0');

                img.onload = () => {
                    loadedCount++;

                    // Update preloader progress
                    const percent = (loadedCount / FRAME_COUNT) * 100;
                    if (window.updateLoadingProgress) {
                        window.updateLoadingProgress(percent, `Loading (${loadedCount}/${FRAME_COUNT})`);
                    }

                    // Draw first frame immediately
                    if (frameIndex === 0) {
                        resizeCanvas();
                        drawFrame(0);
                    }

                    // Show page after first 5 frames (don't wait for all 86)
                    if (loadedCount === 5) {
                        isLoaded = true; // Enable animation
                        if (heroLoading) heroLoading.classList.add('hidden'); // Hide loading text
                        if (window.hidePreloader) {
                            window.hidePreloader();
                        }
                        startAnimation();
                    }
                };

                img.onerror = () => {
                    console.warn(`Failed to load frame: ${frameNum}`);
                    loadedCount++;

                    const percent = (loadedCount / FRAME_COUNT) * 100;
                    if (window.updateLoadingProgress) {
                        window.updateLoadingProgress(percent, `Loading frames (${loadedCount}/${FRAME_COUNT})`);
                    }

                    if (loadedCount === FRAME_COUNT) {
                        isLoaded = true;
                        if (heroLoading) heroLoading.classList.add('hidden');
                        if (window.hidePreloader) {
                            window.hidePreloader();
                        }
                        startAnimation();
                    }
                };

                img.src = `${FRAME_PATH}${frameNum}${FRAME_EXT}`;
            }

            currentBatch++;
            if (end < loadQueue.length) {
                // Use requestIdleCallback for better performance, fallback to setTimeout
                if (window.requestIdleCallback) {
                    requestIdleCallback(loadBatch, { timeout: 100 });
                } else {
                    setTimeout(loadBatch, 10);
                }
            }
        }

        loadBatch();
    }

    // Draw a specific frame
    function drawFrame(index) {
        const img = frames[index];
        if (!img || !img.complete) return;

        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

        // Cover behavior (like object-fit: cover)
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
            drawX = 0;
            drawY = (canvasHeight - drawHeight) / 2;
        } else {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgRatio;
            drawX = (canvasWidth - drawWidth) / 2;
            drawY = 0;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }

    // Calculate target frame from scroll
    function updateTargetFrame() {
        const wrapperRect = heroWrapper.getBoundingClientRect();
        const wrapperHeight = heroWrapper.offsetHeight;
        const viewportHeight = window.innerHeight;

        const scrolled = -wrapperRect.top;
        const scrollableDistance = wrapperHeight - viewportHeight;
        let progress = scrolled / scrollableDistance;
        progress = Math.max(0, Math.min(1, progress));

        targetFrame = progress * (FRAME_COUNT - 1);

        // Update progress bar
        if (progressBar) {
            progressBar.style.height = `${progress * 100}%`;
        }
    }

    // Smooth animation loop
    function startAnimation() {
        function animate() {
            if (!isLoaded) return;

            // Lerp towards target frame
            const diff = targetFrame - currentFrame;

            if (Math.abs(diff) > 0.1) {
                currentFrame += diff * LERP_FACTOR;
            }

            // Always draw current frame (keeps last frame visible)
            const frameIndex = Math.min(Math.max(Math.floor(currentFrame), 0), FRAME_COUNT - 1);
            drawFrame(frameIndex);

            requestAnimationFrame(animate);
        }

        animate();
    }

    // Event listeners
    window.addEventListener('scroll', updateTargetFrame, { passive: true });
    window.addEventListener('resize', resizeCanvas);

    // Mobile touch support - update on touchmove for smoother mobile experience
    window.addEventListener('touchmove', updateTargetFrame, { passive: true });
    window.addEventListener('touchend', updateTargetFrame, { passive: true });

    // Initialize
    resizeCanvas();
    loadFrames();
    updateTargetFrame();

    // Force initial update after short delay (helps mobile)
    setTimeout(() => {
        resizeCanvas();
        updateTargetFrame();
    }, 100);
}

/* ============================================
   HERO TEXT LAYERS - ENHANCED
   ============================================ */
function initHeroLayers() {
    const heroWrapper = document.getElementById('heroWrapper');
    const layers = document.querySelectorAll('.hero-layer');
    const heroScroll = document.getElementById('heroScroll');
    const progressLabels = document.querySelectorAll('.progress-label');

    if (!heroWrapper || layers.length === 0) return;

    const totalLayers = layers.length;
    let currentLayer = 1;

    const lastLayer = layers[layers.length - 1];
    const zoomLetter = document.getElementById('heroZoomLetter');
    const whiteFlash = document.getElementById('heroWhiteFlash');

    function updateLayers() {
        const wrapperRect = heroWrapper.getBoundingClientRect();
        const wrapperHeight = heroWrapper.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate scroll progress
        const scrolled = -wrapperRect.top;
        const scrollableDistance = wrapperHeight - viewportHeight;
        let progress = scrolled / scrollableDistance;
        progress = Math.max(0, Math.min(1, progress));

        // Determine which layer should be active
        // Divide progress into equal sections for each layer
        const layerProgress = progress * totalLayers;
        const newLayer = Math.min(Math.floor(layerProgress) + 1, totalLayers);

        // Update layers if changed
        if (newLayer !== currentLayer || currentLayer === 1) {
            layers.forEach((layer, index) => {
                const layerNum = index + 1;

                layer.classList.remove('active', 'exit-up');

                if (layerNum === newLayer) {
                    layer.classList.add('active');
                } else if (layerNum < newLayer) {
                    layer.classList.add('exit-up');
                }
            });

            // Update progress labels
            progressLabels.forEach((label, index) => {
                const labelNum = index + 1;
                if (labelNum === newLayer) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });

            currentLayer = newLayer;
        }

        // ── ZOOM INTO "B" TRANSITION ──
        // Last 18% of hero scroll: zoom into the letter B, then white flash
        const ZOOM_START = 0.82;

        if (progress > ZOOM_START && lastLayer && zoomLetter) {
            const zp = (progress - ZOOM_START) / (1 - ZOOM_START); // 0→1

            // Find where "B" is relative to the layer center
            const letterRect = zoomLetter.getBoundingClientRect();
            const layerRect = lastLayer.getBoundingClientRect();
            const originX = ((letterRect.left + letterRect.width / 2) - layerRect.left) / layerRect.width * 100;
            const originY = ((letterRect.top + letterRect.height / 2) - layerRect.top) / layerRect.height * 100;

            // Exponential scale: starts slow, accelerates fast (feels like diving in)
            const scale = 1 + Math.pow(zp, 2) * 25;  // 1x → 26x

            lastLayer.style.transformOrigin = `${originX}% ${originY}%`;
            lastLayer.style.transform = `scale(${scale})`;

            // White flash: starts at 40% into zoom, fully white by 85%
            if (whiteFlash) {
                const flashProgress = Math.max(0, (zp - 0.4) / 0.45);
                whiteFlash.style.opacity = Math.min(1, flashProgress);
            }
        } else if (lastLayer) {
            lastLayer.style.transform = '';
            lastLayer.style.transformOrigin = '';
            if (whiteFlash) whiteFlash.style.opacity = 0;
        }

        // Hide scroll hint after first section
        if (heroScroll) {
            if (progress > 0.1) {
                heroScroll.classList.add('hidden');
            } else {
                heroScroll.classList.remove('hidden');
            }
        }
    }

    // Throttled scroll handler
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateLayers();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial state
    updateLayers();
}

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS (via Lenis)
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target && lenis) {
            lenis.scrollTo(target, {
                offset: -100,
                duration: 1.8,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
        }
    });
});

/* ============================================
   CUSTOM CURSOR (Desktop only)
   ============================================ */
if (window.innerWidth > 1024 && !('ontouchstart' in window)) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
        .custom-cursor {
            width: 20px;
            height: 20px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.15s ease-out,
                        opacity 0.15s ease-out,
                        background 0.15s ease-out;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%);
        }
        .custom-cursor.hover {
            transform: translate(-50%, -50%) scale(2);
            background: rgba(255, 255, 255, 0.1);
        }
        .custom-cursor.hidden {
            opacity: 0;
        }
    `;
    document.head.appendChild(cursorStyle);

    let cursorVisible = true;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (!cursorVisible) {
            cursor.classList.remove('hidden');
            cursorVisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.add('hidden');
        cursorVisible = false;
    });

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .hero-cta');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

/* ============================================
   FAN CARDS - WHAT I DO
   ============================================ */
function initFanCards() {
    const section = document.querySelector('.services');
    const container = document.getElementById('fanCards');
    if (!section || !container) return;
    if (window.innerWidth <= 767) return;

    const cards = container.querySelectorAll('.fan-card');
    const total = cards.length;

    // Enough scroll room for all cards to animate in
    section.style.height = (window.innerHeight + total * 300) + 'px';

    function update() {
        const rect = section.getBoundingClientRect();
        const sectionH = section.offsetHeight;
        const scrolled = -rect.top;
        const scrollable = sectionH - window.innerHeight;
        if (scrollable <= 0) return;

        const progress = Math.max(0, Math.min(1, scrolled / scrollable));

        cards.forEach((card, i) => {
            // Each card has its own timing — they cascade one after another
            const cardStart = i / (total + 0.5);
            const cardEnd = (i + 1.5) / (total + 0.5);
            const cardProgress = Math.max(0, Math.min(1, (progress - cardStart) / (cardEnd - cardStart)));

            // Ease out expo
            const ease = cardProgress === 1 ? 1 : 1 - Math.pow(2, -10 * cardProgress);

            // Start: all stacked at top-left (card 01 position)
            // End: fanned out diagonally — top-left to bottom-right
            const finalX = i * 200;          // spread right
            const finalY = i * 30;           // spread down
            const finalRotation = i * 5;     // increasing rotation

            const startX = 0;               // all start at left
            const startY = -20;              // slightly above
            const startRotation = 0;

            const currentX = startX + (finalX - startX) * ease;
            const currentY = startY + (finalY - startY) * ease;
            const currentRotation = startRotation + (finalRotation - startRotation) * ease;

            card.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${currentRotation}deg)`;
            card.style.zIndex = total - i; // first card on top initially, last on top when spread
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 767) return;
        section.style.height = (window.innerHeight + total * 300) + 'px';
        update();
    });

    window.addEventListener('load', update);
}

/* ============================================
   HORIZONTAL SCROLL SECTIONS
   ============================================ */
function initHorizontalScroll() {
    if (window.innerWidth <= 767) return;

    const sections = [
        { el: document.querySelector('.featured'), grid: document.querySelector('.projects-grid'), direction: 1 },
        { el: document.querySelector('.blender-work'), grid: document.querySelector('.blender-grid'), direction: -1 },
        { el: document.querySelector('.design-work'), grid: document.querySelector('.design-grid'), direction: 1 },
    ];

    // Measure and set section heights
    function measure() {
        sections.forEach((s) => {
            if (!s.el || !s.grid) return;

            // Temporarily remove transform so scrollWidth is accurate
            s.grid.style.transform = 'none';

            const gridW = s.grid.scrollWidth;
            const vpW = window.innerWidth;
            const travel = Math.max(0, gridW - vpW + 100);

            s.travel = travel;

            // The outer section must be tall enough: 100vh for the pinned view + travel distance
            if (travel > 0) {
                s.el.style.height = (travel + window.innerHeight) + 'px';
            }
        });
    }

    // Animate on every scroll tick
    function onScroll() {
        sections.forEach((s) => {
            if (!s.el || !s.grid || !s.travel) return;

            const rect = s.el.getBoundingClientRect();
            const sectionH = s.el.offsetHeight;
            const scrolled = -rect.top;
            const scrollable = sectionH - window.innerHeight;

            if (scrollable <= 0) return;

            const progress = Math.max(0, Math.min(1, scrolled / scrollable));

            let tx;
            if (s.direction === 1) {
                // Left-to-right: cards start in view, slide left
                tx = -progress * s.travel;
            } else {
                // Right-to-left: cards start off-screen left, slide right into view
                tx = -s.travel + progress * s.travel;
            }

            s.grid.style.transform = `translateX(${tx}px)`;
        });
    }

    // Initial measure + kick off
    measure();
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth <= 767) return;
            measure();
            onScroll();
        }, 200);
    });

    // Re-measure after fonts & images settle (scrollWidth can change)
    window.addEventListener('load', () => {
        measure();
        onScroll();
    });
}

/* ============================================
   SCROLL ANIMATIONS FOR SECTIONS
   ============================================ */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    });

    animatedElements.forEach(el => observer.observe(el));
}

/* ============================================
   PARALLAX EFFECTS
   ============================================ */
function initParallax() {
    const parallaxImages = document.querySelectorAll('[data-parallax-img]');
    const parallaxCards = document.querySelectorAll('[data-parallax]');

    if (!parallaxImages.length && !parallaxCards.length) return;

    // Image parallax on scroll
    function updateParallax() {
        parallaxImages.forEach(container => {
            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Check if in viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const scrollPercent = (viewportHeight - rect.top) / (viewportHeight + rect.height);
                const translateY = (scrollPercent - 0.5) * 30; // -15px to +15px

                const img = container.querySelector('.project-image-placeholder, img');
                if (img) {
                    img.style.transform = `scale(1.1) translateY(${translateY}px)`;
                }
            }
        });
    }

    // Card tilt on mouse move
    parallaxCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;

            card.style.transition = 'none';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.4s ease';
            card.style.transform = '';
        });
    });

    // Scroll listener for parallax
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
}

/* ============================================
   PROJECT MODAL
   ============================================ */
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const projectLinks = document.querySelectorAll('[data-project]');

    // Project data
    const projectsData = {
        'pulse-dashboard': {
            category: 'Web Development',
            title: 'Maliks Pulse - HR System',
            description: 'Complete HR management system integrated with Nano Banana AI to generate professional reports and employee images. Features KPIs tracking, vacation management, performance monitoring, attendance system, and customized reporting dashboards.',
            role: 'Full Stack Developer & Project Lead',
            year: '2024',
            tags: ['Laravel', 'React', 'MySQL', 'Nano Banana AI', 'WebSockets'],
            link: '#',
            isPrivate: true,
            images: [
                'assets/projects/pulse-dashboard/mockup.webp',
                'assets/projects/pulse-dashboard/1.webp',
                'assets/projects/pulse-dashboard/2.webp',
                'assets/projects/pulse-dashboard/3.webp',
                'assets/projects/pulse-dashboard/4.webp',
                'assets/projects/pulse-dashboard/5.webp',
                'assets/projects/pulse-dashboard/6.webp',
                'assets/projects/pulse-dashboard/7.webp',
                'assets/projects/pulse-dashboard/8.webp'
            ]
        },
        'pulse-mobile': {
            category: 'Mobile App',
            title: 'Maliks Pulse Mobile',
            description: 'Cross-platform mobile application for Maliks Pulse system. Enables managers to monitor sales, approve requests, and receive real-time notifications. Built with React Native for iOS and Android.',
            role: 'Mobile Developer',
            year: '2024',
            tags: ['React Native', 'Redux', 'Push Notifications'],
            link: '#',
            isPrivate: true,
            images: [
                'assets/projects/pulse-mobile/mockup.jpg',
                'assets/projects/pulse-mobile/1.png',
                'assets/projects/pulse-mobile/2.png',
                'assets/projects/pulse-mobile/3.png',
                'assets/projects/pulse-mobile/4.png',
                'assets/projects/pulse-mobile/5.png',
                'assets/projects/pulse-mobile/6.png'
            ]
        },
        'ai-system': {
            category: 'AI Game',
            title: 'Maliks Valentine Game',
            description: 'Interactive Valentine\'s Day game where customers can win a free AI-generated photo. Users draw a heart shape on screen - if they draw a perfect heart, they win a professionally generated image using Nano Banana Pro AI.',
            role: 'Full Stack Developer & AI Engineer',
            year: '2024',
            tags: ['JavaScript', 'Canvas API', 'Nano Banana AI', 'Laravel'],
            link: '#',
            isPrivate: true,
            images: [
                'assets/projects/ai-system/mockup.webp',
                'assets/projects/ai-system/1.webp',
                'assets/projects/ai-system/2.webp',
                'assets/projects/ai-system/3.webp',
                'assets/projects/ai-system/4.webp'
            ]
        },
        'tracking': {
            category: 'Mobile + Web',
            title: 'Maliks Deliveries Tracking',
            description: 'Complete delivery tracking system with mobile app for drivers. Real-time GPS location tracking, detailed movement reports (daily, weekly, monthly), delivery status updates, and route history. Managers can monitor all drivers live on a dashboard.',
            role: 'Full Stack Developer',
            year: '2023',
            tags: ['Laravel', 'React Native', 'Google Maps API', 'Firebase', 'MySQL'],
            link: '#',
            isPrivate: true,
            images: ['assets/projects/tracking/mockup.webp']
        },
        'warehouse': {
            category: 'Enterprise System',
            title: 'Maliks Warehouse Management',
            description: 'Complete warehouse management system with payroll and attendance tracking for employees. Features stock control, inventory management, barcode scanning, automated reordering, multi-location sync, and comprehensive reporting.',
            role: 'Full Stack Developer',
            year: '2023',
            tags: ['Laravel', 'React', 'Barcode API', 'MySQL', 'Payroll System'],
            link: '#',
            isPrivate: true,
            images: ['assets/projects/warehouse/mockup.webp']
        },
        'as3arna': {
            category: 'E-Commerce',
            title: 'As3arna - Price Platform',
            description: 'Price comparison and tracking platform for Lebanese market. Users can compare prices across stores, set price alerts, and find best deals.',
            role: 'Full Stack Developer',
            year: '2023',
            tags: ['Laravel', 'Vue.js', 'Web Scraping', 'MySQL'],
            link: 'https://as3arna.net',
            isPrivate: true,
            images: ['assets/projects/as3arna/mockup.webp']
        },
        'filali': {
            category: 'Web Development',
            title: 'Filali Engineers',
            description: 'Professional website for Filali Engineering firm. Showcases projects, services, and company portfolio with modern design and smooth animations.',
            role: 'Web Developer & Designer',
            year: '2023',
            tags: ['HTML/CSS', 'JavaScript', 'PHP'],
            link: 'http://filaliengineers.com',
            isPrivate: false,
            images: ['assets/projects/filali/mockup.webp']
        },
        'mediahub': {
            category: 'Web Platform',
            title: 'Hostify',
            description: 'Airbnb-style rental platform for Lebanon. Users can list properties, browse available rentals, book stays, and manage reservations. Features user authentication, payment integration, reviews, and messaging system.',
            role: 'Full Stack Developer',
            year: '2023',
            tags: ['Laravel', 'Vue.js', 'MySQL', 'Stripe', 'Google Maps'],
            link: 'https://slategray-emu-126412.hostingersite.com',
            isPrivate: false,
            images: ['assets/projects/mediahub/mockup.webp']
        },
        'codesign': {
            category: 'Web Development',
            title: 'Codesign LB',
            description: 'Design agency website with portfolio gallery, team section, and service showcase. Clean modern design with smooth scrolling effects.',
            role: 'Web Developer & Designer',
            year: '2022',
            tags: ['HTML/CSS', 'JavaScript', 'GSAP'],
            link: 'https://codesignlb.com',
            isPrivate: false,
            images: ['assets/projects/codesign/mockup.webp']
        },
        'bakhoss': {
            category: 'Digital Invitation',
            title: 'Bakhos & Souzana Wedding',
            description: 'Elegant digital wedding invitation with RSVP functionality. Features beautiful animations, event details, location map, photo gallery, and guest confirmation system. Designed for a memorable first impression.',
            role: 'Web Developer & Designer',
            year: '2022',
            tags: ['HTML/CSS', 'JavaScript', 'GSAP', 'Google Maps'],
            link: 'http://bakhossouzana.com',
            isPrivate: false,
            images: ['assets/projects/bakhoss/mockup.webp']
        },
        'golden-coast': {
            category: 'Portfolio',
            title: 'Golden Coast',
            description: 'Professional company portfolio website for Golden Coast. Showcases services, projects, and company information with modern design and smooth user experience.',
            role: 'Web Developer & Designer',
            year: '2023',
            tags: ['HTML/CSS', 'JavaScript', 'PHP'],
            link: 'https://olivedrab-rhinoceros-902407.hostingersite.com',
            isPrivate: false,
            images: [
                'assets/projects/golden-coast/mockup.webp',
                'assets/projects/golden-coast/1.webp',
                'assets/projects/golden-coast/2.webp',
                'assets/projects/golden-coast/3.webp',
                'assets/projects/golden-coast/4.webp',
                'assets/projects/golden-coast/5.webp',
                'assets/projects/golden-coast/6.webp'
            ]
        },
        'mini-market': {
            category: 'ERP System',
            title: 'Mini Market ERP',
            description: 'Complete ERP system designed for mini markets and small retail stores. Features inventory management, POS system, sales tracking, and reporting dashboards.',
            role: 'Full Stack Developer',
            year: '2024',
            tags: ['Laravel', 'Vue.js', 'MySQL', 'POS'],
            link: 'https://violet-butterfly-367429.hostingersite.com',
            isPrivate: true,
            images: [
                'assets/projects/mini-market/mockup.webp',
                'assets/projects/mini-market/1.webp',
                'assets/projects/mini-market/2.webp',
                'assets/projects/mini-market/3.webp',
                'assets/projects/mini-market/4.webp',
                'assets/projects/mini-market/5.webp',
                'assets/projects/mini-market/6.webp'
            ]
        },
        'pulse-old': {
            category: 'Legacy System',
            title: 'Maliks Pulse (Legacy)',
            description: 'The original version of Maliks Pulse system. This was the foundation that evolved into the current HR and enterprise management platform.',
            role: 'Full Stack Developer',
            year: '2022',
            tags: ['Laravel', 'jQuery', 'MySQL', 'Bootstrap'],
            link: 'http://demo.malikspulse.com',
            isPrivate: true,
            images: [
                'assets/projects/pulse-old/mockup.webp',
                'assets/projects/pulse-old/1.webp',
                'assets/projects/pulse-old/2.webp',
                'assets/projects/pulse-old/3.webp',
                'assets/projects/pulse-old/4.webp',
                'assets/projects/pulse-old/5.webp',
                'assets/projects/pulse-old/6.webp',
                'assets/projects/pulse-old/7.webp',
                'assets/projects/pulse-old/8.webp'
            ]
        }
    };

    // Slideshow state
    let currentSlide = 0;
    let slideshowImages = [];
    let slideshowSources = [];
    let loadedImages = new Set();

    const slideshowContainer = document.getElementById('slideshowContainer');
    const slideshowDots = document.getElementById('slideshowDots');
    const slideshowCounter = document.getElementById('slideshowCounter');
    const slideshowPrev = document.getElementById('slideshowPrev');
    const slideshowNext = document.getElementById('slideshowNext');

    // Create loader element
    let slideshowLoader = document.createElement('div');
    slideshowLoader.className = 'slideshow-loader';
    slideshowContainer.parentElement.appendChild(slideshowLoader);

    function showLoader() {
        slideshowLoader.classList.add('visible');
    }

    function hideLoader() {
        slideshowLoader.classList.remove('visible');
    }

    // Lazy load image with smooth decode
    async function loadImage(index) {
        if (index < 0 || index >= slideshowImages.length) return;
        if (loadedImages.has(index)) return;

        const img = slideshowImages[index];
        const src = slideshowSources[index];

        if (!img.src) {
            img.classList.add('loading');
            img.src = src;

            try {
                await img.decode();
            } catch (e) {
                // Image decode failed, but image might still display
            }

            img.classList.remove('loading');
            loadedImages.add(index);
        }
    }

    // Preload adjacent images
    function preloadAdjacent(currentIndex) {
        const total = slideshowImages.length;
        // Load current, next, and previous
        loadImage(currentIndex);
        loadImage((currentIndex + 1) % total);
        loadImage((currentIndex - 1 + total) % total);
    }

    function createSlideshow(images) {
        slideshowContainer.innerHTML = '';
        slideshowImages = [];
        slideshowSources = images;
        loadedImages.clear();

        images.forEach((src, i) => {
            const img = document.createElement('img');
            img.alt = 'Project Screenshot';
            img.classList.add('loading');
            if (i === 0) img.classList.add('active');
            slideshowContainer.appendChild(img);
            slideshowImages.push(img);
        });

        // Update counter immediately with new image count
        slideshowCounter.textContent = `1 / ${images.length}`;

        // Load first image immediately with loader
        if (images.length > 0) {
            showLoader();
            loadImage(0).then(() => {
                hideLoader();
                // Preload next images after first is loaded
                preloadAdjacent(0);
            });
        }
    }

    async function updateSlideshow() {
        if (slideshowImages.length === 0) return;

        // Show loader if image not yet loaded
        if (!loadedImages.has(currentSlide)) {
            showLoader();
            await loadImage(currentSlide);
            hideLoader();
        }

        slideshowImages.forEach((img, i) => {
            img.classList.toggle('active', i === currentSlide);
        });
        slideshowCounter.textContent = `${currentSlide + 1} / ${slideshowImages.length}`;

        // Update dots
        const dots = slideshowDots.querySelectorAll('.slideshow-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });

        // Preload adjacent images in background
        preloadAdjacent(currentSlide);
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideshowImages.length;
        updateSlideshow();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideshowImages.length) % slideshowImages.length;
        updateSlideshow();
    }

    if (slideshowPrev) slideshowPrev.addEventListener('click', prevSlide);
    if (slideshowNext) slideshowNext.addEventListener('click', nextSlide);

    // Open modal - entire card is clickable
    projectLinks.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const projectId = card.dataset.project;
            const project = projectsData[projectId];

            if (project) {
                // Populate modal
                document.getElementById('modalCategory').textContent = project.category;
                document.getElementById('modalTitle').textContent = project.title;
                document.getElementById('modalDescription').textContent = project.description;
                document.getElementById('modalRole').textContent = project.role;
                document.getElementById('modalYear').textContent = project.year;
                document.getElementById('modalLink').href = project.link;

                // Populate tags
                const tagsContainer = document.getElementById('modalTags');
                tagsContainer.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

                // Setup slideshow
                const images = project.images || [];
                currentSlide = 0;
                createSlideshow(images);

                // Create dots
                slideshowDots.innerHTML = images.map((_, i) =>
                    `<div class="slideshow-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
                ).join('');

                // Dot click handlers
                slideshowDots.querySelectorAll('.slideshow-dot').forEach(dot => {
                    dot.addEventListener('click', () => {
                        currentSlide = parseInt(dot.dataset.index);
                        updateSlideshow();
                    });
                });

                // Show/hide arrows based on image count
                if (images.length <= 1) {
                    slideshowPrev.style.display = 'none';
                    slideshowNext.style.display = 'none';
                    slideshowDots.style.display = 'none';
                } else {
                    slideshowPrev.style.display = 'flex';
                    slideshowNext.style.display = 'flex';
                    slideshowDots.style.display = 'flex';
                }

                // Hide link button for private projects
                const linkBtn = document.getElementById('modalLink');
                if (project.isPrivate || project.link === '#') {
                    linkBtn.style.display = 'none';
                } else {
                    linkBtn.style.display = 'inline-flex';
                }

                // Show modal & pause Lenis
                modal.classList.add('active');
                document.body.classList.add('modal-open');
                if (lenis) lenis.stop();
            }
        });
    });

    // Close modal & resume Lenis
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (lenis) lenis.start();
    }

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ============================================
    // 3D BLENDER WORK DATA & HANDLERS
    // ============================================
    const blenderData = {
        'almaza': { category: 'Product', title: 'Almaza', description: '3D product visualization of Almaza beer bottle. Photorealistic render created in Blender with studio lighting.', software: 'Blender', year: '2024', images: ['assets/3d-work/almaza/skeleton.webp', 'assets/3d-work/almaza/final.webp'] },
        'black-opuim': { category: 'Product', title: 'Black Opium', description: '3D render of YSL Black Opium perfume bottle. High-end product visualization with dramatic lighting.', software: 'Blender', year: '2024', images: ['assets/3d-work/black-opuim/skeleton.webp', 'assets/3d-work/black-opuim/final.webp'] },
        'la-vie-est-belle': { category: 'Product', title: 'La Vie Est Belle', description: '3D visualization of Lancome La Vie Est Belle perfume. Elegant product render with soft lighting.', software: 'Blender', year: '2024', images: ['assets/3d-work/la-vie-est-belle/skeleton.webp', 'assets/3d-work/la-vie-est-belle/final.webp'] },
        'valentino': { category: 'Product', title: 'Valentino', description: '3D render of Valentino fragrance bottle. Luxury product visualization with studio setup.', software: 'Blender', year: '2024', images: ['assets/3d-work/valentino/skeleton.webp', 'assets/3d-work/valentino/final.webp'] },
        'spice-bomb': { category: 'Product', title: 'Spice Bomb', description: '3D visualization of Viktor & Rolf Spice Bomb perfume. Bold product render with explosive theme.', software: 'Blender', year: '2024', images: ['assets/3d-work/spice-bomb/skeleton.webp', 'assets/3d-work/spice-bomb/final.webp'] },
        'la-nuit-de-lhomme': { category: 'Product', title: "La Nuit De L'Homme", description: "3D render of YSL La Nuit de L'Homme fragrance. Sophisticated product visualization.", software: 'Blender', year: '2024', images: ['assets/3d-work/la-nuit-de-lhomme/final.webp'] },
        'lhomme-prada': { category: 'Product', title: "L'Homme Prada", description: '3D visualization of Prada fragrance bottle. Minimalist luxury product render.', software: 'Blender', year: '2024', images: ['assets/3d-work/lhomme-prada/skeleton.webp', 'assets/3d-work/lhomme-prada/final.webp'] },
        'redbull': { category: 'Product', title: 'Redbull', description: '3D render of Red Bull energy drink can. Dynamic product visualization with energetic mood.', software: 'Blender', year: '2024', images: ['assets/3d-work/redbull/skeleton.webp', 'assets/3d-work/redbull/final.webp'] },
        'freeze': { category: 'Product', title: 'Freeze', description: '3D product visualization with cool, refreshing aesthetic. Professional studio render.', software: 'Blender', year: '2024', images: ['assets/3d-work/freeze/skeleton.webp', 'assets/3d-work/freeze/final.webp'] },
        'kitkat': { category: 'Product', title: 'KitKat', description: '3D render of KitKat chocolate bar. Appetizing product visualization with realistic textures.', software: 'Blender', year: '2024', images: ['assets/3d-work/kitkat/skeleton.webp', 'assets/3d-work/kitkat/final.webp'] },
        'pringles': { category: 'Product', title: 'Pringles', description: '3D visualization of Pringles can. Fun and playful product render.', software: 'Blender', year: '2024', images: ['assets/3d-work/pringles/skeleton.webp', 'assets/3d-work/pringles/final.webp'] },
        'prill': { category: 'Product', title: 'Prill', description: '3D render of Prill cleaning product. Clean and professional product visualization.', software: 'Blender', year: '2024', images: ['assets/3d-work/prill/skeleton.webp', 'assets/3d-work/prill/final.webp'] },
        'lysedia-jar': { category: 'Product', title: 'Lysedia Jar', description: '3D visualization of cosmetic jar. Elegant beauty product render with soft lighting.', software: 'Blender', year: '2024', images: ['assets/3d-work/lysedia-jar/skeleton.webp', 'assets/3d-work/lysedia-jar/final.webp'] },
        'sport-bottle': { category: 'Product', title: 'Sport Bottle', description: '3D render of sports water bottle. Active lifestyle product visualization.', software: 'Blender', year: '2024', images: ['assets/3d-work/sport-bottle/skeleton.webp', 'assets/3d-work/sport-bottle/final.webp'] },
        'chess': { category: 'Product', title: 'Chess', description: '3D visualization of chess pieces. Artistic render with dramatic lighting.', software: 'Blender', year: '2024', images: ['assets/3d-work/chess/skeleton.webp', 'assets/3d-work/chess/final.webp'] },
        'white-mugs': { category: 'Product', title: 'White Mugs', description: '3D render of ceramic mugs. Clean and minimalist product visualization.', software: 'Blender', year: '2024', images: ['assets/3d-work/white-mugs/skeleton.webp', 'assets/3d-work/white-mugs/final.webp'] },
        'badges': { category: 'Product', title: 'Badges', description: '3D visualization of promotional badges. Detailed product render with realistic materials.', software: 'Blender', year: '2024', images: ['assets/3d-work/badges/skeleton.webp', 'assets/3d-work/badges/final.webp'] }
    };

    // 3D Work card click handlers
    const blenderCards = document.querySelectorAll('[data-blender]');
    blenderCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const blenderId = card.dataset.blender;
            const blender = blenderData[blenderId];

            if (blender) {
                document.getElementById('modalCategory').textContent = blender.category;
                document.getElementById('modalTitle').textContent = blender.title;
                document.getElementById('modalDescription').textContent = blender.description;
                document.getElementById('modalRole').textContent = blender.software;
                document.getElementById('modalYear').textContent = blender.year;

                const tagsContainer = document.getElementById('modalTags');
                tagsContainer.innerHTML = `<span>Blender</span><span>3D Art</span>`;

                const images = blender.images || [];
                currentSlide = 0;
                createSlideshow(images);

                slideshowDots.innerHTML = images.map((_, i) =>
                    `<div class="slideshow-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
                ).join('');

                slideshowDots.querySelectorAll('.slideshow-dot').forEach(dot => {
                    dot.addEventListener('click', () => {
                        currentSlide = parseInt(dot.dataset.index);
                        updateSlideshow();
                    });
                });

                if (images.length <= 1) {
                    slideshowPrev.style.display = 'none';
                    slideshowNext.style.display = 'none';
                    slideshowDots.style.display = 'none';
                } else {
                    slideshowPrev.style.display = 'flex';
                    slideshowNext.style.display = 'flex';
                    slideshowDots.style.display = 'flex';
                }

                document.getElementById('modalLink').style.display = 'none';

                modal.classList.add('active');
                document.body.classList.add('modal-open');
                if (lenis) lenis.stop();
            }
        });
    });

    // ============================================
    // DESIGN WORK DATA & HANDLERS
    // ============================================
    const designData = {
        'cleaning-service': { category: 'Branding', title: 'Cleaning Service', description: 'Professional branding for cleaning service business. Clean and trustworthy visual identity.', software: 'Adobe Illustrator', year: '2024', images: ['assets/design/cleaning-service/mockup.webp'] },
        'farhat-market': { category: 'Branding', title: 'Farhat Market', description: 'Complete brand identity for Farhat Market. Logo design, color scheme, and marketing materials.', software: 'Adobe Illustrator', year: '2024', images: ['assets/design/farhat-market/mockup.webp', 'assets/design/farhat-market/1.webp', 'assets/design/farhat-market/2.webp'] },
        'posters': { category: 'Graphic', title: 'Posters', description: 'Creative poster designs. Bold typography and striking visuals.', software: 'Adobe Photoshop', year: '2024', images: ['assets/design/posters/mockup.webp', 'assets/design/posters/1.webp', 'assets/design/posters/2.webp'] },
        'tous-frais': { category: 'Branding', title: 'Tous Frais', description: 'Fresh brand identity for Tous Frais grocery store. Complete branding with posters and marketing materials.', software: 'Adobe Illustrator', year: '2024', images: ['assets/design/tous-frais/mockup.webp', 'assets/design/tous-frais/1.webp', 'assets/design/tous-frais/2.webp', 'assets/design/tous-frais/3.webp', 'assets/design/tous-frais/4.webp', 'assets/design/tous-frais/5.webp', 'assets/design/tous-frais/6.webp', 'assets/design/tous-frais/7.webp', 'assets/design/tous-frais/8.webp', 'assets/design/tous-frais/9.webp'] }
    };

    // Design card click handlers
    const designCards = document.querySelectorAll('[data-design]');
    designCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const designId = card.dataset.design;
            const design = designData[designId];

            if (design) {
                document.getElementById('modalCategory').textContent = design.category;
                document.getElementById('modalTitle').textContent = design.title;
                document.getElementById('modalDescription').textContent = design.description;
                document.getElementById('modalRole').textContent = design.software;
                document.getElementById('modalYear').textContent = design.year;

                const tagsContainer = document.getElementById('modalTags');
                tagsContainer.innerHTML = `<span>${design.category}</span><span>Design</span>`;

                const images = design.images || [];
                currentSlide = 0;
                createSlideshow(images);

                slideshowDots.innerHTML = images.map((_, i) =>
                    `<div class="slideshow-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
                ).join('');

                slideshowDots.querySelectorAll('.slideshow-dot').forEach(dot => {
                    dot.addEventListener('click', () => {
                        currentSlide = parseInt(dot.dataset.index);
                        updateSlideshow();
                    });
                });

                if (images.length <= 1) {
                    slideshowPrev.style.display = 'none';
                    slideshowNext.style.display = 'none';
                    slideshowDots.style.display = 'none';
                } else {
                    slideshowPrev.style.display = 'flex';
                    slideshowNext.style.display = 'flex';
                    slideshowDots.style.display = 'flex';
                }

                document.getElementById('modalLink').style.display = 'none';

                modal.classList.add('active');
                document.body.classList.add('modal-open');
                if (lenis) lenis.stop();
            }
        });
    });
}
