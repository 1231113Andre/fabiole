import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

/**
 * Server Component dla głównego contentu
 */
export default function MainContent({ children }: MainContentProps) {
  return (
    <main 
      className="flex-grow main-content-wrapper"
      style={{
        width: '100%',
        backgroundColor: 'var(--background)'
      }}
    >
      {children}
    </main>
  );
}

