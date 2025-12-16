'use client';

import { useEffect } from 'react';

/**
 * Client component that handles auth button clicks
 * For now, just allows normal navigation (no modal system)
 */
export default function NavbarAuthButton() {
  useEffect(() => {
    // This component can be extended later if auth modal is needed
    // For now, it just ensures the buttons work correctly
    return () => {};
  }, []);

  return null;
}

