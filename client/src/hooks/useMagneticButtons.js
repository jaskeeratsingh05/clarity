import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * useMagneticButtons — attaches magnetic hover effect to all .btn-primary and .btn-secondary
 * elements. The element shifts toward the cursor within its bounding box.
 */
export const useMagneticButtons = () => {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const buttons = document.querySelectorAll('.btn-primary, .btn-lg, .plan-btn');
    const cleanups = [];

    buttons.forEach((btn) => {
      const onMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
      };

      const onLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      };

      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => cleanups.forEach(fn => fn());
  }, []);
};
