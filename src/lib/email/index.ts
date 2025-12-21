// src/lib/email/index.ts
// Public exports for email module

export { EmailService } from './EmailService';
export { VerificationCodeService } from './VerificationCodeService';
export { getResendClient, EMAIL_CONFIG } from './ResendClient';
export { renderVerificationCodeEmail, VerificationCodeEmail } from './templates/VerificationCodeEmail';
export * from './types';
