/* ============================================
   LLOKALLA GAMING - LÓGICA OPTIMIZADA
   Rendimiento AAA · Sin pérdida de efectos
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ============================================
     UTILIDADES DE RENDIMIENTO
     ============================================ */
  
  // Throttle - limita la frecuencia de ejecución
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Debounce - espera a que el evento termine
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // Detectar capacidades del dispositivo
  const isMobile = window.matchMedia('(max-width: 968px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  // Marcar dispositivo para CSS
  if (isLowEnd) {
    document.documentElement.classList.add('low-end-device');
  }
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  /* ============================================
     1. MENÚ MÓVIL - Toggle
     ============================================ */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      const spans = navToggle.querySelectorAll('span');
      if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        document.body.style.overflow = 'hidden';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        document.body.style.overflow = '';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        document.body.style.overflow = '';
      });
    });
  }

  /* ============================================
     2. NAVBAR - Cambio al hacer scroll (OPTIMIZADO)
     Usa clase CSS en lugar de inline styles
     ============================================ */
  const navbar = document.querySelector('.navbar');
  
  const updateNavbar = () => {
    if (!navbar) return;
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  
  // Throttle de 100ms - solo ejecuta 10 veces por segundo máximo
  const throttledNavbar = throttle(updateNavbar, 100);
  window.addEventListener('scroll', throttledNavbar, { passive: true });
  updateNavbar(); // Estado inicial

  /* ============================================
     3. SCROLL REVEAL - IntersectionObserver
     ============================================ */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, Math.min(index * 80, 300));
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.product-card, .category-card, .value-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  /* ============================================
     4. SMOOTH SCROLL - Navegación Fluida
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      if (href !== '#' && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const offsetTop = target.offsetTop - 80;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  /* ============================================
     5. PARALLAX HERO - OPTIMIZADO con RAF
     ============================================ */
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const heroVideo = document.querySelector('.hero-video');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (hero && heroContent) {
    let ticking = false;
    let lastScrollY = 0;
    
    const updateParallax = () => {
      const scrolled = lastScrollY;
      const heroHeight = hero.offsetHeight;
      
      if (scrolled < heroHeight) {
        // Usar translate3d para forzar GPU
        heroContent.style.transform = `translate3d(0, ${scrolled * 0.5}px, 0)`;
        heroContent.style.opacity = 1 - (scrolled / heroHeight);
        
        if (heroVideo) {
          heroVideo.style.transform = `scale(1.02) translate3d(0, ${scrolled * 0.3}px, 0)`;
        }
      }
      
      ticking = false;
    };
    
    // Solo actualizar si no hay un frame pendiente
    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================
     6. LAZY LOADING - Imágenes (nativo + fallback)
     ============================================ */
  if ('loading' in HTMLImageElement.prototype) {
    // Navegadores modernos: usan loading="lazy" nativo
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else if ('IntersectionObserver' in window) {
    // Fallback para navegadores antiguos
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /* ============================================
     7. TRACKING DE CLICKS - Analytics
     ============================================ */
  document.querySelectorAll('.btn-buy, .btn-price, .btn-whatsapp').forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = e.target.textContent.trim();
      const page = window.location.pathname;
      const timestamp = new Date().toISOString();
      
      console.log(`🎮 Click: ${buttonText} | Página: ${page} | ${timestamp}`);
    }, { passive: true });
  });

  /* ============================================
     8. 3D TILT - Solo en dispositivos capaces
     (No se elimina, solo se condiciona)
     ============================================ */
  if (!isMobile && !prefersReducedMotion && !isLowEnd) {
    document.querySelectorAll('.product-card').forEach(card => {
      let rafId = null;
      
      card.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      }, { passive: true });
    });
  }

  /* ============================================
     9. INDICADOR DE SCROLL - Hero
     ============================================ */
  if (scrollIndicator) {
    const updateScrollIndicator = () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    };
    
    const throttledIndicator = throttle(updateScrollIndicator, 100);
    window.addEventListener('scroll', throttledIndicator, { passive: true });
  }

  /* ============================================
     10. EFECTO MAGNÉTICO EN BOTONES CTA
     (Optimizado con RAF)
     ============================================ */
  if (!prefersReducedMotion && !isLowEnd) {
    document.querySelectorAll('.btn-primary, .btn-whatsapp-large').forEach(button => {
      let rafId = null;
      
      button.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
      }, { passive: true });
      
      button.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        button.style.transform = 'translate(0, 0)';
      }, { passive: true });
    });
  }

  /* ============================================
     11. EFECTO TYPING EN TÍTULO HERO
     (Optimizado con una sola animación)
     ============================================ */
  if (!prefersReducedMotion) {
    const heroTitle = document.querySelector('.hero-title');
    
    if (heroTitle) {
      const originalText = heroTitle.textContent;
      const words = originalText.split(' ');
      
      heroTitle.innerHTML = words.map((word, index) => 
        `<span style="display: inline-block; opacity: 0; animation: wordFadeIn 0.5s ease-out ${index * 0.15 + 0.3}s forwards;">${word}</span>`
      ).join(' ');
    }
  }

  /* ============================================
     12. EFECTO GLITCH EN LOGO
     (Optimizado - usa solo CSS, no JS)
     Ahora se maneja por CSS @keyframes logoGlitch
     ============================================ */

  /* ============================================
     13. PARTÍCULAS EN HOVER
     (Solo en desktop, cantidad reducida)
     ============================================ */
  if (!isMobile && !prefersReducedMotion && !isLowEnd) {
    document.querySelectorAll('.product-card, .category-card').forEach(card => {
      let lastParticleTime = 0;
      
      card.addEventListener('mouseenter', () => {
        const now = Date.now();
        if (now - lastParticleTime < 2000) return; // Solo cada 2 segundos
        lastParticleTime = now;
        
        for (let i = 0; i < 3; i++) { // Reducido de 5 a 3
          setTimeout(() => {
            const particle = document.createElement('div');
            const rect = card.getBoundingClientRect();
            const x = Math.random() * rect.width;
            const y = rect.height - 20;
            
            particle.style.cssText = `
              position: absolute;
              top: ${y}px;
              left: ${x}px;
              width: 4px;
              height: 4px;
              background: rgba(193, 166, 117, 0.6);
              border-radius: 50%;
              pointer-events: none;
              box-shadow: 0 0 10px rgba(193, 166, 117, 0.8);
              animation: particleFloat 1s ease-out forwards;
              z-index: 1000;
            `;
            
            card.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
          }, i * 100);
        }
      });
    });
  }

  /* ============================================
     14. KEYFRAMES DINÁMICOS (si no existen)
     ============================================ */
  if (!document.getElementById('dynamic-styles')) {
    const dynamicStyles = document.createElement('style');
    dynamicStyles.id = 'dynamic-styles';
    dynamicStyles.textContent = `
      @keyframes wordFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(dynamicStyles);
  }

  /* ============================================
     15. CONSOLE WELCOME
     ============================================ */
  console.log(`
  %c🎮 LLOKALLA GAMING %cJugando a otro nivel
  `, 
  'background: linear-gradient(135deg, #C1A675, #A68B5B); color: #08090A; padding: 10px 20px; font-size: 20px; font-weight: bold; border-radius: 5px;',
  'background: #1a1a2e; color: #C1A675; padding: 10px 20px; font-size: 14px; border-radius: 5px;'
  );
  
  console.log('%c⚡ Rendimiento optimizado · Todos los efectos activos', 'color: #A0A0A0; font-style: italic;');
  
  if (isLowEnd) {
    console.log('%c🔧 Modo dispositivo de baja gama: animaciones ralentizadas', 'color: #FFD166;');
  }
  
  if (isMobile) {
    console.log('%c📱 Modo móvil: efectos 3D desactivados para mejor rendimiento', 'color: #FF9CC2;');
  }

});