class ProfessionalTechShowcase {
  constructor() {
    // Use class selectors to match the CSS
    this.heroVideoContainer = document.querySelector('.techshowcase-hero-video-container');
    this.heroOverlay = document.querySelector('.techshowcase-hero-overlay');
    this.heroContent = document.querySelector('.techshowcase-hero-content');
    this.heroVideo = document.querySelector('.techshowcase-hero-video');
    this.init();
  }

  init() {
    this.initScrollEffects();
    this.initIntersectionObserver();
    this.initVideoFallback();
    this.initSmoothScrolling();
  }

  initScrollEffects() {
    let ticking = false;

    const updateScrollEffects = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollY / windowHeight, 0), 1);

      // Video scaling effect
      const scale = 1 - (scrollProgress * 0.5); // Adjusted for more noticeable shrink
      const borderRadius = scrollProgress * 20;
      const opacity = 1 - (scrollProgress * 0.6);

      if (this.heroVideoContainer) {
        this.heroVideoContainer.style.transform = `scale(${scale})`;
        this.heroVideoContainer.style.borderRadius = `${borderRadius}px`;
      }
      if (this.heroOverlay) {
        this.heroOverlay.style.opacity = opacity;
      }

      // Hero content fade and move
      if (this.heroContent) {
        const contentOpacity = Math.max(0, 1 - (scrollProgress * 1.8));
        const contentTransform = scrollProgress * 150; // Smooth vertical movement
        this.heroContent.style.opacity = contentOpacity;
        this.heroContent.style.transform = `translate(-50%, -50%) translateY(${contentTransform}px)`;
      }

      ticking = false;
    };

    const requestScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    updateScrollEffects();
  }

  initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.techshowcase-fade-in').forEach(element => {
      observer.observe(element);
    });
  }

  initVideoFallback() {
    if (this.heroVideo) {
      this.heroVideo.addEventListener('error', () => {
        if (this.heroVideoContainer) {
          this.heroVideoContainer.innerHTML = `
            <div style="
              width: 100%; 
              height: 100%; 
              background: linear-gradient(135deg, rgba(0, 20, 40, 0.4) 0%, rgba(0, 40, 80, 0.3) 50%, rgba(0, 20, 60, 0.4) 100%);
              display: flex; 
              align-items: center; 
              justify-content: center;
            ">
              <div style="color: rgba(255, 255, 255, 0.8); text-align: center; font-size: 2rem;">Maritime Innovation</div>
            </div>
          `;
        }
      });

      this.heroVideo.addEventListener('loadeddata', () => {
        this.heroVideo.play().catch(() => {
          console.log('Technologies video autoplay prevented');
        });
      });
    }
  }

  initSmoothScrolling() {
    const scrollIndicator = document.querySelector('.techshowcase-scroll-indicator');
    scrollIndicator?.addEventListener('click', () => {
      const technologiesSection = document.querySelector('.techshowcase-technologies-section');
      window.scrollTo({
        top: technologiesSection.offsetTop,
        behavior: 'smooth'
      });
    });

    document.querySelectorAll('.techshowcase-learn-more, .techshowcase-cta-button').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProfessionalTechShowcase();
});

// Performance optimizations
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const style = document.createElement('style');
  style.textContent = `
    .techshowcase-hero-section *, 
    .techshowcase-main-content *,
    .techshowcase-tech-item,
    .techshowcase-header-content {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
}