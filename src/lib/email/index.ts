// src/lib/email/index.ts
// Public exports for email module

export { BaseEmailService } from './services/BaseEmailService';
export { VerificationEmailService } from './services/VerificationEmailService';
export { AccountEmailService } from './services/AccountEmailService';
export { VerificationCodeService } from './VerificationCodeService';
export { getResendClient, EMAIL_CONFIG } from './ResendClient';
export { renderVerificationCodeEmail, VerificationCodeEmail } from './templates/VerificationCodeEmail';
export * from './types';
