/* ============================================
   SHADI FARHAT PORTFOLIO
   Scroll-Controlled Video + Text Transitions
   Apple-style Experience
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initScrollVideo();
    initHeroLayers();
    initScrollAnimations();
    initParallax();
    initProjectModal();
});

/* ============================================
   PRELOADER - Ultra Modern with Effects
   ============================================ */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const ringProgress = document.getElementById('ringProgress');
    const nameLine = document.getElementById('nameLine');
    const canvas = document.getElementById('particleCanvas');

    document.body.classList.add('loading');

    // ========== PARTICLE SYSTEM ==========
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        // Reduced particles for faster performance
        const particleCount = window.innerWidth < 768 ? 15 : 35;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(41, 151, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connections (optimized - reduced distance for performance)
        const connectionDistance = window.innerWidth < 768 ? 60 : 80;
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    // Use squared distance to avoid sqrt (faster)
                    if (distSq < connectionDistance * connectionDistance) {
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(41, 151, 255, ${0.1 * (1 - dist / connectionDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animateParticles() {
            if (preloader.classList.contains('loaded')) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ========== TYPING EFFECT ==========
    const textToType = "SHADI FARHAT";
    let charIndex = 0;

    function typeText() {
        if (nameLine && charIndex <= textToType.length) {
            nameLine.textContent = textToType.substring(0, charIndex);
            charIndex++;
            setTimeout(typeText, 100);
        }
    }
    setTimeout(typeText, 800);

    // ========== UPDATE PROGRESS ==========
    window.updateLoadingProgress = function(percent, text) {
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        if (ringProgress) {
            // Circle circumference = 2 * PI * 90 = 565
            const offset = 565 - (565 * percent / 100);
            ringProgress.style.strokeDashoffset = offset;
        }
        if (progressPercent) {
            progressPercent.textContent = Math.round(percent);
        }
        if (progressText && text) {
            progressText.textContent = text;
        }
    };

    // ========== HIDE PRELOADER ==========
    window.hidePreloader = function() {
        const minDisplayTime = 1200; // Reduced from 3500ms for faster load
        const elapsed = performance.now();
        const delay = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
            preloader.classList.add('loaded');
            document.body.classList.remove('loading');

            setTimeout(() => {
                const firstLayer = document.querySelector('.hero-layer[data-layer="1"]');
                if (firstLayer) firstLayer.classList.add('active');
            }, 500);
        }, delay);
    };

    // Fallback timeout
    setTimeout(() => {
        if (!preloader.classList.contains('loaded')) {
            window.hidePreloader();
        }
    }, 15000);
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
    const FRAME_COUNT = 78;  // Total frames (000-077)
    const FRAME_PATH = 'assets/frames/freepik_opening-pure-black-screen-with-a-single-spotlight-_veo3_1_1080p_16-9_24fps_36215_';
    const FRAME_EXT = '.jpg';  // Extension

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

        ctx.scale(dpr, dpr);

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
                        window.updateLoadingProgress(percent, `Loading frames (${loadedCount}/${FRAME_COUNT})`);
                    }

                    // Draw first frame immediately
                    if (frameIndex === 0) {
                        resizeCanvas();
                        drawFrame(0);
                    }

                    // All frames loaded
                    if (loadedCount === FRAME_COUNT) {
                        isLoaded = true;
                        if (heroLoading) heroLoading.classList.add('hidden');

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

    // Initialize
    resizeCanvas();
    loadFrames();
    updateTargetFrame();
}

/* ============================================
   HERO TEXT LAYERS
   ============================================ */
function initHeroLayers() {
    const heroWrapper = document.getElementById('heroWrapper');
    const layers = document.querySelectorAll('.hero-layer');
    const heroScroll = document.getElementById('heroScroll');

    if (!heroWrapper || layers.length === 0) return;

    const totalLayers = layers.length;
    let currentLayer = 1;

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

            currentLayer = newLayer;
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
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
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
                'assets/projects/pulse-mobile/mockup.webp',
                'assets/projects/pulse-mobile/1.webp',
                'assets/projects/pulse-mobile/2.webp',
                'assets/projects/pulse-mobile/3.webp',
                'assets/projects/pulse-mobile/4.webp',
                'assets/projects/pulse-mobile/5.webp',
                'assets/projects/pulse-mobile/6.webp'
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

                // Show modal
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
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
            }
        });
    });

    // ============================================
    // DESIGN WORK DATA & HANDLERS
    // ============================================
    const designData = {
        'cleaning-service': { category: 'Branding', title: 'Cleaning Service', description: 'Professional branding for cleaning service business. Clean and trustworthy visual identity.', software: 'Adobe Illustrator', year: '2024', images: ['assets/design/cleaning-service/mockup.webp', 'assets/design/cleaning-service/1.webp'] },
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
            }
        });
    });
}
