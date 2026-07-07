import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Premium custom cursor with smooth lag and scale on hover.
 * Only shows on desktop (pointer: fine).
 */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Check if we're on a touch/mobile device
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // The dot follows mouse directly
    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none' });
      gsap.to(ring, { x: mouseX, y: mouseY, duration: 0.28, ease: 'power2.out' });
    };

    // Scale up on interactive elements
    const onEnter = () => {
      gsap.to(dot, { scale: 0.4, duration: 0.2 });
      gsap.to(ring, { scale: 2.2, borderColor: 'rgba(167,139,250,0.8)', duration: 0.3 });
    };
    const onLeave = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 });
      gsap.to(ring, { scale: 1, borderColor: 'rgba(167,139,250,0.5)', duration: 0.3 });
    };

    // Disappear on click
    const onDown = () => gsap.to([dot, ring], { scale: 0.7, duration: 0.1 });
    const onUp = () => gsap.to([dot, ring], { scale: 1, duration: 0.2, ease: 'back.out(2)' });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const interactives = document.querySelectorAll(
      'a, button, [role="button"], .tilt-card, .book-scene, input, textarea'
    );
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    // MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll(
        'a:not([data-cursor]), button:not([data-cursor])'
      ).forEach(el => {
        if (!el.dataset.cursor) {
          el.dataset.cursor = '1';
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#a78bfa',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
          mixBlendMode: 'normal',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 36, height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(167,139,250,0.5)',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
          backdropFilter: 'blur(0px)',
        }}
      />
    </>
  );
};

export default CustomCursor;
