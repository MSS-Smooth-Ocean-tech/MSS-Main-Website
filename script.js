
// Splash Screen Logic
const splashScreen = document.getElementById('splash-screen');

window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.classList.add('hidden');
    }, 3000);
});

// Navigation Logic
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');
const menuItems = document.querySelectorAll('.menu-items a');

menuToggle.addEventListener('click', () => {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

function closeMenu() {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

menuClose.addEventListener('click', closeMenu);

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        closeMenu();
        const target = e.target.getAttribute('data-target');
        const targetElement = document.getElementById(target);

        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 60;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMenu();
    }
});

// Navbar scroll effect
let lastScrollY = 0;
let scrollDirection = 'up';

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        scrollDirection = 'down';
    } else {
        scrollDirection = 'up';
    }

    if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
        menuToggle.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
        menuToggle.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
});

// Hero and About Section Scroll Effect
const heroSection = document.querySelector('.hero-section');
const heroOverlay = document.querySelector('.hero-overlay');
const aboutSection = document.querySelector('.about-section');
const aboutGrid = document.querySelector('.about-grid');
const aboutContent = document.querySelector('.about-content');
const aboutOverlay = document.querySelector('.about-overlay');

window.addEventListener('scroll', () => {
    const heroRect = heroSection.getBoundingClientRect();
    const aboutRect = aboutSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Hero section overlay fade (only when About Us section is in view)
    const aboutScrollProgress = Math.max(0, Math.min(1, (windowHeight - aboutRect.top) / windowHeight));
    if (aboutRect.top <= windowHeight && aboutRect.bottom >= 0) {
        if (aboutScrollProgress > 0.5) {
            heroOverlay.classList.add('fade');
            aboutOverlay.classList.add('fade');
        } else {
            heroOverlay.classList.remove('fade');
            aboutOverlay.classList.remove('fade');
        }
    } else {
        heroOverlay.classList.remove('fade');
        aboutOverlay.classList.remove('fade');
    }

    // About section sequential reveal
    if (aboutRect.top < windowHeight * 0.8 && aboutRect.bottom > 0) {
        aboutGrid.classList.add('visible');
        aboutContent.classList.add('visible');
    } else {
        aboutGrid.classList.remove('visible');
        aboutContent.classList.remove('visible');
    }
});

// Services Video Section Logic
const sections = document.querySelectorAll('.text-section');
const videos = document.querySelectorAll('.bg-video');
const fixedBottom = document.getElementById('fixed-bottom');
const fixedParagraph = document.getElementById('fixed-paragraph');
const fixedButton = document.getElementById('fixed-button');

const sectionData = {
    video1: {
        text: "Comprehensive business process outsourcing solutions designed to streamline your maritime operations and increase efficiency.",
        btn: "Learn More →",
        link: "#contact"
    },
    video2: {
        text: "Expert IT consulting services leveraging cutting-edge technology for maritime industry digital transformation.",
        btn: "Discover →",
        link: "#technology"
    },
    video3: {
        text: "Strategic digital marketing solutions to enhance your maritime business presence and drive sustainable growth.",
        btn: "Explore →",
        link: "#business-values"
    }
};

function setActiveVideo(id) {
    videos.forEach(video => {
        video.classList.remove('active');
        if (video.id === id) {
            video.classList.add('active');
            video.play().catch(e => console.log('Video autoplay failed:', e));
        } else {
            video.pause();
        }
    });

    if (sectionData[id]) {
        fixedParagraph.textContent = sectionData[id].text;
        fixedButton.textContent = sectionData[id].btn;
        fixedButton.href = sectionData[id].link;
    }
}

// Initialize videos
window.addEventListener('load', () => {
    videos.forEach(video => {
        video.addEventListener('loadeddata', () => {
            video.play().catch(e => console.log('Video autoplay failed:', e));
        });
    });
    setActiveVideo('video1');

    // Initialize hero and about section videos
    const heroVideo = document.querySelector('.hero-video');
    const aboutVideo = document.querySelector('.about-video');
    if (heroVideo) {
        heroVideo.play().catch(e => console.log('Hero video autoplay failed:', e));
    }
    if (aboutVideo) {
        aboutVideo.play().catch(e => console.log('About video autoplay failed:', e));
    }
});

// Services scroll detection
window.addEventListener('scroll', () => {
    let current = '';
    let showFixed = false;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const screenCenter = window.innerHeight / 2;

        if (Math.abs(sectionCenter - screenCenter) < 120) {
            section.classList.add('visible');
            showFixed = true;
        } else {
            section.classList.remove('visible');
        }

        if (Math.abs(sectionCenter - screenCenter) > 250) {
            section.classList.add('blur');
        } else {
            section.classList.remove('blur');
        }

        if (sectionCenter <= screenCenter + 500) {
            current = section.getAttribute('data-bg');
        }
    });

    if (current) setActiveVideo(current);

    if (showFixed && window.scrollY > window.innerHeight * 0.5 && window.scrollY < window.innerHeight * 3.5) {
        fixedBottom.classList.add('visible');
    } else {
        fixedBottom.classList.remove('visible');
    }
});

// Handle video loading errors
videos.forEach(video => {
    video.addEventListener('error', (e) => {
        console.log('Video loading error:', e);
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 60;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Parallax effect for background images
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const backgrounds = document.querySelectorAll('.section-bg');

    backgrounds.forEach((bg, index) => {
        const speed = 0.5;
        bg.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Floating Sidebar Logic
const navItems = document.querySelectorAll('.nav-item');
const navSections = document.querySelectorAll('section, .services-container');
const canvas = document.querySelector('.nav-canvas');
const ctx = canvas.getContext('2d');
const navContainer = document.querySelector('.floating-nav');

const updateCanvasSize = () => {
    const navRect = navContainer.getBoundingClientRect();
    canvas.height = navRect.height;
    canvas.width = navRect.width;
};

const drawDottedLines = (progress) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const diamonds = document.querySelectorAll('.nav-diamond');
    const positions = Array.from(diamonds).map(d => {
        const rect = d.getBoundingClientRect();
        const navRect = navContainer.getBoundingClientRect();
        return {
            x: rect.left - navRect.left + rect.width / 2,
            y: rect.top - navRect.top + rect.height / 2
        };
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < positions.length - 1; i++) {
        const start = positions[i];
        const end = positions[i + 1];
        const segmentProgress = Math.min(Math.max((progress * (positions.length - 1) - i) * 2, 0), 1);

        const totalDistance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const dotSpacing = 10;
        const dotRadius = 2;
        const totalDots = Math.floor(totalDistance / dotSpacing);
        const visibleDots = Math.max(1, Math.floor(totalDots * segmentProgress));

        for (let j = 0; j < visibleDots; j++) {
            const t = j / totalDots;
            const x = start.x + (end.x - start.x) * t;
            const y = start.y + (end.y - start.y) * t;
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

const updateNav = () => {
    let current = '';
    let scrollProgress = 0;

    navSections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
            scrollProgress = index / (navSections.length - 1);
        }
    });

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = Math.min(pageYOffset / totalHeight, 1);

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === current) {
            item.classList.add('active');
        }
    });

    drawDottedLines(scrollProgress);
};

window.addEventListener('scroll', () => {
    updateCanvasSize();
    updateNav();
});

window.addEventListener('resize', updateCanvasSize);

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
        const target = document.getElementById(sectionId);
        if (target) {
            const offsetTop = target.offsetTop - 60;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

updateCanvasSize();
updateNav();

//mission

const section = document.querySelectorAll('.section');
        const navDots = document.querySelectorAll('.nav-dot');
        const container = document.getElementById('container');
        
        let currentSection = 0;
        let isScrolling = false;

        // Scroll snap behavior
        function scrollToSection(index) {
            if (isScrolling) return;
            isScrolling = true;
            
            currentSection = index;
            const targetSection = section[index];
            
            // Update active states
            section.forEach((section, i) => {
                section.classList.toggle('active', i === index);
            });
            
            navDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            // Scroll to section
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }

        // Wheel event for custom scroll behavior
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (isScrolling) return;
            
            if (e.deltaY > 0 && currentSection < section.length - 1) {
                scrollToSection(currentSection + 1);
            } else if (e.deltaY < 0 && currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        });

        // Navigation dots functionality
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                scrollToSection(index);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && currentSection < section.length - 1) {
                e.preventDefault();
                scrollToSection(currentSection + 1);
            } else if (e.key === 'ArrowUp' && currentSection > 0) {
                e.preventDefault();
                scrollToSection(currentSection - 1);
            }
        });

        // Touch/swipe support for mobile
        let startY = 0;
        let endY = 0;

        container.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        container.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            const deltaY = startY - endY;
            
            if (Math.abs(deltaY) > 50) {
                if (deltaY > 0 && currentSection < section.length - 1) {
                    scrollToSection(currentSection + 1);
                } else if (deltaY < 0 && currentSection > 0) {
                    scrollToSection(currentSection - 1);
                }
            }
        });

        // Intersection Observer as fallback
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionIndex = Array.from(section).indexOf(entry.target);
                    if (sectionIndex !== currentSection && !isScrolling) {
                        currentSection = sectionIndex;
                        
                        section.forEach((section, i) => {
                            section.classList.toggle('active', i === sectionIndex);
                        });
                        
                        navDots.forEach((dot, i) => {
                            dot.classList.toggle('active', i === sectionIndex);
                        });
                    }
                }
            });
        }, observerOptions);

        section.forEach(section => {
            observer.observe(section);
        });

        // Initialize first section as active
        section[0].classList.add('active');