/**
 * Security event hook for monitoring and optional alerting.
 * Default implementation only logs. Can be extended (e.g. Sentry, Datadog, email) by
 * assigning to onSecurityEvent in a startup module.
 */

import { Logger } from '@/lib/utils/logger';

export type SecurityEventType =
    | 'ACCOUNT_LOCKOUT'
    | 'IP_RATE_LIMIT'
    | 'CSRF_VIOLATION'
    | 'REDIS_LOCKOUT_FAIL_OPEN'
    | 'REDIS_IP_RATE_LIMIT_FAIL_OPEN';

export interface SecurityEventPayload {
    type: SecurityEventType;
    /** Optional identifier (e.g. email, IP) – avoid logging full PII in external systems */
    identifier?: string;
    /** Optional context */
    context?: Record<string, unknown>;
}

function defaultHandler(payload: SecurityEventPayload): void {
    const extra = payload.identifier ?? (payload.context ? JSON.stringify(payload.context) : '');
    Logger.warn('Security', `Security event: ${payload.type}${extra ? ` | ${extra}` : ''}`);
}

/** Set this to plug in external alerting (Sentry, Datadog, etc.). Default: log only. */
export let onSecurityEvent: (payload: SecurityEventPayload) => void = defaultHandler;

export function setSecurityEventHook(hook: (payload: SecurityEventPayload) => void): void {
    onSecurityEvent = hook;
}

export function emitSecurityEvent(payload: SecurityEventPayload): void {
    try {
        onSecurityEvent(payload);
    } catch (err) {
        Logger.error('Security', 'Security event hook threw', err);
    }
}
