/**
 * Centralized API Client
 * 
 * Provides unified fetch utilities with consistent error handling,
 * CSRF token management, and type-safe responses.
 */

import { getCsrfToken, waitForCsrfToken } from './hooks/useCsrfToken';

/**
 * Custom API error with status code and optional details
 */
export class ApiError extends Error {
    status: number;
    code?: string;
    details?: Record<string, unknown>;

    constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
    try {
        const data = await response.json();
        return new ApiError(
            data.error || data.message || 'Erro desconhecido',
            response.status,
            data.code,
            data.details
        );
    } catch {
        return new ApiError(
            `Request failed with status ${response.status}`,
            response.status
        );
    }
}

/**
 * Get headers for mutation requests (with CSRF token)
 */
async function getMutationHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Try to get CSRF token, wait up to 500ms if not immediately available
    let csrfToken = getCsrfToken();
    if (!csrfToken) {
        csrfToken = await waitForCsrfToken(500);
    }

    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
}

/**
 * Make a GET request to the API
 * 
 * @param url - API endpoint URL
 * @param options - Additional fetch options
 * @returns Parsed JSON response
 * @throws ApiError on non-200 responses
 */
export async function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        method: 'GET',
        ...options,
    });

    if (!response.ok) {
        throw await parseErrorResponse(response);
    }

    return response.json();
}

/**
 * Make a mutation request (POST, PUT, PATCH, DELETE) to the API
 * Automatically handles CSRF token
 * 
 * @param url - API endpoint URL
 * @param method - HTTP method
 * @param body - Request body (will be JSON stringified)
 * @returns Parsed JSON response
 * @throws ApiError on non-200 responses
 */
export async function apiMutate<T>(
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: unknown
): Promise<T> {
    const headers = await getMutationHeaders();

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await parseErrorResponse(response);

        // Handle CSRF errors with user-friendly message
        if (error.message?.includes('CSRF')) {
            throw new ApiError(
                'Erro de segurança. Por favor, recarrega a página e tenta novamente.',
                error.status,
                'CSRF_ERROR'
            );
        }

        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * Shorthand for POST request
 */
export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
    return apiMutate<T>(url, 'POST', body);
}

/**
 * Shorthand for PUT request
 */
export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
    return apiMutate<T>(url, 'PUT', body);
}

/**
 * Shorthand for DELETE request
 */
export async function apiDelete<T>(url: string): Promise<T> {
    return apiMutate<T>(url, 'DELETE');
}
