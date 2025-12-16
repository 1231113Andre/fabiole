"use client";

import { useEffect } from "react";

export default function ServiceWorkerUnregister() {
  useEffect(() => {
    // Unregister Service Workers in development mode to prevent caching issues
    // Also clear all caches to ensure fresh content
    const clearCacheAndServiceWorkers = async () => {
      // Clear all caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          console.log('All caches cleared');
        } catch (error) {
          console.error('Error clearing caches:', error);
        }
      }

      // Unregister all Service Workers
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map(reg => {
              console.log('Unregistering Service Worker:', reg.scope);
              return reg.unregister();
            })
          );
          console.log('All Service Workers unregistered');
        } catch (error) {
          console.error('Error unregistering Service Workers:', error);
        }
      }
    };

    // Run immediately if document is loaded, otherwise wait for load
    if (document.readyState === "complete") {
      clearCacheAndServiceWorkers();
    } else {
      window.addEventListener("load", clearCacheAndServiceWorkers);
      return () => {
        window.removeEventListener("load", clearCacheAndServiceWorkers);
      };
    }
  }, []);

  return null;
}

