import React from 'react';
import Link from 'next/link';

interface NavbarButtonProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

/**
 * Server Component dla przycisków w navbarze
 * Zastępuje NewButton dla lepszej wydajności SSR
 */
export default function NavbarButton({
  href,
  children,
  icon,
  iconPosition = 'right',
  className = '',
}: NavbarButtonProps) {
  // BASE_STYLES z NewButton (bez px-4, bo wariant ma px-6)
  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'text-sm',
    'font-semibold',
    'transition-[color,background-color,border-color,box-shadow,transform]',
    'duration-300',
    'ease-out',
    'active:scale-95',
    'whitespace-nowrap',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-primary',
    'cursor-pointer',
  ].join(' ');

  // VARIANTS['new_primary_rounded'] z NewButton
  const variantStyles = [
    'bg-primary',
    'text-white',
    'rounded-lg',
    'shadow-md',
    'font-medium',
    'text-base',
    'px-6',
    'disabled:opacity-60',
    'hover:bg-orange-600/20',
    'hover:shadow-2xl',
    'hover:shadow-orange-500/50',
    'active:shadow-lg',
    'transition-all',
    'duration-200',
    'ease-out',
    'border-2',
    'border-orange-400',
  ].join(' ');

  // Domyślna wysokość i padding z NewButton (h-12 py-3)
  const defaultStyles = 'h-12 py-3';

  // Sprawdź czy przycisk ma klasę hero-cta-btn dla specjalnego odstępu ikony
  const isHeroCtaButton = className.includes('hero-cta-btn');
  
  // Odstęp ikony - większy dla hero-cta-btn (używamy inline style jak w NewButton)
  const iconSpacingStyle = isHeroCtaButton && iconPosition === 'right' ? { marginLeft: '1rem' } : {};
  const leftIconSpacingStyle = isHeroCtaButton && iconPosition === 'left' ? { marginRight: '1rem' } : {};
  const iconSpacingClass = isHeroCtaButton ? '' : (iconPosition === 'right' ? 'ml-2' : 'mr-2');
  const leftIconSpacingClass = isHeroCtaButton ? '' : 'mr-2';

  // Dodatkowe klasy z className (uppercase, font-bold, text-lg itp.)
  // Zawsze dodajemy uppercase dla przycisków navbaru
  const allClasses = `${baseStyles} ${variantStyles} ${defaultStyles} uppercase font-bold text-lg ${className}`;
  
  return (
    <Link
      href={href}
      className={allClasses}
      prefetch={true}
    >
      {iconPosition === 'left' && icon && (
        <span 
          className={`flex-shrink-0 ${leftIconSpacingClass}`}
          style={leftIconSpacingStyle}
        >
          {icon}
        </span>
      )}
      {children}
      {iconPosition === 'right' && icon && (
        <span 
          className={`flex-shrink-0 ${iconSpacingClass}`}
          style={iconSpacingStyle}
        >
          {icon}
        </span>
      )}
    </Link>
  );
}

