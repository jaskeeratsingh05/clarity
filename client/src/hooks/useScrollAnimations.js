import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits text into individual word/char spans for staggered animation.
 * Returns cleanup fn that restores original text.
 */
export const splitTextIntoWords = (el) => {
  if (!el) return () => {};
  const original = el.innerHTML;
  const words = el.innerText.trim().split(/\s+/);
  el.innerHTML = words
    .map(w => `<span class="gsap-word" style="display:inline-block;overflow:hidden;"><span class="gsap-word-inner" style="display:inline-block;">${w}</span></span>`)
    .join(' ');
  return () => { el.innerHTML = original; };
};

/**
 * Main scroll animation hook — attaches all GSAP ScrollTrigger animations.
 */
export const useScrollAnimations = (lenisRef) => {
  useEffect(() => {
    // Let DOM settle
    const timer = setTimeout(() => {
      setupAnimations(lenisRef);
    }, 100);
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
};

const setupAnimations = (lenisRef) => {
  // ── Sync GSAP ScrollTrigger with Lenis ──────────────────────
  if (lenisRef?.current) {
    lenisRef.current.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenisRef.current?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const ease = 'power3.out';

  // ── Hero Section ─────────────────────────────────────────────
  const heroTl = gsap.timeline({ defaults: { ease, duration: 1 } });

  heroTl
    .from('.hero-badge', { opacity: 0, y: 20, duration: 0.7 }, 0.2)
    .from('.hero-title', { opacity: 0, y: 40, duration: 0.9 }, 0.4)
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8 }, 0.6)
    .from('.hero-cta > *', { opacity: 0, y: 24, stagger: 0.12, duration: 0.7 }, 0.8)
    .from('.hero-stat', { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, 1.0)
    .from('.hero-book-wrap', { opacity: 0, scale: 0.88, duration: 1.1, ease: 'back.out(1.4)' }, 0.5)
    .from('.scroll-indicator', { opacity: 0, y: 10, duration: 0.6 }, 1.4);

  // Hero orbs parallax on scroll
  gsap.to('.hero-orb-1', {
    y: -80,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
  });
  gsap.to('.hero-orb-2', {
    y: -50,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 },
  });
  gsap.to('.hero-orb-3', {
    y: -100,
    x: 40,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });
  gsap.to('.hero-bg-grid', {
    y: 60,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 },
  });

  // ── How It Works ─────────────────────────────────────────────
  gsap.from('.how-section .section-label', {
    opacity: 0, y: 20,
    scrollTrigger: { trigger: '.how-section', start: 'top 82%' },
    ease, duration: 0.7,
  });
  gsap.from('.how-section .section-heading', {
    opacity: 0, y: 30,
    scrollTrigger: { trigger: '.how-section', start: 'top 78%' },
    ease, duration: 0.8, delay: 0.1,
  });
  gsap.from('.step-card', {
    opacity: 0, y: 60, scale: 0.96,
    stagger: 0.15,
    duration: 0.9,
    ease: 'back.out(1.2)',
    scrollTrigger: { trigger: '.steps-grid', start: 'top 80%' },
  });

  // ── Features ─────────────────────────────────────────────────
  gsap.from('.features-section .section-label', {
    opacity: 0, y: 20,
    scrollTrigger: { trigger: '.features-section', start: 'top 82%' },
    ease, duration: 0.7,
  });
  gsap.from('.features-section .section-heading', {
    opacity: 0, y: 30,
    scrollTrigger: { trigger: '.features-section', start: 'top 78%' },
    ease, duration: 0.8, delay: 0.1,
  });
  gsap.from('.feature-card', {
    opacity: 0, y: 50, scale: 0.95,
    stagger: { amount: 0.6, grid: 'auto', from: 'start' },
    duration: 0.85,
    ease: 'back.out(1.2)',
    scrollTrigger: { trigger: '.features-grid', start: 'top 80%' },
  });

  // ── Testimonial / Quote ───────────────────────────────────────
  gsap.from('.quote-mark', {
    opacity: 0, scale: 0.5, y: 20,
    scrollTrigger: { trigger: '.quote-section', start: 'top 80%' },
    ease: 'back.out(1.6)', duration: 0.7,
  });
  gsap.from('.quote-text', {
    opacity: 0, y: 24,
    scrollTrigger: { trigger: '.quote-section', start: 'top 78%' },
    ease, duration: 0.8, delay: 0.2,
  });
  gsap.from('.quote-author', {
    opacity: 0, y: 20,
    scrollTrigger: { trigger: '.quote-section', start: 'top 75%' },
    ease, duration: 0.7, delay: 0.45,
  });

  // ── Pricing ───────────────────────────────────────────────────
  gsap.from('.pricing-section .section-label', {
    opacity: 0, y: 20,
    scrollTrigger: { trigger: '.pricing-section', start: 'top 82%' },
    ease, duration: 0.7,
  });
  gsap.from('.pricing-section .section-heading', {
    opacity: 0, y: 30,
    scrollTrigger: { trigger: '.pricing-section', start: 'top 78%' },
    ease, duration: 0.8, delay: 0.1,
  });
  gsap.from('.pricing-section .text-muted', {
    opacity: 0, y: 20,
    scrollTrigger: { trigger: '.pricing-section', start: 'top 74%' },
    ease, duration: 0.7, delay: 0.2,
  });
  gsap.from('.pricing-card', {
    opacity: 0, y: 70, scale: 0.94,
    stagger: 0.18,
    duration: 1,
    ease: 'back.out(1.3)',
    scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%' },
  });

  // ── CTA Banner ────────────────────────────────────────────────
  gsap.from('.cta-title', {
    opacity: 0, y: 40, scale: 0.97,
    scrollTrigger: { trigger: '.cta-section', start: 'top 78%' },
    ease, duration: 0.9,
  });
  gsap.from('.cta-sub', {
    opacity: 0, y: 24,
    scrollTrigger: { trigger: '.cta-section', start: 'top 76%' },
    ease, duration: 0.8, delay: 0.2,
  });
  gsap.from('.cta-section .btn', {
    opacity: 0, y: 20, scale: 0.95,
    scrollTrigger: { trigger: '.cta-section', start: 'top 73%' },
    ease: 'back.out(1.5)', duration: 0.7, delay: 0.4,
  });

  // ── CTA Glow parallax ─────────────────────────────────────────
  gsap.to('.cta-glow', {
    scale: 1.5, opacity: 0.5,
    ease: 'none',
    scrollTrigger: { trigger: '.cta-section', start: 'top bottom', end: 'bottom top', scrub: 1.5 },
  });

  // ── Footer ────────────────────────────────────────────────────
  gsap.from('.landing-footer > *', {
    opacity: 0, y: 20, stagger: 0.12,
    scrollTrigger: { trigger: '.landing-footer', start: 'top 90%' },
    ease, duration: 0.7,
  });

  // ── Section entrance fade ─────────────────────────────────────
  // Subtle fade-in on section borders/tops as they enter
  gsap.utils.toArray('.how-section::before').forEach(el => {
    gsap.from(el, {
      scaleX: 0, transformOrigin: 'left',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      ease, duration: 1,
    });
  });
};
