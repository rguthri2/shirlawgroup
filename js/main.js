document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const overlay = document.querySelector('.nav-overlay');

  // Sticky header shadow
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  const closeNav = () => {
    mainNav.classList.remove('open');
    overlay.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.has-dropdown.open').forEach((el) => el.classList.remove('open'));
  };
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      overlay.classList.toggle('show', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
  if (overlay) overlay.addEventListener('click', closeNav);

  // Dropdown toggle on mobile (tap to expand)
  document.querySelectorAll('.has-dropdown > .nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1220) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // Close mobile nav when a real link is clicked
  document.querySelectorAll('.main-nav a:not(.has-dropdown > .nav-link)').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Contact / newsletter form demo handling (no backend configured)
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = form.parentElement.querySelector('.form-success') || form.querySelector('.form-success');
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 6000);
      }
      form.reset();
    });
  });

  // Main contact form: real submission to contact-handler.php (reCAPTCHA v2 checkbox)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const errorBox = contactForm.parentElement.querySelector('.form-error');
    const successMsg = contactForm.parentElement.querySelector('.form-success');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      errorBox?.classList.remove('show');
      successMsg?.classList.remove('show');

      if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0) {
        if (errorBox) {
          errorBox.textContent = 'Please complete the reCAPTCHA before submitting.';
          errorBox.classList.add('show');
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            successMsg?.classList.add('show');
            contactForm.reset();
          } else if (errorBox) {
            errorBox.textContent = data.message || 'Something went wrong sending your message. Please try again or call us directly.';
            errorBox.classList.add('show');
          }
          if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        })
        .catch(() => {
          errorBox?.classList.add('show');
          if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        });
    });
  }

  // Hero slider
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    const goTo = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    const startAutoplay = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 6000);
    };

    slider.querySelector('.hero-arrow.next')?.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });
    slider.querySelector('.hero-arrow.prev')?.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAutoplay(); }));

    if (slides.length > 1) {
      goTo(0);
      startAutoplay();
    }
  }
});
