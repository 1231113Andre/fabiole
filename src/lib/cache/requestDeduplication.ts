/**
 * @fileoverview Request deduplication utility
 * @description Prevents duplicate API calls by caching in-flight requests
 */

/**
 * Map of in-flight requests
 * Key: request identifier (e.g., "user:email@example.com")
 * Value: Promise that resolves to the result
 */
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Deduplicate a request
 * If a request with the same key is already in flight, returns the existing promise
 * Otherwise, executes the function and caches the promise
 * 
 * @param key - Unique identifier for the request
 * @param fn - Function to execute if request is not in flight
 * @returns Promise that resolves to the result
 */
export async function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // Check if request is already in flight
  const existing = inFlightRequests.get(key);
  if (existing) {
    // Removed console.log from hot path for better performance
    return existing as Promise<T>;
  }

  // Create new request
  const promise = fn()
    .then((result) => {
      // Remove from map when done
      inFlightRequests.delete(key);
      return result;
    })
    .catch((error) => {
      // Remove from map on error too
      inFlightRequests.delete(key);
      throw error;
    });

  // Cache the promise
  inFlightRequests.set(key, promise);

  return promise;
}

/**
 * Clear all in-flight requests (for testing/cleanup)
 */
export function clearInFlightRequests(): void {
  inFlightRequests.clear();
}

/**
 * Get number of in-flight requests
 */
export function getInFlightCount(): number {
  return inFlightRequests.size;
}

