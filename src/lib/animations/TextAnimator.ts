// lib/animations/TextAnimator.ts
import React from 'react';
import gsap from 'gsap';

interface TextAnimatorConfig {
    duration?: number;
    ease?: string;
    stagger?: number;
    delay?: number;
}

export class TextAnimator {
    private containerRef: React.RefObject<HTMLElement | null>;
    private ctx: gsap.Context | null = null;
    private config: Required<TextAnimatorConfig>;
    private isMounted = false;

    private static readonly TEXT_SELECTORS = {
        headers: 'h1, h2, h3, h4, h5, h6',
        paragraphs: 'p',
        spans: 'span:not(.lucide):not([data-no-animate])',
        buttons: 'button span, .btn span',
        labels: 'label',
        divText: 'div:not([class*="icon"]):not([class*="lucide"]):not([data-no-animate])',
        customAnimated: '[data-animation="animated-text-item"]'
    };

    private static readonly DEFAULT_CONFIG: Required<TextAnimatorConfig> = {
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.03,
        delay: 0.0
    };

    constructor(
        containerRef: React.RefObject<HTMLElement | null>,
        config: TextAnimatorConfig = {}
    ) {
        this.containerRef = containerRef;
        this.config = { ...TextAnimator.DEFAULT_CONFIG, ...config };
    }

    public setMounted(): void {
        this.isMounted = true;
    }

    public async animate(): Promise<void> {
        if (!this.isMounted || !this.containerRef.current) return;

        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                this.performAnimation(resolve);
            });
        });
    }

    public stop(): void {
        if (this.ctx) {
            this.ctx.revert();
        }
    }

    public destroy(): void {
        this.stop();
        this.isMounted = false;
    }

    private performAnimation(resolve: () => void): void {
        if (!this.containerRef.current) {
            resolve();
            return;
        }

        this.stop();

        this.ctx = gsap.context(() => {
            const textElements = this.findTextElements();

            if (textElements.length === 0) {
                resolve();
                return;
            }

            gsap.set(textElements, { opacity: 0, y: 20 });

            gsap.to(textElements, {
                opacity: 1,
                y: 0,
                duration: this.config.duration,
                ease: this.config.ease,
                stagger: this.config.stagger,
                delay: this.config.delay,
                onComplete: resolve
            });
        }, this.containerRef.current);
    }

    private findTextElements(): Element[] {
        if (!this.containerRef.current) return [];

        const elements: Element[] = [];
        const container = this.containerRef.current;

        const customElements = Array.from(container.querySelectorAll(TextAnimator.TEXT_SELECTORS.customAnimated));
        if (customElements.length > 0) {
            return customElements;
        }

        const headers = Array.from(container.querySelectorAll(TextAnimator.TEXT_SELECTORS.headers));
        elements.push(...headers);

        const paragraphs = Array.from(container.querySelectorAll(TextAnimator.TEXT_SELECTORS.paragraphs));
        elements.push(...paragraphs);

        const spans = Array.from(container.querySelectorAll(TextAnimator.TEXT_SELECTORS.spans))
            .filter(span => this.hasVisibleText(span));
        elements.push(...spans);

        const buttonSpans = Array.from(container.querySelectorAll(TextAnimator.TEXT_SELECTORS.buttons))
            .filter(span => this.hasVisibleText(span));
        elements.push(...buttonSpans);

        const textDivs = Array.from(container.querySelectorAll(TextAnimator.TEXT_SELECTORS.divText))
            .filter(div => this.hasVisibleText(div) && !this.hasIconChild(div));
        elements.push(...textDivs);

        return this.removeDuplicatesAndNested(elements);
    }

    private hasVisibleText(element: Element): boolean {
        const text = element.textContent?.trim() || '';
        return text.length > 0 && text.length > 2;
    }

    private hasIconChild(element: Element): boolean {
        return element.querySelector('svg, .lucide, [class*="icon"]') !== null;
    }

    private removeDuplicatesAndNested(elements: Element[]): Element[] {
        const uniqueElements = Array.from(new Set(elements));

        return uniqueElements.filter(element => {
            return !uniqueElements.some(other =>
                other !== element && other.contains(element)
            );
        });
    }
}

export function useTextAnimator(
    containerRef: React.RefObject<HTMLElement | null>,
    dependencies: any[] = [],
    config?: TextAnimatorConfig
) {
    const [animator, setAnimator] = React.useState<TextAnimator | null>(null);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useLayoutEffect(() => {
        const newAnimator = new TextAnimator(containerRef, config);
        setAnimator(newAnimator);

        return () => {
            newAnimator.destroy();
        };
    }, []);

    React.useEffect(() => {
        setIsMounted(true);
        if (animator) {
            animator.setMounted();
        }
    }, [animator]);

    React.useEffect(() => {
        if (animator && isMounted) {
            animator.animate();
        }
    }, [animator, isMounted, ...dependencies]);

    return {
        animator,
        isMounted,
        animate: () => animator?.animate()
    };
}
