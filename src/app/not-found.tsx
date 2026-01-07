'use client';

import React, { useEffect, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NewButton from '@/app/components/newButton';

// Smooth parallax effect like lolboost.gg
const useParallax = (containerRef: React.RefObject<HTMLDivElement | null>, layersRef: React.RefObject<HTMLDivElement | null>) => {
  const rafId = useRef<number | undefined>(undefined);
  const mousePosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    // Slightly faster interpolation
    currentPosition.current.x += (mousePosition.current.x - currentPosition.current.x) * 0.05;
    currentPosition.current.y += (mousePosition.current.y - currentPosition.current.y) * 0.05;

    if (layersRef.current) {
      const layers = layersRef.current.querySelectorAll('.parallax-layer');
      const speeds = [0.2, 0.4, 0.6]; // Slightly faster layered movement

      layers.forEach((layer, index) => {
        const speed = speeds[index] || 0.3;
        const translateX = currentPosition.current.x * speed;
        const translateY = currentPosition.current.y * speed;
        (layer as HTMLElement).style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
      });
    }

    rafId.current = requestAnimationFrame(animate);
  }, [layersRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate mouse position relative to center - slightly faster
    const maxRangeX = 10; // Slightly more horizontal movement
    const maxRangeY = 6; // Slightly more vertical movement
    mousePosition.current.x = Math.max(-maxRangeX, Math.min(maxRangeX, (x - centerX) * 0.05));
    mousePosition.current.y = Math.max(-maxRangeY, Math.min(maxRangeY, (y - centerY) * 0.04));
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Start animation loop
    rafId.current = requestAnimationFrame(animate);

    container.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleMouseMove, animate]);
};

const NotFound = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useParallax(containerRef, layersRef);

  const handleBackToHome = useCallback(() => {
    router.push('/');
    // Force scroll to hero section after navigation
    setTimeout(() => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        // Fallback to top if hero section not found
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }, 100);
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center bg-background not-found-container"
      data-404="true"
    >
      <div
        ref={layersRef}
        className="relative flex items-center justify-center z-0 mb-4 w-[500px] h-[200px] max-w-full"
      >
        <div className="parallax-layer absolute inset-0 flex items-center justify-center">
          <Image
            src="/404/layer01.png"
            alt="404 Layer 1"
            width={500}
            height={200}
            className="object-contain w-auto h-auto"
            priority
            sizes="500px"
          />
        </div>
        <div className="parallax-layer absolute inset-0 flex items-center justify-center">
          <Image
            src="/404/layer02.png"
            alt="404 Layer 2"
            width={500}
            height={200}
            className="object-contain w-auto h-auto"
            priority
            sizes="500px"
          />
        </div>
        <div className="parallax-layer absolute inset-0 flex items-center justify-center">
          <Image
            src="/404/layer03.png"
            alt="404 Layer 3"
            width={500}
            height={200}
            className="object-contain w-auto h-auto"
            priority
            sizes="500px"
          />
        </div>
      </div>

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-fugazone text-white mb-2 tracking-wider">
          PAGE NOT FOUND
        </h2>

        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto text-base">
          The page you are looking for is not available.
        </p>

        <div className="flex justify-center">
          <NewButton
            onClick={handleBackToHome}
            variant="new_primary_full_rounded"
            icon={<i className="fa-solid fa-chevron-left"></i>}
            iconPosition="left"
            className="uppercase font-base"
          >
            Back to homepage
          </NewButton>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            transform: 'translate(50%, 50%)'
          }}
        />
      </div>
    </div>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;

