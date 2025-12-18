"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

// Definicja stałej dla domyślnej wysokości i Regexy do wykrywania klas
const DEFAULT_HEIGHT_CLASS = 'h-12';
const DEFAULT_VERTICAL_PADDING_CLASS = 'py-3'; // Nowa stała dla domyślnego paddingu
const HEIGHT_REGEX = /h-\d+/;
const PADDING_Y_REGEX = /py-\d+/;

// Podstawowe, wspólne style dla wszystkich przycisków
// ✅ POPRAWKA: Dodano `cursor-pointer` do stylów bazowych
const BASE_STYLES =
  "inline-flex items-center justify-center px-4 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out active:scale-95 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer";

// Warianty - USUNIĘTO py-3, aby było dodawane warunkowo w logice poniżej
const VARIANTS = {
  primary:
    "bg-primary text-white rounded-md shadow-lg disabled:bg-primary/60 " +
    "hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30",

  secondary:
    "bg-transparent text-primary border-2 border-primary rounded-full disabled:border-primary/60 disabled:text-primary/60 " +
    "hover:bg-primary hover:text-white ",

  primary_2:
    "bg-primary text-white rounded-md shadow-lg disabled:bg-primary/60 " +
    "hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30",

  outline:
    "bg-transparent text-primary border border-primary rounded-md disabled:border-primary/60 disabled:text-primary/60 " +
    "hover:bg-primary hover:text-white ",

  ghost:
    "bg-transparent text-primary rounded-md disabled:text-primary/60 " +
    "hover:bg-primary/10 ",

  subtle:
    "bg-primary/10 text-primary rounded-md disabled:bg-primary/5 disabled:text-primary/60 " +
    "hover:bg-primary/20",

  gradient:
    "text-white rounded-full shadow-lg bg-gradient-to-br from-primary via-primary-hover to-purple-600 disabled:opacity-60 " +
    "hover:brightness-110 hover:shadow-xl hover:shadow-primary/40",

  destructive:
    "bg-red-600 text-white rounded-md shadow-sm disabled:bg-red-600/60 " +
    "hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50",

  dark:
    "font-montserrat-medium font-bold text-base rounded-md shadow-md disabled:text-gray-200/60 " +
    "hover:bg-blue-900 hover:text-white hover:shadow-lg hover:shadow-blue-900/70",

  new_primary_rounded:
    "bg-primary text-white rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:!bg-transparent hover:border-orange-400 hover:!text-white " +
    "hover:shadow-[0_10px_24px_rgba(230,145,91,0.35)] " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 border-orange-400",
  new_primary_full_rounded:
    "bg-primary text-white rounded-full shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:!bg-transparent hover:border-orange-400 hover:!text-white" +
    "hover:shadow-[0_10px_24px_rgba(230,145,91,0.35)] " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 border-orange-400",
  new_primary_no_bg_rounded:
    "bg-transparent text-popover-foreground rounded-lg " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-primary hover:text-white hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 border-orange-400",
  new_secondary_no_border_on_idle:
    "bg-transparent text-popover-foreground rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-primary-hover hover:backdrop-blur-sm hover:shadow-2xl hover:bg-primary hover:border-orange-400 " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 border-transparent",
  new_primary_no_bg_full_rounded:
    "bg-transparent text-popover-foreground rounded-full shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-primary-hover hover:text-popover-foreground hover:backdrop-blur-sm hover:shadow-2xl hover:bg-primary " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " + "border-2 border-orange-400",

  sort_button:
    "bg-card text-foreground rounded-lg shadow-md " +
    "font-montserrat-semibold text-sm px-6 py-3 disabled:opacity-60 " +
    "hover:bg-primary hover:text-primary-foreground hover:shadow-lg" +
    "transition-all duration-200 ease-out " +
    "border-2 border-orange-400",
  new_destructive_no_bg_rounded:
    "bg-transparent text-destructive rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-destructive/10 hover:backdrop-blur-sm hover:shadow-xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 border-transparent",
  new_secondary_full_rounded:
    "bg-muted text-foreground rounded-full " +
    "font-medium text-base px-4 disabled:opacity-60 " +
    "hover:bg-muted/80 " +
    "transition-all duration-200 ease-out",

  new_secondary_full:
    "bg-muted text-foreground rounded-lg " +
    "font-medium text-base px-4 disabled:opacity-60 " +
    "hover:bg-muted/80 " +
    "transition-all duration-200 ease-out",


  // Order status buttons - using exact same CSS variables as status badges
  // IN_PROGRESS: oklch(0.6 0.15 250) - blue
  order_in_progress:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-in-progress-border)] " +
    "[color:white] " +
    "[border-color:var(--status-in-progress-border)] " +
    "hover:[background-color:var(--status-in-progress-bg)] " +
    "hover:[color:var(--status-in-progress-text)] " +
    "hover:[border-color:var(--status-in-progress-border)]",

  // PAUSED: oklch(0.55 0.15 250) - blue (darker than IN_PROGRESS)
  order_paused:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-paused-border)] " +
    "[color:white] " +
    "[border-color:var(--status-paused-border)] " +
    "hover:[background-color:var(--status-paused-bg)] " +
    "hover:[color:var(--status-paused-text)] " +
    "hover:[border-color:var(--status-paused-border)]",

  // RESUME: ciemnozielony kolor (dark green) - przywraca sesję do IN_PROGRESS
  order_resume:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-resume-border)] " +
    "[color:white] " +
    "[border-color:var(--status-resume-border)] " +
    "hover:[background-color:var(--status-resume-bg)] " +
    "hover:[color:var(--status-resume-text)] " +
    "hover:[border-color:var(--status-resume-border)]",

  // COMPLETED: oklch(0.6 0.15 145) - green/emerald
  order_completed:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-completed-border)] " +
    "[color:white] " +
    "[border-color:var(--status-completed-border)] " +
    "hover:[background-color:var(--status-completed-bg)] " +
    "hover:[color:var(--status-completed-text)] " +
    "hover:[border-color:var(--status-completed-border)]",

  // CANCELLED: oklch(0.6 0.2 28) - red
  order_cancelled:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-cancelled-border)] " +
    "[color:white] " +
    "[border-color:var(--status-cancelled-border)] " +
    "hover:[background-color:var(--status-cancelled-bg)] " +
    "hover:[color:var(--status-cancelled-text)] " +
    "hover:[border-color:var(--status-cancelled-border)]",

  // REFUNDED: oklch(0.5 0.01 0) - gray
  order_refunded:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-refunded-border)] " +
    "[color:white] " +
    "[border-color:var(--status-refunded-border)] " +
    "hover:[background-color:var(--status-refunded-bg)] " +
    "hover:[color:var(--status-refunded-text)] " +
    "hover:[border-color:var(--status-refunded-border)]",

  // CHANGE_COACH / RE_ASSIGN_COACH: indigo/purple kolor dla zmiany coacha
  order_change_coach:
    "rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:backdrop-blur-sm hover:shadow-2xl " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-2 " +
    "[background-color:var(--status-re-assign-coach-border)] " +
    "[color:white] " +
    "[border-color:var(--status-re-assign-coach-border)] " +
    "hover:[background-color:var(--status-re-assign-coach-bg)] " +
    "hover:[color:var(--status-re-assign-coach-text)] " +
    "hover:[border-color:var(--status-re-assign-coach-border)]",

  // Confirm logout button (red style similar to new_primary_rounded)
  confirm_logout:
    "bg-red-600 text-white rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-red-600/20 hover:text-red-600 hover:backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/50 " +
    "active:shadow-lg active:scale-95 " +
    "transition-all duration-200 ease-out " +
    "border-2 border-red-600 cursor-pointer",

  // Return to login history button (black style similar to new_primary_rounded)
  return_login_history:
    "bg-gray-800 text-white rounded-lg shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-gray-800/20 hover:text-gray-800 hover:backdrop-blur-sm hover:shadow-2xl hover:shadow-gray-800/50 " +
    "active:shadow-lg active:scale-95 " +
    "transition-all duration-200 ease-out " +
    "border-2 border-gray-800 cursor-pointer",

  // Revoke session button (red destructive style)
  revoke_session:
    "bg-red-600 text-white rounded-lg shadow-md " +
    "font-bold text-[11px] uppercase tracking-wider px-3 py-1.5 disabled:opacity-60 " +
    "hover:bg-red-600/20 hover:text-red-600 hover:backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/50 " +
    "active:shadow-lg active:scale-95 " +
    "transition-all duration-200 ease-out " +
    "border-2 border-red-500 cursor-pointer " +
    "!h-auto",

  // ✅ NOWE WARIANTY DLA PRZYCISKÓW LOGOWANIA SPOŁECZNOŚCIOWEGO
  login_google:
    "bg-[#DB4437] text-white rounded-md shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " + // ✅ POPRAWKA: Zmiana koloru tekstu na hover dla lepszego kontrastu w trybie jasnym
    "hover:bg-red-600/20 hover:text-foreground hover:backdrop-blur-sm hover:shadow-2xl hover:shadow-red-500/50 " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-1 border-[#DB4437]",
  login_discord:
    "bg-[#5865F2] text-white rounded-md shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " + // ✅ POPRAWKA: Zmiana koloru tekstu na hover dla lepszego kontrastu w trybie jasnym
    "hover:bg-blue-600/20 hover:text-foreground hover:backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/50 " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-1 border-[#5865F2]",
  login_trustpilot:
    "bg-[#00B67A] text-white rounded-md shadow-md " +
    "font-medium text-base px-6 disabled:opacity-60 " +
    "hover:bg-green-600/20 hover:text-foreground hover:backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/50 " +
    "active:shadow-lg " +
    "transition-all duration-200 ease-out " +
    "border-1 border-[#00B67A]",
};

type NewButtonProps = {
  href?: string;
  variant?: keyof typeof VARIANTS;
  icon?: React.ReactNode;
  iconSrc?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  h?: string;
  iconPosition?: 'left' | 'right';
  textColor?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const NewButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  NewButtonProps
>(function NewButton(
  {
    href,
    variant = "primary",
    icon,
    iconSrc,
    children,
    className = "",
    disabled = false,
    type,
    h,
    iconPosition = 'left',
    textColor,
    ...props
  },
  ref
) {
  // 1. Wysokość
  let heightClass = '';
  const hasExplicitHeight = h || HEIGHT_REGEX.test(className);

  if (h) {
    heightClass = `h-${h}`; // Używamy propa 'h' jako priorytet
  } else if (!hasExplicitHeight) {
    heightClass = DEFAULT_HEIGHT_CLASS; // Używamy domyślnej h-9
  }

  // 2. Padding (dodajemy go, jeśli NIE została ustawiona jawna wysokość h-* ani padding py-*)
  let paddingYClass = '';
  const hasExplicitPadding = PADDING_Y_REGEX.test(className);

  if (!hasExplicitHeight && !hasExplicitPadding && !h) {
    paddingYClass = DEFAULT_VERTICAL_PADDING_CLASS;
  }

  const classes = clsx(
    BASE_STYLES,
    VARIANTS[variant],
    heightClass,
    paddingYClass, // Dodawanie paddingu, jeśli nie ma jawnej wysokości/paddingu
    textColor, // Opcjonalny kolor tekstu (API)
    className, // KLASA Z PROPA MA NAJWYŻSZY PRIORYTET
    { "cursor-not-allowed": disabled }
  );

  const content = (
    <>
      {iconPosition === 'left' && icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
      {iconPosition === 'left' && iconSrc && (
        <Image src={iconSrc} alt={`${children} icon`} width={24} height={24} className="mr-2 flex-shrink-0 w-6 h-6" />
      )}
      {children}
      {iconPosition === 'right' && icon && <span className="ml-2 flex-shrink-0">{icon}</span>}
      {iconPosition === 'right' && iconSrc && (
        <Image src={iconSrc} alt={`${children} icon`} width={24} height={24} className="ml-2 flex-shrink-0 w-6 h-6" />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={disabled}
      type={type || "button"}
      {...props}
    >
      {content}
    </button>
  );
});

NewButton.displayName = "NewButton";

export default NewButton;