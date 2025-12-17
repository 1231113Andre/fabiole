import gsap from 'gsap';

/**
 * Class to handle the opening/closing animation of a modal
 * using GSAP, with a fade and scale effect.
 */
export class ModalAnimator {
    private backdropElement: HTMLDivElement | null;
    private dialogElement: HTMLDivElement | null;

    constructor(backdropElement: HTMLDivElement | null, dialogElement: HTMLDivElement | null) {
        this.backdropElement = backdropElement;
        this.dialogElement = dialogElement;
    }

    /**
     * Sets the initial hidden state of the modal.
     */
    public setInitialState(): void {
        if (this.backdropElement) gsap.set(this.backdropElement, { opacity: 0 });
        if (this.dialogElement) gsap.set(this.dialogElement, { opacity: 0 });
    }

    /**
     * Animates the modal opening.
     */
    public animateIn(): void {
        if (!this.backdropElement || !this.dialogElement) return;

        const tl = gsap.timeline({
            defaults: {
                duration: 0.3,
                ease: 'power2.out',
            },
        });

        tl.to(this.backdropElement, { opacity: 1 })
            .to(
                this.dialogElement,
                { opacity: 1, force3D: true },
                '-=0.2'
            );
    }

    /**
     * Animates the modal closing.
     * @returns A Promise that resolves when the animation is complete.
     */
    public animateOut(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.backdropElement || !this.dialogElement) {
                resolve();
                return;
            }

            const tl = gsap.timeline({
                onComplete: resolve,
                defaults: {
                    duration: 0.2,
                    ease: 'power2.in',
                },
            });

            tl.to(this.dialogElement, {
                opacity: 0,
                force3D: true,
            }).to(this.backdropElement, { opacity: 0 }, '-=0.1');
        });
    }
}
