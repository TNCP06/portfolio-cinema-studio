import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
  // --- 0. Smart Header Scroll Visibility (Hide on scroll down, Show on scroll up, Hidden in Hero) ---
  const mainHeader = document.querySelector('header');
  const section2 = document.getElementById('who-we-are') || 
                   document.getElementById('project-narrative') || 
                   document.getElementById('lafuente-narrative') || 
                   document.getElementById('broederliefde-narrative');

  let lastScrollY = window.scrollY;
  const SCROLL_DELTA_THRESHOLD = 8; // threshold sensitivity (px)

  function handleSmartHeaderScroll() {
    if (!mainHeader) return;
    
    const currentScrollY = window.scrollY;
    
    // Calculate Section 2 threshold
    let heroThreshold = 300;
    if (section2) {
      heroThreshold = Math.max(100, section2.offsetTop - 120);
    } else {
      const heroSec = document.querySelector('.hero-section');
      if (heroSec) {
        heroThreshold = Math.max(150, heroSec.offsetHeight - 120);
      }
    }

    const mobileMenu = document.getElementById('mobile-menu');
    const isMobileMenuOpen = mobileMenu && mobileMenu.classList.contains('open');

    // Rule 1: Always keep header visible if mobile menu drawer is open
    if (isMobileMenuOpen) {
      mainHeader.classList.add('scrolled');
      lastScrollY = currentScrollY;
      return;
    }

    // Rule 2: In Hero section (before reaching Section 2) -> Navbar REMAINS HIDDEN
    if (currentScrollY < heroThreshold) {
      mainHeader.classList.remove('scrolled');
      lastScrollY = currentScrollY;
      return;
    }

    // Rule 3: Past Hero section -> Smart Hide-on-Scroll with Threshold
    const delta = currentScrollY - lastScrollY;
    
    if (Math.abs(delta) >= SCROLL_DELTA_THRESHOLD) {
      if (delta > 0) {
        // Scrolling DOWN -> Hide navbar
        mainHeader.classList.remove('scrolled');
      } else {
        // Scrolling UP -> Reveal navbar
        mainHeader.classList.add('scrolled');
      }
      lastScrollY = currentScrollY;
    }
  }

  window.addEventListener('scroll', handleSmartHeaderScroll, { passive: true });
  handleSmartHeaderScroll(); // initial check

  // --- 1. Anchor Link Click Animation & Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        
        // Active link feedback animation
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        if (this.classList.contains('nav-link')) {
          this.classList.add('active');
        }

        // Calculate offset position respecting fixed header (80px)
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 75;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Trigger section flash animation
        targetElem.classList.remove('section-flash-target');
        void targetElem.offsetWidth; // trigger reflow
        targetElem.classList.add('section-flash-target');

        setTimeout(() => {
          targetElem.classList.remove('section-flash-target');
        }, 1300);
      }
    });
  });

  // --- 2. Theme Switcher (Light / Dark Mode) ---
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const currentTheme = localStorage.getItem('theme') || 'dark';

  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcons('light');
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcons(newTheme);
    });
  });

  function updateThemeIcons(theme) {
    themeToggleBtns.forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
      }
    });
  }

  // --- 3. Mobile Menu Toggle (Isolated from theme toggle) ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.toggle('open');
      handleSmartHeaderScroll();
      
      const icon = mobileToggle.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = isOpen ? 'close' : 'menu';
      }
    });

    mobileMenu.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        handleSmartHeaderScroll();
        const icon = mobileToggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'menu';
      });
    });
  }

  // --- 4. Scroll Reveal Intersection Observer ---
  const revealTargets = document.querySelectorAll('.section, .bento-card, .highlight-box, .accordion-item, .hero-content');
  revealTargets.forEach(el => el.classList.add('reveal-element'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    revealTargets.forEach(target => revealObserver.observe(target));
  } else {
    // Fallback if IntersectionObserver not supported
    revealTargets.forEach(target => target.classList.add('revealed'));
  }

  // --- 5. Interactive Accordion ("How we roll") ---
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      accordionItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- 6. Portfolio Filter ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.bento-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // --- 7. Connect Modal Drawer ---
  const modalBackdrop = document.getElementById('connect-modal');
  const openModalBtns = document.querySelectorAll('.open-connect-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const connectForm = document.getElementById('connect-form');
  const formSuccessMessage = document.getElementById('form-success');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalBackdrop) modalBackdrop.classList.add('open');
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (modalBackdrop) modalBackdrop.classList.remove('open');
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('open');
      }
    });
  }

  if (connectForm) {
    connectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      connectForm.style.display = 'none';
      if (formSuccessMessage) {
        formSuccessMessage.style.display = 'block';
      }
      setTimeout(() => {
        if (modalBackdrop) modalBackdrop.classList.remove('open');
        setTimeout(() => {
          connectForm.reset();
          connectForm.style.display = 'flex';
          if (formSuccessMessage) formSuccessMessage.style.display = 'none';
        }, 400);
      }, 2500);
    });
  }

  // --- 8. Safe Image Error Fallback (Prevents infinite network loops) ---
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function errorHandler() {
      // Remove event listener immediately to guarantee NO infinite loop!
      this.removeEventListener('error', errorHandler);
      if (!this.dataset.fallbackDone) {
        this.dataset.fallbackDone = 'true';
        this.src = '/hero_bg.jpg';
      }
    });
  });

  // --- 9. Lightbox Preview Modal for Project Detail ---
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryThumbnails = document.querySelectorAll('.gallery-thumb');

  galleryThumbnails.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgInside = thumb.querySelector('img');
      let src = thumb.getAttribute('data-fullsrc') || 
                (imgInside ? imgInside.getAttribute('src') : null) || 
                thumb.getAttribute('src');
                
      if (src && lightboxImage && lightboxModal) {
        if (!src.startsWith('http') && !src.startsWith('/')) {
          src = '/' + src;
        }
        lightboxImage.src = src;
        lightboxModal.classList.add('open');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      if (lightboxModal) lightboxModal.classList.remove('open');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('open');
      }
    });
  }
});
