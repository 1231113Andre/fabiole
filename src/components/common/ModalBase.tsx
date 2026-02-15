'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalAnimator } from '@/lib/animations/ModalAnimator';
import { useTextAnimator } from '@/lib/animations/TextAnimator';
// import { AppVersionBadge } from './AppVersionBadge'; // Removed as it is not present in fabiole

interface ModalBaseProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: React.ReactNode;
    titleId: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    zIndex?: string;
    className?: string;
}

export const ModalBase = ({ isOpen, onClose, children, title, titleId, size = 'md', zIndex = 'z-[1050]', className }: ModalBaseProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const mouseDownTargetRef = useRef<EventTarget | null>(null);

    // Standard Tailwind Breakpoints:
    // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
    const sizeClasses = {
        sm: "w-[95%] sm:max-w-sm",
        md: "w-[95%] sm:max-w-md",
        lg: "w-[95%] sm:max-w-lg",
        xl: "w-[95%] sm:max-w-lg md:max-w-xl",
        "2xl": "w-[95%] sm:max-w-xl md:max-w-2xl",
        "3xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
        "4xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
        "5xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl",
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.md;

    // Text animation for the modal content
    useTextAnimator(contentRef, [isOpen]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && isMounted) {
            const animator = new ModalAnimator(backdropRef.current, dialogRef.current);
            // Animate the modal in when it opens
            animator.animateIn();
        }
    }, [isOpen, isMounted]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isAnimatingOut) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            requestAnimationFrame(() => {
                closeButtonRef.current?.focus();
            });
        } else {
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isAnimatingOut, onClose]);

    const handleClose = () => {
        if (isAnimatingOut) return;

        setIsAnimatingOut(true);
        const animator = new ModalAnimator(backdropRef.current, dialogRef.current);
        animator.animateOut().then(() => {
            setIsAnimatingOut(false);
            onClose();
        });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen && !isAnimatingOut) return null;
    if (!isMounted) return null;

    return createPortal(
        <div
            ref={backdropRef}
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center ${zIndex} overscroll-y-none`}
            onMouseDown={(e) => {
                // Track where the mouse down started
                mouseDownTargetRef.current = e.target;
            }}
            onClick={(e) => {
                // Only close if both mousedown and click happened on the backdrop itself
                // This prevents closing when scrolling inside the dialog triggers a click
                if (e.target === backdropRef.current && mouseDownTargetRef.current === backdropRef.current) {
                    handleClose();
                }
                mouseDownTargetRef.current = null;
            }}
            style={{ opacity: 0 }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`relative bg-[var(--background)] border-theme rounded-2xl shadow-2xl ${currentSizeClass} m-4 ${className || ''} max-h-[90vh] overflow-y-auto custom-scrollbar font-montserrat text-[var(--foreground)] overscroll-contain`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
                <div ref={contentRef} className="p-0">
                    <div className="flex justify-between items-center p-6 border-b border-gray-900/10">
                        <h2 id={titleId} className="text-xl font-bold">
                            {title}
                        </h2>
                        <button ref={closeButtonRef} onClick={handleClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded-full hover:bg-gray-500/15 cursor-pointer" aria-label="Close">
                            <i className="fa-solid fa-xmark fa-lg"></i>
                        </button>
                    </div>
                    {/* Content wrapper with padding */}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
};
